const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Analytics API is available', endpoints: ['/completions', '/habit-consistency', '/habit-consistency/:habit_id'] });
});

router.get('/completions', (req, res) => res.json([]));
router.get('/habit-consistency', (req, res) => res.json([]));
router.get('/habit-consistency/:habit_id', (req, res) => res.status(501).json({ error: 'Not implemented' }));

module.exports = router;
