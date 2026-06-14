const express = require('express');
const router = express.Router();

const { runQuery } = require('../services/db');
const queries = require('../queries');
const habitService = require('../services/habitService');

function serializeSeq(row) {
  return { id: row.id, name: row.name, color: row.color, category_id: row.category_id, date_created: row.date_created };
}

async function getHabitProgress(habitRow, date) {
  const progress = { completed: false, value: 0 };
  const habitType = (habitRow.type || '').toLowerCase();
  const isCumulative = habitRow.cumulative_goal != null;
  const habitId = habitRow.id;

  try {
    if (habitType === 'reverse_binary') {
      const row = await runQuery(queries.FETCH_HABIT_COMPLETION_STATUS, [habitId, date], 'one');
      if (!row) {
        await runQuery(queries.MAKE_CONTRIBUTION, [habitId, date, 1, 1]);
        progress.completed = true;
      } else {
        progress.completed = Boolean(row.completed);
      }
      progress.value = progress.completed ? 1 : 0;
    } else if (['counter', 'entry'].includes(habitType)) {
      const sumRow = await runQuery(queries.FETCH_SUM_SO_FAR, [habitId, date], 'one');
      const value = (sumRow && sumRow[0] != null) ? sumRow[0] : 0;
      const target = parseFloat(habitRow.target_value || 1);
      progress.value = value;
      progress.completed = value >= target;
    } else if (isCumulative) {
      try {
        const details = await habitService.getCumulativeProgressDetails(habitId, date);
        if (details) {
          progress.value = details.progress;
          progress.completed = details.is_complete;
        } else {
          const sumRow = await runQuery(queries.FETCH_SUM_SO_FAR, [habitId, date], 'one');
          const value = (sumRow && sumRow[0] != null) ? sumRow[0] : 0;
          progress.value = value;
          progress.completed = false;
        }
      } catch (_) {
        const sumRow = await runQuery(queries.FETCH_SUM_SO_FAR, [habitId, date], 'one');
        const value = (sumRow && sumRow[0] != null) ? sumRow[0] : 0;
        progress.value = value;
        progress.completed = false;
      }
    } else {
      const row = await runQuery(queries.FETCH_COMPLETION, [habitId, date], 'one');
      if (row) {
        progress.completed = Boolean(row.completed);
        progress.value = row.value != null ? row.value : 0;
      }
    }
  } catch (e) {
    console.error(`Progress error for habit ${habitId}:`, e);
  }

  return progress;
}

router.get('/', async (req, res) => {
  try {
    const rows = await runQuery(queries.FETCH_ALL_SEQUENCES);
    res.json(rows.map(serializeSeq));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sequences' });
  }
});

router.get('/by-date/:date', async (req, res) => {
  try {
    const sequences = await runQuery(queries.FETCH_ALL_SEQUENCES);
    if (!sequences || sequences.length === 0) return res.json([]);

    const hydrated = [];
    for (const seq of sequences) {
      const seqData = serializeSeq(seq);
      const habits = await runQuery(queries.FETCH_HABITS_IN_SEQUENCE, [seqData.id]);
      seqData.steps = [];
      if (habits && habits.length > 0) {
        for (const h of habits) {
          const progress = await getHabitProgress(h, req.params.date);
          seqData.steps.push({
            id: h.id,
            step_order: h.step_order,
            name: h.name,
            type: h.type,
            target_value: h.target_value,
            icon: h.icon,
            cumulative: h.cumulative,
            cumulative_goal: h.cumulative_goal,
            cumulative_period: h.cumulative_period,
            completed: progress.completed,
            value: progress.value,
          });
        }
      }
      hydrated.push(seqData);
    }
    res.json(hydrated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sequences by date' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await runQuery(queries.FETCH_SEQUENCE_BY_ID, [req.params.id], 'one');
    if (!row) return res.status(404).json({ error: 'Sequence not found' });
    res.json(serializeSeq(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sequence' });
  }
});

router.get('/:id/habits', async (req, res) => {
  try {
    const rows = await runQuery(queries.FETCH_HABITS_BY_SEQUENCE_ID, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch habits for sequence' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, color, category_id } = req.body;
    const dateCreated = new Date().toISOString().split('T')[0];
    const result = await runQuery(queries.MAKE_SEQUENCE, [name, color || '#4a90d9', category_id || null, dateCreated], 'run');
    res.status(201).json({ id: result.id, message: 'Sequence created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create sequence' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, color, category_id } = req.body;
    const sql = `UPDATE sequences SET name = COALESCE(NULLIF(?, ''), name), color = COALESCE(NULLIF(?, ''), color), category_id = COALESCE(?, category_id) WHERE id = ?`;
    await runQuery(sql, [name || null, color || null, category_id != null ? category_id : null, req.params.id]);
    res.json({ message: 'Sequence updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update sequence' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await runQuery(queries.DEL_HABIT_S, [req.params.id]);
    await runQuery(queries.DEL_SEQ, [req.params.id]);
    res.json({ message: 'Sequence deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete sequence' });
  }
});

module.exports = router;
