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
    async uploadFiles(req, res) {
        try {
            console.log("Uploading files:", req.files);

            const { epub, fb2, cover } = req.files;

            if (!epub && !fb2 && !cover) {
                return res.status(400).json({ error: "At least one file (epub, fb2, or cover) must be provided" });
            }

            if (!process.env.SUPABASE_BUCKET) {
                return res.status(500).json({ error: "Bucket name is missing in environment variables" });
            }

            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "ID is required to name the files" });
            }

            const urls = {};

            // Upload EPUB file if exists
            if (epub && epub.length > 0) {
                const epubPath = `epub/${id}.epub`;
                const { data, error } = await supabase.storage
                    .from(process.env.SUPABASE_BUCKET)
                    .upload(epubPath, epub[0].buffer, {
                        contentType: epub[0].mimetype,
                        upsert: true,
                    });
                if (error) throw error;

                urls.epubUrl = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(epubPath).data.publicUrl;
            }

            // Upload FB2 file if exists
            if (fb2 && fb2.length > 0) {
                const fb2Path = `fb2/${id}.fb2`;
                const { data, error } = await supabase.storage
                    .from(process.env.SUPABASE_BUCKET)
                    .upload(fb2Path, fb2[0].buffer, {
                        contentType: fb2[0].mimetype,
                        upsert: true,
                    });
                if (error) throw error;

                urls.fb2Url = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fb2Path).data.publicUrl;
            }

            // Upload cover
            if (cover && cover.length > 0) {
                const coverPath = `cover/${id}_cover`;
                const {data: coverData, error: coverError} = await supabase.storage
                    .from(process.env.SUPABASE_BUCKET)
                    .upload(coverPath, cover[0].buffer, {
                        contentType: cover[0].mimetype,
                        upsert: true,
                    });
                if (coverError) throw coverError;

                urls.coverUrl = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(coverPath).data.publicUrl;
            }
            res.json({
                message: "Upload successful",
                uploaded: Object.keys(urls).length > 0 ? urls : "Nothing uploaded",
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