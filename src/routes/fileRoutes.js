const express = require('express');
const router = express.Router();
const FileController = require('../controllers/FileController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const file = new FileController();

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit per file
});

router.use(authenticateToken);

router.post('/folder', file.createFolder);
router.post('/upload', upload.single('file'), file.uploadFile);
router.get('/list', file.getFilesList);
router.get('/recent', file.getRecentFiles);
router.get('/favorites', file.getFavorites);
router.put('/:id/favorite', file.toggleFavorite);
router.put('/:id/rename', file.renameFile);
router.post('/:id/copy', file.copyFile);
router.delete('/:id', file.deleteFile);
router.get('/storage-info', file.getStorageInfo);

module.exports = router;