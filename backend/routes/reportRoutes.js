const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport
} = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/', upload.array('media', 5), createReport);
router.get('/', getAllReports);
router.get('/:id', getReportById);

// Protected routes (Admin only)
router.patch('/:id/status', protect, restrictTo('admin', 'moderator'), updateReportStatus);
router.delete('/:id', protect, restrictTo('admin'), deleteReport);

module.exports = router;