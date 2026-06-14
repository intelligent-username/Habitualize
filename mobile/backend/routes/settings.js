const express = require('express');
const router = express.Router();

const { runQuery } = require('../services/db');
const queries = require('../queries');

router.get('/', async (req, res) => {
  try {
    const rows = await runQuery(queries.FETCH_ALL_SETTINGS);
    const settings = rows.map(r => ({ key: r.setting_key, value: r.setting_value, type: r.setting_type, description: r.description }));
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/', async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  try {
    for (const [key, val] of Object.entries(data)) {
      const existing = await runQuery(queries.FETCH_SETTING_BY_KEY, [key.toLowerCase()], 'one');
      let settingKey = key.toLowerCase();
      let value = val;
      let type = 'string';
      if (['default_category_id', 'default_sequence_count', 'week_start_day'].includes(settingKey)) {
        type = 'integer';
        value = parseInt(val, 10);
      } else if (['show_habit_icons', 'filter_completed_to_bottom'].includes(settingKey)) {
        type = 'boolean';
      } else if (settingKey === 'notification_settings') {
        type = 'json';
      }
      const strValue = type === 'json' ? JSON.stringify(value) : String(value);
      if (existing) {
        await runQuery(queries.UPDATE_SETTING, [strValue, type, settingKey]);
      } else {
        await runQuery(queries.MAKE_SETT, [settingKey, strValue, type]);
      }
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.get('/:setting_key', async (req, res) => {
  try {
    const row = await runQuery(queries.FETCH_SETTING_BY_KEY, [req.params.setting_key.toLowerCase()], 'one');
    if (!row) return res.status(404).json({ error: 'Setting not found' });
    res.json({ key: req.params.setting_key, value: row.setting_value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

router.get('/week_start_day', async (req, res) => {
  try {
    const row = await runQuery(queries.FETCH_SETTING_BY_KEY, ['week_start_day'], 'one');
    res.json({ week_start_day: row ? parseInt(row.setting_value, 10) : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch week_start_day' });
  }
});

module.exports = router;
