const Books = require("../models/Book");
const path = require("path");

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

class booksController {
    async addBooks(req, res) {
        try {
            const { title, description, author, cycleId, language } = req.body;

            if (!title || !description || !author) {
                return res.status(400).json({ message: "Все поля (кроме cycleId и language) обязательны" });
            }

            const newBook = new Books({ title, description, author, cycleId, language });
            await newBook.save();

            res.json({ message: "Книга успешно добавлена", book: newBook });
        } catch (e) {
            console.log(e);
        }
    }
    async uploadImages(req, res) {
        try {
            console.log("Uploading files:", req.files);

            if (!req.files || !req.files.file || !req.files.cover) {
                return res.status(400).json({ error: "Both book file and cover image are required" });
            }

            if (!process.env.SUPABASE_BUCKET) {
                return res.status(500).json({ error: "Bucket name is missing in environment variables" });
            }

            const { file, cover } = req.files;

            // Retrieve the ID from URL parameters
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "ID is required to name the files" });
            }


            const bookPath = `files/${id}`;
            const coverPath = `cover/${id}_cover`;

            // Upload the book file
            const { data: bookData, error: bookError } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(bookPath, file[0].buffer, {
                    contentType: file[0].mimetype,
                    upsert: false,
                });

            if (bookError) {
                throw bookError;
            }

            // Upload the cover image
            const { data: coverData, error: coverError } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(coverPath, cover[0].buffer, {
                    contentType: cover[0].mimetype,
                    upsert: false,
                });

            if (coverError) {
                throw coverError;
            }

            // Generate public URLs for the files
            const bookUrl = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(bookPath);
            const coverUrl = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(coverPath);

            res.json({
                message: "Upload successful",
                bookUrl,
                coverUrl,
            });
        } catch (err) {
            console.error("Upload error:", err);
            res.status(500).json({ error: err.message });
        }
    }
    async getBooks(req, res) {
        try {
            const { lang } = req?.query;

            const filter = {};
            if (lang) {
                filter.language = lang; // или filter.lang, зависит от того, как у тебя поле в модели
            }

            const result = await Books.find(filter);
            res.json(result);
        } catch (e) {
            console.log(e);
        }
    }
    async getBook(req, res) {
        try {
            const { bookId } = req.params;

            if (!bookId) {
                return res.status(400).json({ error: 'bookId is required' });
            }
            const book = await Books.findOne({ bookId: bookId });
            res.json(book);
        } catch (e) {
            console.log(e);
        }
    }
    async getAllAuthors(req, res) {
        try {
            // Получаем только поле author из всех книг
            const books = await Books.find({}, 'author');

            // Разворачиваем массивы авторов, т.к. author — это массив
            const allAuthors = books.flatMap(book => book.author);

            // Оставляем только уникальные имена авторов
            const uniqueAuthors = [...new Set(allAuthors)];

            res.json({ authors: uniqueAuthors });
        } catch (e) {
            console.error("Error fetching authors:", e);
            res.status(500).json({ error: "Failed to fetch authors" });
        }
    }

}

module.exports = new booksController();