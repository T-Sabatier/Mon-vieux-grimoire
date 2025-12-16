const express = require('express');
const router = express.Router();

const bookCtrl = require ('../controllers/book');
const auth = require ('../middleware/auth');
const multer = require ('../middleware/multer-config');

router.get ('/bestrating', bookCtrl.getBestRatedBooks);

//Routes publiques
router.get ('/:id', bookCtrl.getOneBook);
router.get ('/', bookCtrl.getAllBooks);

//Routes protégées
router.post('/', (req, res, next) => {
    console.log('=== POST /api/books ROUTE CALLED ===');
    next();
}, auth, multer, bookCtrl.createBook);
router.put ('/:id', auth,multer,bookCtrl.modifyBook);
router.delete ('/:id', auth,bookCtrl.deleteBook);
router.post ('/:id/rating', auth,bookCtrl.rateBook);

module.exports = router;
