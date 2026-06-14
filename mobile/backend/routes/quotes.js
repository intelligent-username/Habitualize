const express = require('express');
const router = express.Router();

const { runQuery } = require('../services/db');
const queries = require('../queries');
const { getToday } = require('../services/utils');

router.get('/quote-of-the-day', async (req, res) => {
  try {
    const today = getToday();
    let row = await runQuery(queries.FETCH_QOTD, [today], 'one');
    if (row) return res.json(row);
    let unused = await runQuery(queries.CHOOSE_QOTD);
    if (!unused || unused.length === 0) {
      await runQuery(queries.MARK_QUOTES);
      unused = await runQuery(queries.CHOOSE_QOTD);
    }
    if (!unused || unused.length === 0) {
      return res.json({ quote: 'No quotes available.', source: 'System' });
    }
    const chosen = unused[Math.floor(Math.random() * unused.length)];
    await runQuery(queries.USE_QUOTE, [today, chosen.id]);
    res.json(chosen);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

module.exports = router;
