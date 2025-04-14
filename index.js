require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./router/authRouter");
const booksRouter = require("./router/booksRouter");

const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/books", booksRouter);

// Initialize Supabase client


// Start server
const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Server started on port ${port}`));
    } catch (e) {
        console.error("Database connection error:", e);
    }
};

start();
