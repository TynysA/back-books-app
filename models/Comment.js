const { Schema, model } = require('mongoose');

const CommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Автор комментария
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },  // К какой книге
    text: { type: String, required: true },                               // Текст комментария
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // Для подкомментов
    createdAt: { type: Date, default: Date.now },                        // Дата создания
    likes: { type: Number, default: 0 }                                   // Кол-во лайков
});

module.exports = model('Comment', CommentSchema);
