const express = require('express');
const router = express.Router();

const { userController } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // все маршруты ниже требуют авторизацию

router.post('/like-book/:bookId', userController.likeBook);
router.post('/add-to-library/:bookId', userController.addToLibrary);
router.post('/update-bg', userController.updateUserBg);
router.get('/combined-books', userController.getUserBooks);

module.exports = router;
