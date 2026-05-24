const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler  = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/analytics',    require('./routes/analyticsRoutes'));
app.use('/api/ai',           require('./routes/aiRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Job Tracker API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

start();