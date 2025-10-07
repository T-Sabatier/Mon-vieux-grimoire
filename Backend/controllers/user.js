// controllers/user.js
const User = require('../User');

// Crée un utilisateur de test au démarrage (sans vérification)
async function createDefaultUser() {
  try {
    const email = 'test@example.com';
    const password = '1234';

    const user = new User({ email, password });
    await user.save();
    console.log('👤 Utilisateur de test créé :', email);
  } catch (err) {
    console.error('❌ Erreur création user de test :', err);
  }
}

module.exports = { createDefaultUser };
