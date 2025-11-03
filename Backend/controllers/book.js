const Book = require ('../models/Book');
const fs = require ('fs');


exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    const initialGrade = bookObject.ratings && bookObject.ratings[0] ? bookObject.ratings[0].grade : null;

    delete bookObject._id;
    delete bookObject.ratings;
    delete bookObject.averageRating;
    delete bookObject.userId;
    
    const book = new Book({
        ...bookObject,
        userId: req.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        ratings: initialGrade ? [{ 
            userId: req.userId, 
            grade: Number(initialGrade) 
        }] : [],
        averageRating: initialGrade ? Number(initialGrade) : 0
    });

    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré' }))
        .catch(error => res.status(400).json({ error }));
};


exports.modifyBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            //Vérification propriétaire
            if (book.userId !== req.userId) {
                return res.status(403).json({ message: 'Requête non autorisée' });
            }
            
            //Construire l'objet
            const bookObject = req.file ? {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            } : { ...req.body };
            
            //Supprimer ancienne image si nouvelle
            if (req.file) {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.log(err);
                });
            }
            
            //Mettre à jour
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Livre modifié' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
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

exports.rateBook = (req, res,next) => {
   
    const userId = req.body.userId;
    const rating =req.body.rating;
    const bookId =req.params.id;
     
    if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
}
    Book.findOne({ _id: req.params.id })
    .then(book => {
        // Vérifier si déjà noté
        const alreadyRated = book.ratings.find(rating => rating.userId === userId);
        if (alreadyRated) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
        }
        
        // Ajouter la note
        book.ratings.push({ userId: userId, grade: rating });
        
        // Calculer la moyenne
        const totalGrades = book.ratings.reduce((somme, rating) => somme + rating.grade, 0);
        book.averageRating = Number((totalGrades / book.ratings.length).toFixed(1)); // une décimale
        
        // Sauvegarder
        book.save()
            .then(updatedBook => res.status(200).json(updatedBook))
            .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
}

exports.getBestRatedBooks = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 }) //Trie par note plus grand au plus petit
        .limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};
