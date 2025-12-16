const Book = require('../models/Book');
const sharp = require('sharp');
const cloudinary = require('../middleware/cloudinary-config');

exports.createBook = async (req, res, next) => {
    try {
        console.log('=== CREATE BOOK START ===');
        console.log('Cloudinary config:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
            api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
        });
        
        const bookObject = JSON.parse(req.body.book);
        const initialGrade = bookObject.ratings && bookObject.ratings[0] ? bookObject.ratings[0].grade : null;

        delete bookObject._id;
        delete bookObject.ratings;
        delete bookObject.averageRating;
        delete bookObject.userId;
        
        console.log('File received:', req.file ? 'YES' : 'NO');
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Optimiser l'image avec Sharp
        console.log('Optimizing image...');
        const optimizedBuffer = await sharp(req.file.buffer)
            .webp({ quality: 20 })
            .toBuffer();
        
        console.log('Image optimized, uploading to Cloudinary...');
        
        // Upload sur Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'Monvieuxgrimoire',
                resource_type: 'image',
                format: 'webp'
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ error: error.message });
                }
                
                console.log('Upload successful:', result.secure_url);
                
                const book = new Book({
                    ...bookObject,
                    userId: req.userId,
                    imageUrl: result.secure_url,
                    ratings: initialGrade ? [{ 
                        userId: req.userId, 
                        grade: Number(initialGrade) 
                    }] : [],
                    averageRating: initialGrade ? Number(initialGrade) : 0
                });
                
                await book.save();
                console.log('Book saved to database');
                res.status(201).json({ message: 'Livre enregistré' });
            }
        );
        
        uploadStream.end(optimizedBuffer);
        
    } catch (error) {
        console.error('=== CREATE BOOK ERROR ===', error);
        res.status(400).json({ error: error.message });
    }
};

exports.modifyBook = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        
        if (book.userId !== req.userId) {
            return res.status(403).json({ message: 'Requête non autorisée' });
        }
        
        if (req.file) {
            // Supprimer l'ancienne image de Cloudinary
            const publicId = book.imageUrl.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(`mon-vieux-grimoire/${publicId}`);
            
            // Optimiser la nouvelle image
            const optimizedBuffer = await sharp(req.file.buffer)
                .webp({ quality: 20 })
                .toBuffer();
            
            // Upload sur Cloudinary
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'mon-vieux-grimoire',
                    resource_type: 'image',
                    format: 'webp'
                },
                async (error, result) => {
                    if (error) {
                        return res.status(500).json({ error: error.message });
                    }
                    
                    const bookObject = {
                        ...JSON.parse(req.body.book),
                        imageUrl: result.secure_url
                    };
                    
                    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
                    res.status(200).json({ message: 'Livre modifié' });
                }
            );
            
            uploadStream.end(optimizedBuffer);
        } else {
            const bookObject = { ...req.body };
            await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
            res.status(200).json({ message: 'Livre modifié' });
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        
        if (book.userId !== req.userId) {
            return res.status(403).json({ message: 'Requête non autorisée' });
        }
        
        // Supprimer l'image de Cloudinary
        const publicId = book.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`mon-vieux-grimoire/${publicId}`);
        
        await Book.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Livre supprimé' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Gardez les autres exports identiques (getOneBook, getAllBooks, rateBook, getBestRatedBooks)
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

exports.rateBook = (req, res, next) => {
    const userId = req.body.userId;
    const rating = req.body.rating;
    
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
    }
    
    Book.findOne({ _id: req.params.id })
        .then(book => {
            const alreadyRated = book.ratings.find(rating => rating.userId === userId);
            if (alreadyRated) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
            }
            
            book.ratings.push({ userId: userId, grade: rating });
            const totalGrades = book.ratings.reduce((somme, rating) => somme + rating.grade, 0);
            book.averageRating = Number((totalGrades / book.ratings.length).toFixed(1));
            
            book.save()
                .then(updatedBook => res.status(200).json(updatedBook))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};