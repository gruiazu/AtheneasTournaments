// constants/auth.ts
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential, User } from "firebase/auth";
import app from "./FirebaseConfig"; // Asegúrate que la ruta es correcta
import { createUserDocument } from "./firestoreService"; // Importar la nueva función

const auth = getAuth(app);

interface RegisterUserDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

// 🔹 REGISTRAR USUARIO 🔹
export const registerUser = async (
  email: string,
  password: string,
  userDetails: RegisterUserDetails
): Promise<User> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar datos adicionales en Firestore
    await createUserDocument(user.uid, {
      email: user.email!, // user.email no será null aquí
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      phoneNumber: userDetails.phoneNumber,
    });

    return user;
  } catch (error) {
    console.error("Error en el registro:", error);
    throw error; // Re-lanzar para que el componente lo maneje
  }
};

// 🔹 INICIAR SESIÓN 🔹
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    throw error;
  }
};