const { Schema, model } = require("mongoose");

const User = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, ref: "Role" },
    avatar: { type: String, required: false },

    likedBooks: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    library: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
});

module.exports = model("User", User);