// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.addAdminRole = functions.https.onCall(async (data, context) => {
  // Protección opcional para que solo un admin pueda ejecutar esto
  // if (!context.auth || !context.auth.token.admin) {
  //   throw new functions.https.HttpsError(
  //       "permission-denied",
  //       "Solo los administradores pueden realizar esta acción.",
  //   );
  // }

  const email = data.email;
  if (!email) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "El email es requerido.",
    );
  }

  try {
    const user = await admin.auth().getUserByEmail(email);

    // 1. Establecer el custom claim en Firebase Auth
    await admin.auth().setCustomUserClaims(user.uid, {admin: true});

    // 2. Actualizar el documento del usuario en Firestore
    const userDocRef = db.collection("users").doc(user.uid);
    await userDocRef.update({isAdmin: true});

    return {message: `¡Éxito! ${email} ha sido asignado como administrador.`};
  } catch (error) {
    console.error("Error en addAdminRole:", error);
    if (error.code === "auth/user-not-found") {
      throw new functions.https.HttpsError(
          "not-found",
          `No se encontró ningún usuario con el email ${email}.`,
      );
    }
    throw new functions.https.HttpsError(
        "unknown",
        "Ocurrió un error inesperado.",
        error.message,
    );
  }
});