const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { UPLOADS_DIR } = require('../db');
const { requireAuth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max after compression
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

router.post('/', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({
    id: crypto.randomUUID(),
    filename: req.file.filename,
    takenAt: new Date().toISOString(),
  });
});

module.exports = router;
