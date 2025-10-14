const express = require('express');
const router = express.Router();

const bookCtrl = require ('../controllers/book');
const auth = require ('../middleware/auth');
const multer = require ('../middleware/multer-congif');

router.post ('/', auth, multer,bookCtrl.createBook);
router.put ('/:id', auth,multer,stuffCtrl.modifyBook);
router.delete ('/:id', auth,stuffCtrl.deleteBook);
router.get ('/:id', auth, bookCtrl,getOneBook);
router.get ('/', auth,stuffCtrl.getAllBooks);

module.exports = router;
