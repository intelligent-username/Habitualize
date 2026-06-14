const express = require('express');
const router = express.Router();

const { runQuery } = require('../services/db');
const queries = require('../queries');

router.get('/', async (req, res) => {
  try {
    const rows = await runQuery(queries.FETCH_ALL_CATEGORIES);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await runQuery(queries.MAKE_CATEGORY, [name || 'New Category']);
    res.status(201).json({ id: result.id, name: name || 'New Category' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:category_id', async (req, res) => {
  const { category_id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  try {
    await runQuery(queries.UPDATE_CAT_IN_DB, [name, category_id]);
    res.json({ id: Number(category_id), name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to rename category' });
  }
});

router.delete('/:category_id', async (req, res) => {
  const { category_id } = req.params;
  const defaultCategoryId = 1;
  if (Number(category_id) === defaultCategoryId) {
    return res.status(400).json({ error: 'Cannot delete default category' });
  }
  try {
    await runQuery(queries.UPDATE_HAB_CATS, [defaultCategoryId, category_id]);
    await runQuery(queries.DEL_CAT, [category_id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
