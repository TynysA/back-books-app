const User = require("../models/User");

class userController {
    async likeBook(req, res) {
        try {
            const userId = req.user.id;
            const { bookId } = req.params;

            // (опционально) проверить, существует ли книга
            const book = await Book.findById(bookId);
            if (!book) return res.status(404).json({ message: 'Книга не найдена' });

            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { likedBooks: bookId } }, // $addToSet — без дубликатов
                { new: true }
            );

            res.json({ message: 'Книга добавлена в понравившиеся' });
        } catch (e) {
            console.error('Ошибка при добавлении в likedBooks:', e);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
    async addToLibrary(req, res) {
        try {
            const userId = req.user.id;
            const { bookId } = req.params;

            const book = await Book.findById(bookId);
            if (!book) return res.status(404).json({ message: 'Книга не найдена' });

            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { library: bookId } },
                { new: true }
            );

            res.json({ message: 'Книга добавлена в библиотеку' });
        } catch (e) {
            console.error('Ошибка при добавлении в library:', e);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
    async updateUserBg(req, res) {
        try {
            const userId = req.user.id;
            const { userBg } = req.body;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { userBg: filePath },
                { new: true } // <<< Вот это важно! Возвращает обновлённого пользователя
            );

            res.json(updatedUser);
        } catch (e) {
            console.error('Ошибка при обновлении userBg:', e);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
    async getUserBooks(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findById(userId)
                .populate('likedBooks') // получаем полную информацию о книге
                .populate('library');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Объединяем likedBooks и library, убираем дубликаты по book._id
            const allBooks = [...user.likedBooks, ...user.library];
            const uniqueBooksMap = new Map();

            allBooks.forEach(book => {
                uniqueBooksMap.set(book._id.toString(), book);
            });

            const uniqueBooks = Array.from(uniqueBooksMap.values());

            res.json(uniqueBooks); // возвращаем массив полных объектов Book
        } catch (e) {
            console.error('Error fetching user books:', e);
            res.status(500).json({ error: 'Failed to fetch books' });
        }
    }
}

module.exports = new userController();