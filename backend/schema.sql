CREATE DATABASE IF NOT EXISTS ytera_db;
USE ytera_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    filiere VARCHAR(255),
    etablissement VARCHAR(255),
    ville VARCHAR(255),
    nbEchanges INT DEFAULT 0,
    avatarUrl VARCHAR(500),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titreAnnonce VARCHAR(255) NOT NULL,
    auteur VARCHAR(255),
    typeEchange ENUM('VENTE', 'PRET', 'DON') NOT NULL,
    prixVente DECIMAL(10, 2),
    etat ENUM('NEUF', 'BON', 'ACCEPTABLE', 'USE') NOT NULL,
    nbVues INT DEFAULT 0,
    photoUrl VARCHAR(500),
    ville VARCHAR(255),
    filiere VARCHAR(255),
    isbn VARCHAR(50),
    nbOperations INT DEFAULT 0,
    datePublication DATE,
    description TEXT,
    proprietaireId INT,
    FOREIGN KEY (proprietaireId) REFERENCES users(id) ON DELETE CASCADE
);
