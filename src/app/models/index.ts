// ────────────────────────────────────────────────────────────────
// Interfaces du projet EventHub
// ────────────────────────────────────────────────────────────────

// ─── Classe mère Personne ───────────────────────────────────────

export interface Personne {
  idPersonne?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
}

// ─── Organisateur d'événement ───────────────────────────────────

export interface Organisateur extends Personne {

  nomStructure: string;
  numeroSiret?: string;
  adresseSiege?: string;
  role?: string;
}

// ─── Utilisateur classique ──────────────────────────────────────

export interface Utilisateur extends Personne {

  dateInscription?: string;
  role?: string;
}

// ─── Artiste participant aux événements ─────────────────────────

export interface Artiste {
  // Identifiant artiste
  idArtiste?: number;
  nom: string;
  prenom: string;
  styleArtistique?: string;
  nationalite?: string;
  description?: string;
  popularite?: number;
  siteWeb?: string;
  dateNaissance?: string;
  imageUrl?: string;
}

// ─── Événement principal ────────────────────────────────────────

export interface Evenement {
  // Identifiants 
  id?: number;
  idEvenement?: number;
  nom: string;
  date: string;
  heure?: string;
  genre?: string;
  categorie?: string;
  lieu: string;
  capacite?: number;
  popularite?: number;
  description?: string;
  imageUrl?: string;
  prix?: number;
  nbTicketsVendus?: number;
  organisateur?: Organisateur | null;
  artistes?: Artiste[];
  tickets?: Ticket[];
}

// ─── Ticket de réservation ──────────────────────────────────────

export interface Ticket {
  // Identifiant ticket
  idTicket?: number;
  numeroPlace?: string;
  numeroTicket?: string;
  statut?: "ACHETE" | "ANNULE" | "REMBOURSE" | "UTILISE";
  prixUnitaire?: number;
  dateAchat?: string;
  dateAnnulation?: string;
  dateRemboursement?: string;
  evenement?: Evenement;
  utilisateur?: Utilisateur;
}

// ─── Type utilisateur global ────────────────────────────────────

export type AnyUser = (Utilisateur | Organisateur) & {
  role?: string;
  idPersonne?: number;
};

// ─── Catégories UI ──────────────────────────────────────────────

export interface Category {
  // Identifiant catégorie
  id: string;
  label: string;
  icon: string;
}

// ─── Réponse authentification ───────────────────────────────────

export interface AuthResponse {
  // JWT token
  token: string;
  user: AnyUser;
}

// ─── Requête login ──────────────────────────────────────────────

export interface LoginRequest {
  
  username: string;
  password: string;
}

// ─── Requête inscription ────────────────────────────────────────

export interface RegisterRequest {

  nom: string;
  prenom: string;
  username: string;
  password: string;

  // Type de compte
  role: "UTILISATEUR" | "ORGANISATEUR";
}
