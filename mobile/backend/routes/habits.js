const express = require('express');
const router = express.Router();

const { runQuery } = require('../services/db');
const queries = require('../queries');
const habitService = require('../services/habitService');
const { extractData, getToday } = require('../services/utils');

// POST /habits – add habit
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const columns = ['sequence_id','step_order','name','type','target_value','cumulative','cumulative_goal','cumulative_period','icon'];
    if (!data.icon) data.icon = 'default.svg';
    const vals = extractData(data, columns);
    const habitType = (data.type || '').toLowerCase();
    const targetValue = data.target_value !== undefined ? data.target_value : 1;
    const cumulativeGoal = data.cumulative_goal;
    const isCumulative = cumulativeGoal !== undefined && cumulativeGoal !== null;
    if (isCumulative) {
      if (typeof cumulativeGoal !== 'number' || cumulativeGoal <= 0) {
        return res.status(400).json({ error: 'Cumulative habits must have a positive goal value.' });
      }
      const period = (data.cumulative_period || '').trim();
      if (!['day','week','weekly','month','monthly'].includes(period)) {
        return res.status(400).json({ error: 'Cumulative habits must have a valid period (day, week, weekly, month, or monthly).' });
      }
    } else if (['counter','total'].includes(habitType)) {
      if (typeof targetValue === 'number' && targetValue <= 0) {
        return res.status(400).json({ error: 'Counter and total habits must have positive target values.' });
      }
    }
    const finalVals = [
      vals[0], vals[1], vals[2], vals[3], vals[4],
      getToday(),
      vals[5], vals[6], vals[7], vals[8]
    ];
    const result = await runQuery(queries.MAKE_HABIT, finalVals, 'run');
    res.status(201).json({ id: result.id, message: 'New habit added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add habit' });
  }
});

router.delete('/:habit_id', async (req, res) => {
  const { habit_id } = req.params;
  try {
    await runQuery(queries.DEL_HABIT, [habit_id]);
    await runQuery(queries.DEL_HISTORY, [habit_id]);
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

router.get('/:habit_id/history', async (req, res) => {
  const { habit_id } = req.params;
  try {
    const rows = await runQuery(queries.FETCH_HABIT_HISTORY, [habit_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch habit history' });
  }
});

router.get('/:habit_id/cumulative-progress', async (req, res) => {
  const { habit_id } = req.params;
  const date = req.query.date || getToday();
  try {
    const progress = await habitService.getCumulativeProgressDetails(habit_id, date);
    if (!progress) {
      return res.status(404).json({ error: 'This habit does not have a valid cumulative goal or period.' });
    }
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get cumulative progress' });
  }
});

router.put('/:habit_id/history', async (req, res) => {
  const { habit_id } = req.params;
  const { date, completed = 0, value = 0 } = req.body;
  try {
    const result = await habitService.updateHabitCompletionStatus(habit_id, date || getToday(), completed, value);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update habit completion' });
  }
});

router.put('/:habit_id', async (req, res) => {
  const { habit_id } = req.params;
  const payload = req.body;
  try {
    const result = await habitService.updateHabitDetails(habit_id, payload);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

module.exports = router;
