const Router = require("express");
const router = new Router();

const booksController = require("../controller/booksController");
const roleMiddleware = require("../middleware/roleMiddleware");

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const path = require('path');



router.get("/", booksController.getBooks);
router.get("/:bookId", booksController.getBook);
router.post("/add", booksController.addBooks);
router.post("/upload/:id",
    roleMiddleware(["ADMIN"]),                      // Only allow ADMIN users
    upload.fields([{ name: 'file' }, { name: 'cover' }]), // Handle two files: book and cover
    booksController.uploadImages
);


module.exports = router;