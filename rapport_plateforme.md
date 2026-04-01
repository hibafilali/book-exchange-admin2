# Dossier de Présentation Détaillé : Plateforme yTera

Ce document constitue le support de présentation complet de la plateforme **yTera**, une solution innovante de bourse aux manuels scolaires d'occasion dédiée aux étudiants marocains.

---

## 1. Introduction et Vision du Projet

**yTera** est née d'un constat simple : le coût élevé des manuels universitaires neufs représente un frein à l'éducation. La plateforme facilite l'économie circulaire au sein des campus en permettant aux étudiants d'échanger, de prêter ou de vendre leurs manuels.

### Objectifs Clés :
- **Accessibilité :** Réduire les coûts de scolarité.
- **Proximité :** Favoriser la remise en main propre (Cité U, Bibliothèques).
- **Éthique :** Limitation stricte des prix pour éviter la spéculation (Plafond de 110 DH).
- **Éco-responsabilité :** Donner une seconde vie aux ouvrages.

---

## 2. Architecture et Technologies

La plateforme repose sur une stack moderne garantissant performance et fluidité :
- **Frontend :** React.js (Vite) pour une interface réactive.
- **Stylisation :** CSS Modules (Vanilla CSS) pour un design premium et contrôlé.
- **Animations :** Framer Motion pour des transitions fluides et micro-interactions.
- **Iconographie :** Lucide React pour une interface visuelle épurée.
- **Backend :** API RESTful (Node.js/Express) avec authentification JWT sécurisée.

---

## 3. Espace Public (Vitrine & Accès)

### 3.1 La Landing Page Interactive
Véritable porte d'entrée, elle utilise un design immersif.
- **Composant "Proximity Map" :** Une carte du Maroc interactive (SVG calibré) mettant en avant les nœuds universitaires (Tanger, Rabat, Casa, Fès, etc.).
- **Value Proposition :** Sections détaillant le concept "Zéro Commission" et la remise en main propre.

![Capture d'écran - Landing Page]()
*Notes : Focus sur la carte animée et les CTA (Appels à l'action).*

### 3.2 L'Authentification Sécurisée
- **Login/Register :** Formulaires optimisés avec validation en temps réel.
- **Gestion des Rôles :** Redirection intelligente selon le profil (Étudiant ou Administrateur) via des Middleware de protection de routes.

![Capture d'écran - Authentification]()
*Notes : Présentation du design "Glassmorphism" des formulaires.*

---

## 4. Espace Étudiant (Cœur de la Plateforme)

### 4.1 L'Explorateur d'Annonces (Search Explorer)
Le catalogue central permettant de trouver des livres via :
- **Recherche Instantanée :** Filtrage par titre ou auteur.
- **Filtres Avancés :** Tris par **Filière** (Info, Droit, Médecine, etc.), **Niveau** (L1, Master, ...) et **Ville**.
- **Aperçu Rapide :** Cartes de livres (ManualCard) affichant l'état (Neuf, Bon, etc.) et le prix.

![Capture d'écran - Explorateur]()
*Notes : Détails sur l'ergonomie de la barre de filtres.*

### 4.2 Le Processus de Publication "Zero-Scroll"
Un assistant de création d'annonce optimisé en 3 étapes :
1.  **Le Manuel :** Saisie rapide via ISBN (auto-complétion mockée) ou manuelle.
2.  **L'Exemplaire :** Upload de photos (preuve d'état) et choix de la ville.
3.  **L'Offre :** Type de transaction (Vente, Prêt, Don). **Règle métier :** Le prix est plafonné à 110 DH pour préserver l'esprit social.

![Capture d'écran - Publication]()
*Notes : Montrer le stepper animé et l'aperçu dynamique de l'annonce.*

### 4.3 Système de Messagerie (Chat)
Communication directe entre acheteurs et vendeurs.
- **Flux :** Un clic sur "Contacter le vendeur" ouvre une fenêtre de messagerie dédiée.
- **Fonctions :** Historique des conversations, notifications de nouveaux messages.

![Capture d'écran - Chat]()
*Notes : Interface de type messagerie moderne.*

### 4.4 Dashboard Personnel
Gestion du cycle de vie des annonces.
- **Statut des annonces :** Actives, Vendues, Masquées.
- **Statistiques :** Nombre de vues et d'interactions sur ses propres livres.

---

## 5. Espace Administration (Contrôle & Sécurité)

### 5.1 Dashboard de Pilotage
Vue holistique du système.
- **KPIs :** Graphiques sur la croissance des utilisateurs et le volume des transactions.
- **Santé du système :** Monitoring des dernières activités.

![Capture d'écran - Admin Dashboard]()

### 5.2 Modération et Gestion de Contentieux
- **Gestion des Annonces :** Possibilité de supprimer des annonces ne respectant pas les règles (ex: prix > 110 DH).
- **Gestion des Utilisateurs :** Contrôle des accès, bannissement en cas d'abus.

![Capture d'écran - Modération]()

---

## 6. Flux Utilisateur Type (User Journey)

1.  **Découverte :** L'étudiant arrive sur la Landing Page.
2.  **Recherche :** Il cherche un livre d'Informatique sur Casablanca.
3.  **Consultation :** Il consulte les photos et l'état du livre.
4.  **Action :** Il contacte le vendeur via le Chat intégré.
5.  **Transaction :** Rencontre physique sur le campus pour l'échange (0 frais).

---

## 7. Synthèse des Points Forts

| Fonctionnalité | Avantage Concurrentiel |
| :--- | :--- |
| **Carte de Proximité** | Visualisation immédiate des stocks locaux. |
| **Plafond 110 DH** | Garantie d'accessibilité financière. |
| **Logic ISBN** | Gain de temps lors de la publication. |
| **Design High-Density** | Interface moderne, rapide et "Zero-Scroll". |
