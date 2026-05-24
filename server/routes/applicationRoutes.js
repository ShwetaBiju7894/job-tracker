const router = require('express').Router();
const {
  getApplications, getApplication, createApplication,
  updateApplication, updateStatus, deleteApplication,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',              getApplications);
router.get('/:id',           getApplication);
router.post('/',             createApplication);
router.put('/:id',           updateApplication);
router.patch('/:id/status',  updateStatus);
router.delete('/:id',        deleteApplication);

module.exports = router;