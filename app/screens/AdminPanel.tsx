// app/screens/AdminPanel.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { getFunctions, httpsCallable } from "firebase/functions";
import app from "@/constants/FirebaseConfig";
import { getAdminUsers } from "@/constants/firestoreService"; // Importar la nueva función
import { UserData } from "@/types"; // Importar el tipo

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<UserData[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const functions = getFunctions(app);
  const addAdminRole = httpsCallable(functions, "addAdminRole");

  // Función para cargar o recargar la lista de administradores
  const fetchAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const admins = await getAdminUsers();
      setAdminUsers(admins);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      Alert.alert("Error", "No se pudo cargar la lista de administradores.");
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  // Cargar la lista de admins al montar el componente
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAdmins();
    setRefreshing(false);
  }, [fetchAdmins]);

  const handleAddAdmin = async () => {
    if (!email.trim()) {
      Alert.alert("Campo vacío", "Por favor, introduce un email.");
      return;
    }
    setLoading(true);
    try {
      const result = await addAdminRole({ email });
      // Mensaje de éxito más claro y útil
      Alert.alert("Éxito", (result.data as any).message);
      setEmail(""); // Limpiar el input después del éxito
      await fetchAdmins(); // Recargar la lista de administradores
    } catch (error: any) {
      console.error("Error al añadir admin:", error);
      Alert.alert("Error", error.message || "Ocurrió un error desconocido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      
      <View style={styles.addAdminSection}>
        <TextInput
          style={styles.input}
          placeholder="Email del usuario a promover"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleAddAdmin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Asignar Rol de Admin</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />

      <Text style={styles.subtitle}>Administradores Actuales</Text>
      {loadingAdmins && !refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={adminUsers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <View style={styles.adminItem}>
              <Text style={styles.adminName}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.adminEmail}>{item.email}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay administradores.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  addAdminSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  adminItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  adminName: {
    fontSize: 16,
    fontWeight: '500',
  },
  adminEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default AdminPanel;