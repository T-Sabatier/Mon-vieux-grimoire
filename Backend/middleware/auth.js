const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE ===');
    console.log('Authorization header:', req.headers.authorization ? 'PRESENT' : 'MISSING');
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: error || 'Requête non authentifiée !' });
  }
};