DROP DATABASE IF EXISTS ytera_db;
CREATE DATABASE ytera_db;
USE ytera_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('ETUDIANT', 'ADMIN') DEFAULT 'ETUDIANT',
    filiere VARCHAR(255),
    etablissement VARCHAR(255),
    ville VARCHAR(255),
    nbEchanges INT DEFAULT 0,
    avatarUrl VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(50)
);

CREATE TABLE ouvrages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    auteur VARCHAR(255),
    isbn VARCHAR(50),
    categorie_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE exemplaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ouvrage_id INT NOT NULL,
    proprietaire_id INT NOT NULL,
    etat ENUM('NEUF', 'BON', 'ACCEPTABLE', 'USE') NOT NULL,
    photoUrl VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ouvrage_id) REFERENCES ouvrages(id) ON DELETE CASCADE,
    FOREIGN KEY (proprietaire_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE annonces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exemplaire_id INT NOT NULL,
    typeEchange ENUM('VENTE', 'PRET', 'DON') NOT NULL,
    prixVente DECIMAL(10, 2),
    nbVues INT DEFAULT 0,
    description TEXT,
    status ENUM('ACTIF', 'ATTENTE', 'EXPIREE') DEFAULT 'ACTIF',
    datePublication DATE,
    FOREIGN KEY (exemplaire_id) REFERENCES exemplaires(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titre VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE favoris (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    annonce_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (annonce_id) REFERENCES annonces(id) ON DELETE CASCADE,
    UNIQUE(user_id, annonce_id)
);

CREATE TABLE demande_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emetteur_id INT NOT NULL,
    recepteur_id INT NOT NULL,
    annonce_id INT NOT NULL,
    message TEXT,
    statut ENUM('ATTENTE', 'ACCEPTEE', 'REFUSEE') DEFAULT 'ATTENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emetteur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recepteur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (annonce_id) REFERENCES annonces(id) ON DELETE CASCADE
);

CREATE TABLE log_moderations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    cible_type VARCHAR(50),
    cible_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE plaintes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plaignant_id INT NOT NULL,
    sujet VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    preuve_url VARCHAR(500),
    status ENUM('OUVERT', 'EN_TRAITEMENT', 'RESOLU') DEFAULT 'OUVERT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plaignant_id) REFERENCES users(id) ON DELETE CASCADE
);
