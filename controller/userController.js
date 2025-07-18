const User = require('../models/User');
const Book = require('../models/Book');
const {createClient} = require("@supabase/supabase-js"); // не забудь подключить модель Book
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);


class UserController {
    async likeBook(req, res) {
        try {
            const userId = req.user.id;
            const { bookId } = req.params;

            const book = await Book.findOne({ bookId: bookId });
            if (!book) {
                return res.status(404).json({ message: 'Книга не найдена' });
            }

            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { likedBooks: book._id } },
                { new: true }
            );

            return res.json({ message: 'Книга добавлена в понравившиеся' });
        } catch (e) {
            console.error('Ошибка при добавлении в likedBooks:', e);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async addToLibrary(req, res) {
        try {
            const userId = req.user.id;
            const { bookId } = req.params;

            const book = await Book.findOne({ bookId: bookId });
            console.log(book);
            if (!book) {
                return res.status(404).json({ message: 'Книга не найдена' });
            }

            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { library: book._id } },
                { new: true }
            );

            return res.json({ message: 'Книга добавлена в библиотеку' });
        } catch (e) {
            console.error('Ошибка при добавлении в library:', e);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async updateUserBg(req, res) {
        try {
            const userId = req.user.id;

            if (!req.file) {
                return res.status(400).json({ message: 'Файл не загружен' });
            }

            const filePath = `backgrounds/${userId}`;
            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true,
                });

            if (error) throw error;

            const { publicUrl } = supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .getPublicUrl(filePath).data;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { userBg: publicUrl },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            return res.json(updatedUser);
        } catch (e) {
            console.error('Ошибка при обновлении userBg:', e);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getUserBooks(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findById(userId)
                .populate('likedBooks')
                .populate('library');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const allBooks = [...user.likedBooks, ...user.library];
            const uniqueBooksMap = new Map();

            allBooks.forEach((book) => {
                uniqueBooksMap.set(book._id.toString(), book);
            });

            const uniqueBooks = Array.from(uniqueBooksMap.values());

            return res.json(uniqueBooks);
        } catch (e) {
            console.error('Error fetching user books:', e);
            return res.status(500).json({ error: 'Failed to fetch books' });
        }
    }
}

module.exports = new UserController();
