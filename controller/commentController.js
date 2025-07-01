const Comment = require("../models/Comment");
const Book = require("../models/Book");

class commentsController {
    // Добавить новый комментарий или подкомментарий
    async addComment(req, res) {
        try {
            const userId = req.user.id;
            const { bookId, text, parentCommentId } = req.body;

            // Проверка: существует ли книга
            const book = await Book.findById(bookId);
            if (!book) {
                return res.status(404).json({ message: "Книга не найдена" });
            }

            const newComment = new Comment({
                user: userId,
                book: bookId,
                text,
                parentComment: parentCommentId || null,
            });

            await newComment.save();

            res.status(201).json({ message: "Комментарий добавлен", comment: newComment });
        } catch (e) {
            console.error("Ошибка при добавлении комментария:", e);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    // Получить все комментарии к книге (с вложенностью)
    async getCommentsByBook(req, res) {
        try {
            const { bookId } = req.params;

            const comments = await Comment.find({ book: bookId })
                .populate('user', 'username avatar') // Подгружаем инфу о пользователе
                .lean();

            // Собираем дерево комментариев
            const buildTree = (allComments, parentId = null) => {
                return allComments
                    .filter(comment => String(comment.parentComment) === String(parentId))
                    .map(comment => ({
                        id: comment._id,
                        author: {
                            id: comment.user._id,
                            username: comment.user.username,
                            avatar: comment.user.avatar,
                        },
                        text: comment.text,
                        createdAt: comment.createdAt,
                        likes: comment.likes,
                        replies: buildTree(allComments, comment._id),
                    }));
            };

            const tree = buildTree(comments);

            res.json(tree);
        } catch (e) {
            console.error("Ошибка при получении комментариев:", e);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    // Лайкнуть комментарий
    async likeComment(req, res) {
        try {
            const { commentId } = req.params;

            const updatedComment = await Comment.findByIdAndUpdate(
                commentId,
                { $inc: { likes: 1 } }, // Увеличиваем количество лайков
                { new: true }
            );

            if (!updatedComment) {
                return res.status(404).json({ message: "Комментарий не найден" });
            }

            res.json({ message: "Лайк добавлен", comment: updatedComment });
        } catch (e) {
            console.error("Ошибка при лайке комментария:", e);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

module.exports = new commentsController();
