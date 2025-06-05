// app/screens/RegisterScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from "react-native";
import { registerUser } from "../../constants/auth"; // Ajusta la ruta si es necesario
import { useRouter } from "expo-router";
import { useAuth } from "@/constants/AuthContext"; // Para refrescar datos después del registro

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();
  const { refreshUserData } = useAuth(); // Para actualizar el contexto

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }
    try {
      await registerUser(email, password, {
        firstName,
        lastName,
        phoneNumber,
      });
      Alert.alert("Registro exitoso", "Usuario registrado. Por favor, inicia sesión.");
      // Opcional: podrías intentar loguear al usuario automáticamente aquí
      // y luego llamar a refreshUserData()
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Error en el registro", error.message || "Ocurrió un error desconocido.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrarse</Text>
      <TextInput
        placeholder="Nombres"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Apellidos"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Número de teléfono"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button title="Registrarse" onPress={handleRegister} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Ir a Inicio de Sesión" onPress={() => router.push("/login")} color="green" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 10,
  },
});

export default RegisterScreen;