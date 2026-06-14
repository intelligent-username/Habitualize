const express = require('express');
const router = express.Router();

router.get('/export', (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/clear', (req, res) => res.status(501).json({ error: 'Not implemented' }));

module.exports = router;
