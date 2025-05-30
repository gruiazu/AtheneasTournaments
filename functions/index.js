// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(); // Inicializa Firebase Admin

// Esta función se puede llamar desde el cliente para asignar el rol de admin a un usuario.
exports.addAdminRole = functions.https.onCall(async (data, context) => {
  // Opcional: Puedes verificar que quien realiza la llamada tenga permisos para asignar roles.
  // Por ejemplo:
  // if (!context.auth.token.admin) {
  //   throw new functions.https.HttpsError("permission-denied", "Solo administradores pueden asignar roles de admin");
  // }

  // Recibe el email del usuario al que se le quiere asignar el rol admin
  const email = data.email;
  try {
    // Obtiene el usuario a partir del email
    const user = await admin.auth().getUserByEmail(email);
    // Asigna el claim "admin" a true
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `¡Éxito! ${email} ha sido asignado como administrador.` };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
