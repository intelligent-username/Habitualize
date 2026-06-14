const express = require('express');
const router = express.Router();

const { runQuery } = require('../services/db');
const queries = require('../queries');

router.post('/pomodoro/start', async (req, res) => {
  try {
    const { goal_duration_minutes, time_started } = req.body;
    const result = await runQuery(queries.MAKE_POMODORO_SESSION, [goal_duration_minutes || 25, time_started || new Date().toISOString(), 0]);
    res.status(201).json({ session_id: result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/pomodoro/finish', async (req, res) => {
  try {
    const { session_id, time_finished, completed, time_completed } = req.body;
    const session = await runQuery(queries.POM_CALC, [session_id], 'one');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    let completedFlag = completed;
    if (!completedFlag && time_completed && time_completed >= session.goal_duration_minutes * 0.95) {
      completedFlag = 1;
    }
    await runQuery(queries.FINISH_POMODORO_SESSION, [time_finished || new Date().toISOString(), completedFlag, time_completed || 0, session_id]);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to finish session' });
  }
});

router.get('/pomodoro/stats', async (req, res) => {
  try {
    const { range, start, week_start_day } = req.query;
    const query = range === 'week' ? queries.FETCH_POMODORO_WEEK
                : range === 'month' ? queries.FETCH_POMODORO_MON
                : range === 'all' ? queries.FETCH_POMODORO_ALL
                : queries.FETCH_POMODORO_DAY;
    const params = start ? [start] : [new Date().toISOString().split('T')[0]];
    if (range === 'week' && start) params.push(start);
    const rows = await runQuery(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/pomodoro/earliest', async (req, res) => {
  try {
    const row = await runQuery(queries.FIND_FIRST_POM, [], 'one');
    res.json({ earliest_date: row ? row.earliest_date : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch earliest date' });
  }
});

router.get('/pomodoro/streaks', async (req, res) => {
  try {
    const dayRows = await runQuery(queries.FETCH_DAY_STREAK);
    const days = new Set(dayRows.map(r => r.d));
    let dayStreak = 0;
    const today = new Date();
    for (let d = new Date(today); days.has(d.toISOString().split('T')[0]); d.setDate(d.getDate() - 1)) {
      dayStreak++;
    }
    const weekRows = await runQuery(queries.FETCH_WEEK_STREAK);
    const weeks = new Set(weekRows.map(r => r.w));
    let weekStreak = 0;
    for (let w = new Date(today); weeks.has(w.toISOString().split('T')[0].slice(0,7).replace('-', '-W')); w.setDate(w.getDate() - 7)) {
      weekStreak++;
    }
    res.json({ current_day_streak: dayStreak, current_week_streak: weekStreak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch streaks' });
  }
});

module.exports = router;
