// app/index.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "@/constants/AuthContext";
import { getTournaments } from "@/constants/firestoreService";
import { Tournament } from "@/types"; // Importar tipo Tournament

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, refreshUserData } = useAuth();
  const auth = getAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTournamentsData = useCallback(async () => {
    setLoadingTournaments(true);
    try {
      const fetchedTournaments = await getTournaments();
      setTournaments(fetchedTournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      Alert.alert("Error", "No se pudieron cargar los torneos.");
    } finally {
      setLoadingTournaments(false);
    }
  }, []);

  useEffect(() => {
    fetchTournamentsData();
  }, [fetchTournamentsData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData(); // Refresca datos del usuario y claims (por si cambió el rol)
    await fetchTournamentsData();
    setRefreshing(false);
  }, [fetchTournamentsData, refreshUserData]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // AuthContext se encargará de limpiar el estado del usuario
      router.replace("/login"); // O a la pantalla que desees post-logout
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  const filteredTournaments = useMemo(() => {
    if (!searchTerm.trim()) {
      return tournaments;
    }
    return tournaments.filter(
      (tournament) =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.gameName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tournaments, searchTerm]);

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Torneos Disponibles</Text>
        {user ? (
          <TouchableOpacity style={styles.authButton} onPress={handleSignOut}>
            <Text style={styles.authButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.authButtonsContainer}>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push("/login")}>
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.authButton, styles.registerButton]} onPress={() => router.push("/register")}>
              <Text style={styles.authButtonText}>Registro</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isAdmin && user && (
        <View style={styles.adminControls}>
          <TouchableOpacity
            style={[styles.adminButton, styles.createTournamentButton]}
            onPress={() => router.push("/create-tournament")}
          >
            <Text style={styles.adminButtonText}>Crear Torneo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push("/admin")}
          >
            <Text style={styles.adminButtonText}>Panel Admin</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre o juego..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {loadingTournaments && !refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : filteredTournaments.length === 0 ? (
        <Text style={styles.noTournamentsText}>No hay torneos disponibles o que coincidan con tu búsqueda.</Text>
      ) : (
        <FlatList
          data={filteredTournaments}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tournamentItem}
              onPress={() => router.push(`/tournament/${item.id}`)}
            >
              <Text style={styles.tournamentName}>{item.name}</Text>
              <Text style={styles.tournamentGame}>{item.gameName}</Text>
              <Text style={styles.tournamentDate}>
                Fecha: {item.date.toDate().toLocaleDateString()} - {item.date.toDate().toLocaleTimeString()}
              </Text>
              <Text style={styles.tournamentStatus}>Estado: {item.status}</Text>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 50, // Ajuste para StatusBar
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  authButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  authButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  registerButton: {
    backgroundColor: "#34C759", // Un color diferente para el botón de registro
  },
  authButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: '500',
  },
  adminControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  adminButton: {
    backgroundColor: "#FF9500", // Naranja para botones de admin
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  createTournamentButton: {
    backgroundColor: "#5856D6", // Morado para crear torneo
  },
  adminButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    fontSize: 16,
  },
  tournamentItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tournamentGame: {
    fontSize: 16,
    color: "#555",
    marginBottom: 3,
  },
  tournamentDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 3,
  },
  tournamentStatus: {
    fontSize: 14,
    color: "#777",
    fontStyle: 'italic',
  },
  noTournamentsText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#666",
  },
});