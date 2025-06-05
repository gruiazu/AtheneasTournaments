import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    Timestamp,
    setDoc,
    query,
    where,
    DocumentData,
    DocumentReference,
  } from 'firebase/firestore';
  import app from './FirebaseConfig'; // Tu configuración de Firebase
  import { Tournament, UserData } from '@/types'; // Importar tipos
  
  const db = getFirestore(app);
  
  // --- User Functions ---
  
  export const createUserDocument = async (
    uid: string,
    data: Omit<UserData, 'uid'>
  ): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { ...data, uid }); // Aseguramos que el uid esté en el documento
  };
  
  export const getUserDocument = async (uid: string): Promise<UserData | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  };
  
  export const getUsersByIds = async (uids: string[]): Promise<UserData[]> => {
    if (!uids || uids.length === 0) return [];
    const usersRef = collection(db, 'users');
    // Firestore 'in' query supports up to 30 elements in the array.
    // For larger arrays, you might need to batch queries.
    // For now, assuming uids.length <= 30
    const q = query(usersRef, where('uid', 'in', uids));
    const querySnapshot = await getDocs(q);
    const users: UserData[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserData);
    });
    return users;
  };
  
  // --- Tournament Functions ---
  
  export const createTournamentInFirestore = async (
    tournamentData: Omit<Tournament, 'id' | 'status' | 'participants'> & { creatorUid: string }
  ): Promise<DocumentReference<DocumentData>> => {
    const newTournament: Omit<Tournament, 'id'> = {
      ...tournamentData,
      participants: [],
      status: 'abierto',
    };
    return await addDoc(collection(db, 'tournaments'), newTournament);
  };
  
  export const getTournaments = async (): Promise<Tournament[]> => {
    const tournamentsCol = collection(db, 'tournaments');
    const tournamentSnapshot = await getDocs(tournamentsCol);
    const tournamentList = tournamentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Tournament));
    return tournamentList;
  };
  
  export const getTournamentById = async (id: string): Promise<Tournament | null> => {
    const tournamentRef = doc(db, 'tournaments', id);
    const docSnap = await getDoc(tournamentRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Tournament;
    }
    return null;
  };
  
  export const joinTournament = async (tournamentId: string, userId: string): Promise<void> => {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    await updateDoc(tournamentRef, {
      participants: arrayUnion(userId),
    });
  };
  
  // Puedes añadir más funciones como:
  // - updateTournamentStatus
  // - removeParticipantFromTournament
  // etc.