const router = require('express').Router();
const { getSummary, getWeeklyTrend, getPipeline } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary',  getSummary);
router.get('/weekly',   getWeeklyTrend);
router.get('/pipeline', getPipeline);

module.exports = router;