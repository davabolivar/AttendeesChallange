const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const workerController = require('../controllers/workerController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/upload/worker', upload.single('file'), workerController.handleUpload);

module.exports = router;
