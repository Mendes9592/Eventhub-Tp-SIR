export interface Personne {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  role?: string;
}
export interface Utilisateur extends Personne {
  role: 'UTILISATEUR';
  nbreTicket: number;
  tickets?: Ticket[];
}
export interface Organisateur extends Personne {
  role: 'ORGANISATEUR';
  evenements?: Evenement[];
}
export interface Admin extends Personne {
  role: 'ADMIN';
}
export type AnyUser = Utilisateur | Organisateur | Admin;

export interface Artiste {
  idArtiste: number;
  nom: string;
  prenom: string;
  styleArtistique: string;
  evenements?: Evenement[];
  imageUrl?: string;
}
export interface Evenement {
  id: number;
  nom: string;
  date: string;
  prix: number;
  lieu?: string;
  heure?: string;
  description?: string;
  categorie?: string;
  capacite?: number;
  nbTicketsVendus?: number;
  imageUrl?: string;
  organisateur?: Organisateur;
  artistes?: Artiste[];
  tickets?: Ticket[];
}
export interface Ticket {
  idTicket: number;
  numeroTicket: number;
  statut?: 'VALIDE' | 'UTILISE' | 'ANNULE';
  evenement?: Evenement;
  utilisateur?: Utilisateur;
}
export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest {
  nom: string; prenom: string; username: string; password: string;
  role: 'UTILISATEUR' | 'ORGANISATEUR';
}
export interface AuthResponse { token: string; user: AnyUser; }
export interface Category { id: string; label: string; icon: string; }
