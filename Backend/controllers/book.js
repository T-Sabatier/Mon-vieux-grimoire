const Book = require ('../models/Book');
const fs = require ('fs');


exports.createBook = (req,res,next)=>{
    const bookObject = JSON.parse (req.body.book);
    delete bookObject._id;
    const book = new Book ({
        ...bookObject,
    })
book.save()
    .then (()=> res.status(201).json ({message : 'Livre enregistré'}))
    .catch (error => res.status (400).json ({error}));
};

exports.modifyBook = (req, res, next) => {
    const bookObject =req.file ?
    {
        ...JSON.parse (req.body.book),
        //image
    } : {...req.body};
    Book.updateOne ({_id: req.params.id},{...bookObject, _id:req.params.id})
        .then (()=> res.status (200).json ({message :'Livre modifié'}))
        .catch (error => res.status (400).json ({error}));
};

exports.deleteBook = (req, res, next) => {
    Book.findOne ({_id: req.params.id})
        .then (thing => {
            const filename = thing.imageUrl.split ('/images/')[1];
            fs.unlink (`images/${filename}`, () => {
                Book.deleteOne ({_id: req.params.id})
                .then (()=> res.status (200).json ({message :'Livre supprimé'}))
                .catch (error => res.status (400).json ({error}));
            })
        })
        .catch(error => res.status(500).json({ error }));
};


exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};