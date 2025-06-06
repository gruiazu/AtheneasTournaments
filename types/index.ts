import { Timestamp } from 'firebase/firestore';

export interface UserData {
  uid: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  isAdmin?: boolean; // <-- Añade esta línea
}

export interface Tournament {
  id?: string; // Firestore document ID
  name: string;
  maxParticipants: number;
  date: Timestamp;
  gameName: string;
  creatorUid: string;
  participants?: string[]; // Array of user UIDs
  status: 'abierto' | 'en curso' | 'finalizado'; // Por defecto "abierto"
}

// Para el contexto de autenticación
export interface AuthContextType {
  user: import('firebase/auth').User | null;
  userData: UserData | null; // Datos adicionales del usuario desde Firestore
  isAdmin: boolean;
  loading: boolean;
  refreshUserData: () => Promise<void>; // Función para refrescar datos del usuario y claims
}