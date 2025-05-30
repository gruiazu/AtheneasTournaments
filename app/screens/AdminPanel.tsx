// Por ejemplo, en un componente AdminPanel.tsx
import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "@/constants/FirebaseConfig";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const functions = getFunctions(app); // Obtén la instancia de funciones
  const addAdminRole = httpsCallable(functions, "addAdminRole");

  const handleAddAdmin = async () => {
    try {
      const result = await addAdminRole({ email });
      Alert.alert("Éxito", (result.data as any).message);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email del usuario"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Asignar rol de Admin" onPress={handleAddAdmin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default AdminPanel;


