# 🎵 EventHub — Application de Gestion d'Événements

![Angular](https://img.shields.io/badge/Angular-18-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![Java](https://img.shields.io/badge/Java-JPA-orange?logo=java)
![License](https://img.shields.io/badge/License-MIT-green)

> Plateforme de gestion et de réservation d'événements musicaux — développée avec Angular 18 (frontend) et Java JPA (backend).

---

## 📸 Aperçu

| Page | Description |
|------|-------------|
| 🏠 Accueil | Liste des événements avec filtres par catégorie et recherche |
| 🎫 Mes Tickets | Portefeuille de billets avec QR code et annulation |
| 🎤 Artistes | Galerie des artistes et leurs événements |
| 🎭 Détail Événement | Page complète avec réservation en 3 étapes |
| ⚙️ Organisateur | CRUD complet des événements (rôle protégé) |
| 🔐 Admin | Dashboard KPIs et gestion globale (rôle protégé) |

---

## 🚀 Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org) v18 ou v20
- [Angular CLI](https://angular.dev/tools/cli) v18

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/VOTRE_USERNAME/eventhub-angular.git
cd eventhub-angular

# Installer les dépendances
npm install

# Lancer le serveur de développement
ng serve
```

L'application sera disponible sur **http://localhost:4200**

---

## 🔐 Comptes de démonstration

| Utilisateur | Mot de passe | Rôle |
|-------------|-------------|------|
| `admin` | n'importe lequel | Admin |
| `sophie` | n'importe lequel | Utilisateur |
| `jean` | n'importe lequel | Organisateur |

---

## 🏗️ Architecture du projet

```
src/
├── app/
│   ├── core/
│   │   └── guards/              # AuthGuard, AdminGuard, OrganisateurGuard
│   ├── models/
│   │   └── index.ts             # Interfaces alignées sur les entités JPA
│   ├── services/
│   │   ├── auth.service.ts      # Authentification & gestion session
│   │   ├── evenement.service.ts # CRUD événements + filtres + signals
│   │   ├── ticket.service.ts    # Achat / annulation de billets
│   │   ├── artiste.service.ts   # Gestion des artistes
│   │   └── toast.service.ts     # Notifications globales
│   ├── components/
│   │   ├── navbar/              # Navigation dynamique selon le rôle
│   │   ├── hero/                # Bannière avec barre de recherche
│   │   ├── stats-bar/           # Statistiques en temps réel
│   │   ├── category-filter/     # Filtres par catégorie musicale
│   │   ├── event-card/          # Carte événement cliquable
│   │   ├── event-list/          # Grille des événements filtrés
│   │   ├── reservation-modal/   # Modal de réservation en 3 étapes
│   │   └── toast/               # Notifications toast
│   └── pages/
│       ├── home/                # Page d'accueil
│       ├── login/               # Connexion
│       ├── register/            # Inscription avec choix de rôle
│       ├── tickets/             # Mes billets + annulation
│       ├── event-detail/        # Détail complet d'un événement
│       ├── artiste-detail/      # Galerie des artistes
│       ├── organisateur/        # Espace organisateur (CRUD)
│       └── admin/               # Panneau d'administration
└── styles.scss                  # Variables CSS globales (palette de couleurs)
```

---

## 🗃️ Entités JPA (Backend)

Le frontend est aligné sur les entités Java suivantes :

```
Personne (abstract)
├── Utilisateur     → nbreTicket, List<Ticket>
├── Organisateur    → List<Evenement>
└── Admin           → gererEvenement()

Evenement           → nom, date, prix, Organisateur, List<Artiste>, List<Ticket>
Artiste             → nom, prenom, styleArtistique, List<Evenement>
Ticket              → numeroTicket, Evenement, Utilisateur
```

---

## 🎨 Palette de couleurs

| Variable | Couleur | Usage |
|----------|---------|-------|
| `--red` | `#C82909` | Couleur principale / boutons |
| `--pink` | `#FCC6BB` | Accents doux / badges |
| `--beige` | `#E7DED9` | Fond / arrière-plans |
| `--dark` | `#2D211C` | Textes / titres |

---

## 🔌 Connexion au Backend Spring Boot

Les services sont prêts à être connectés à une API REST. Remplacez la simulation dans chaque service par des appels HTTP :

```typescript
// Exemple dans evenement.service.ts
// Remplacer les données mock par :
getEvenements() {
  return this.http.get<Evenement[]>('http://localhost:8080/api/evenements');
}
```

Endpoints attendus :

```
GET    /api/evenements          → Liste tous les événements
GET    /api/evenements/:id      → Détail d'un événement
POST   /api/evenements          → Créer un événement (ORGANISATEUR)
PUT    /api/evenements/:id      → Modifier un événement
DELETE /api/evenements/:id      → Supprimer un événement (ADMIN)

GET    /api/artistes            → Liste tous les artistes

GET    /api/tickets             → Tickets de l'utilisateur connecté
POST   /api/tickets             → Acheter un ticket
DELETE /api/tickets/:id         → Annuler un ticket

POST   /api/auth/login          → Connexion → JWT token
POST   /api/auth/register       → Inscription
```

---

## 🛠️ Technologies utilisées

| Technologie | Version | Usage |
|-------------|---------|-------|
| Angular | 18 | Framework frontend |
| TypeScript | 5.4 | Langage principal |
| Angular Signals | 18 | Gestion d'état réactive |
| SCSS | - | Styles avec variables CSS |
| Angular Router | 18 | Navigation & guards |
| Java JPA | - | Modèle de données backend |
| HSQLDB | 2.7.2 | Base de données embarquée |

---

## 📦 Scripts disponibles

```bash
npm start          # Lance le serveur de dev (ng serve)
npm run build      # Build de production
ng generate component nom   # Créer un nouveau composant
```

---

## 👥 Auteurs

Projet réalisé dans le cadre du cours **SIR — ISTIC MIAGE 1**

---

## 📄 Licence

Ce projet est sous licence MIT.
