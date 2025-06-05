import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import app from "./FirebaseConfig";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { UserData, AuthContextType as CustomAuthContextType } from "@/types"; // Importar tipos

const auth = getAuth(app);
const db = getFirestore(app);

const AuthContext = createContext<CustomAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserDataAndClaims = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        // Forzar refresco del token para obtener los últimos claims
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        setIsAdmin(!!idTokenResult.claims.admin);

        // Obtener datos adicionales del usuario desde Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        } else {
          setUserData(null); // O manejar el caso donde el documento no existe
        }
      } catch (error) {
        console.error("Error fetching user data or claims:", error);
        setIsAdmin(false);
        setUserData(null);
      }
    } else {
      setIsAdmin(false);
      setUserData(null);
    }
  }, []);


  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserDataAndClaims(currentUser);
      } else {
        setIsAdmin(false);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, [fetchUserDataAndClaims]);

  const refreshUserData = async () => {
    if (user) {
      setLoading(true);
      await fetchUserDataAndClaims(user);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, isAdmin, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};