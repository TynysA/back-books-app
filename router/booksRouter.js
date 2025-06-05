const Router = require("express");
const router = new Router();

const booksController = require("../controller/booksController");
const roleMiddleware = require("../middleware/roleMiddleware");

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });



router.get("/", booksController.getBooks);
router.get("/authors", booksController.getAllAuthors);
router.get("/:bookId", booksController.getBook);




router.post("/add", booksController.addBooks);
router.post("/upload/:id",
    roleMiddleware(["ADMIN"]),                      // Only allow ADMIN users
    upload.fields([{ name: 'file' }, { name: 'cover' }]), // Handle two files: book and cover
    booksController.uploadImages
);


module.exports = router;