const express = require('express');
const router = express.Router();
const multer = require('multer');
const AttendanceController = require('../controllers/attendanceController');

// setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const mainController = require('../controllers/mainController');

// Rute import data absensi
router.post('/upload/attendance', upload.single('file'), AttendanceController.handleUpload);
router.get('/rekap', mainController.getAttendanceRekap);

// (nanti) Rute summary
// router.get('/summary', AttendanceController.getSummary);

module.exports = router;
