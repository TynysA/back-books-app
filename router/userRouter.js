const express = require('express');
const router = express.Router();

const  userController  = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware); // все маршруты ниже требуют авторизацию

router.post('/like-book/:bookId', userController.likeBook);
router.post('/add-to-library/:bookId', userController.addToLibrary);
router.post('/update-bg', upload.single('file'), userController.updateUserBg);
router.get('/combined-books', userController.getUserBooks);

module.exports = router;
