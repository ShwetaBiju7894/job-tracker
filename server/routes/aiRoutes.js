const router = require('express').Router();
const { getCoverLetterTips, getInterviewPrep } = require('../services/aiService');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/cover-letter', async (req, res, next) => {
  try {
    const result = await getCoverLetterTips(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/interview-prep', async (req, res, next) => {
  try {
    const result = await getInterviewPrep(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;