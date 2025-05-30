// app/index.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "@/constants/AuthContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const auth = getAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la App</Text>
      <View style={styles.topRightButtons}>
        {user ? (
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={() => router.push("/register")}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      {/* Resto del contenido de la pantalla */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 40, // Para dar espacio a los botones
    backgroundColor: "#F5F5F5",
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginVertical: 20,
  },
  topRightButtons: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  registerButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 14,
  },
});
