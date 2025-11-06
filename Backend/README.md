## Description

Mon Vieux Grimoire est le back-end d'un site de référencement et de notation de livres pour une chaîne de libraires. 
L'API permet aux utilisateurs de s'inscrire, se connecter, ajouter des livres avec leurs notes, noter les livres d'autres utilisateurs et consulter les meilleures notations.

## Prérequis

- **Node.js (v14 ou supérieur)**
- **npm**
- **Compte MongoDB Atlas (ou MongoDB local)**
- **Repo cloner du front end et installer (npm install)** : 
```bash 
git clone https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres.git 
cd frontend
npm install
npm start
```

## Technologies Utilisées

  ### Backend
- **Node.js** : Environnement d'exécution JavaScript
- **Express** : Framework web pour Node.js
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB

### Sécurité
- **Bcrypt** : Hachage des mots de passe (10 rounds de salage)
- **JWT (jsonwebtoken)** : Authentification par tokens
- **dotenv** : Gestion des variables d'environnement
- **mongoose-unique-validator** : Validation de l'unicité des emails

### Gestion des Images
- **Multer** : Middleware pour l'upload de fichiers
- **Sharp** : Compression et conversion des images en WebP

### Étapes

**1. Initialiser un depôt Git depuis dossier backend**
```bash
git init
```
N'oubliez pas de créer un fichier **.gitignore** contenant les lignes **node_modules, .env et images/** afin de ne pas envoyer ces  dossiers  (qui deviendront volumineux) vers votre dépôt distant.

**2. Installer les packages nécessaires**
```bash
npm init -y
npm install express
npm install mongoose
npm install bcrypt
npm install cors
npm install jsonwebtoken
npm install dotenv
npm install multer
npm install sharp
npm install mongoose-unique-validator
npm install -g nodemon
```

**3. Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :
```env
MONGODB_URI=votre_uri_mongodb_atlas
JWT_SECRET=votre_clé_secrète_jwt
PORT=4000
```

**Exemple :**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mon-vieux-grimoire
JWT_SECRET=RANDOM_TOKEN_SECRET_12345
PORT=4000
