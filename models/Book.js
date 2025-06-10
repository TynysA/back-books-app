const { Schema, model } = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const BookSchema = new Schema({
    title: { type: String, required: true }, // Название книги
    description: { type: String, required: true }, // Описание книги
    author: [{ type: String, required: true }], // Автор
    cycleId: { type: Number, required: false }, // ID цикла (если есть)
    language: { type: String, required: false },

    // Not required
    epubUrl: { type: String },
    fb2Url: { type: String },
    coverUrl: { type: String },

    genres: [{ type: String }],
    tags: [{ type: String }],
    pages: { type: Number },
    year: { type: Number },
    publisher: { type: String },
    isbn: { type: String },
    likes: { type: Number, default: 0 },
    addedToLibraryCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// 🔥 Автоинкремент ID
BookSchema.plugin(AutoIncrement, { inc_field: "bookId" });

module.exports = model("Book", BookSchema);
