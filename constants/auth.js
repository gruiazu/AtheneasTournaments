import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import app from "FirebaseConfig";

const auth = getAuth(app);

// 🔹 REGISTRAR USUARIO 🔹
export const registerUser = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error en el registro:", error);
      throw error;
    }
  };
  
  // 🔹 INICIAR SESIÓN 🔹
  export const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      throw error;
    }
  };