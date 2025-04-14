const { Schema, model } = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const BookSchema = new Schema({
    title: { type: String, required: true }, // Название книги
    description: { type: String, required: true }, // Описание книги
    author: [{ type: String, required: true }], // Автор
    cycleId: { type: Number, required: false }, // ID цикла (если есть)
    language: { type: String, required: false },
});

// 🔥 Автоинкремент ID
BookSchema.plugin(AutoIncrement, { inc_field: "bookId" });

module.exports = model("Book", BookSchema);
