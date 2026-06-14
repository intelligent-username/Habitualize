const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const habitRoutes = require('./routes/habits');
const categoryRoutes = require('./routes/categories');
const sequenceRoutes = require('./routes/sequences');
const quoteRoutes = require('./routes/quotes');
const dataRoutes = require('./routes/data');
const analyticsRoutes = require('./routes/analytics');
const pomodoroRoutes = require('./routes/pomodoro');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

app.use('/habits', habitRoutes);
app.use('/categories', categoryRoutes);
app.use('/sequences', sequenceRoutes);
app.use('/api', quoteRoutes);
app.use('/data', dataRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/api', pomodoroRoutes);
app.use('/settings', settingsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Habitualize API is running.' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
