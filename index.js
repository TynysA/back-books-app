require("dotenv").config();
// WARNING: for local development only!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./router/authRouter");
const booksRouter = require("./router/booksRouter");
const userRouter = require("./router/userRouter");
const cors = require("cors");
const corsOptions = {
    origin: ['http://localhost:8000','http://localhost:8002', 'https://your-frontend-app.vercel.app' ], // 👈 добавь сюда домен фронта
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};


const app = express();
const port = 3000;

app.use(cors(corsOptions));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/books", booksRouter);
app.use('/user', userRouter)

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
