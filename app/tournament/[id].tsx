// app/tournament/[id].tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Button,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTournamentById, getUsersByIds, joinTournament } from '@/constants/firestoreService';
import { Tournament, UserData } from '@/types';
import { useAuth } from '@/constants/AuthContext';

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAdmin, userData: currentUserData, refreshUserData } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participantsDetails, setParticipantsDetails] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTournamentDetails = useCallback(async () => {
    if (!id) {
      Alert.alert("Error", "ID de torneo no encontrado.");
      router.back();
      return;
    }
    setLoading(true);
    try {
      const fetchedTournament = await getTournamentById(id);
      if (fetchedTournament) {
        setTournament(fetchedTournament);
        if (fetchedTournament.participants && fetchedTournament.participants.length > 0) {
          const fetchedParticipants = await getUsersByIds(fetchedTournament.participants);
          setParticipantsDetails(fetchedParticipants);
        } else {
          setParticipantsDetails([]);
        }
      } else {
        Alert.alert("Error", "Torneo no encontrado.");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
      Alert.alert("Error", "No se pudo cargar la información del torneo.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTournamentDetails();
  }, [fetchTournamentDetails]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData(); // Refrescar datos del usuario (por si cambió rol o se unió)
    await fetchTournamentDetails();
    setRefreshing(false);
  }, [fetchTournamentDetails, refreshUserData]);


  const handleJoinTournament = async () => {
    if (!user || !tournament || !id) return;

    if (tournament.participants && tournament.participants.includes(user.uid)) {
      Alert.alert("Información", "Ya estás inscrito en este torneo.");
      return;
    }

    if (tournament.participants && tournament.participants.length >= tournament.maxParticipants) {
      Alert.alert("Información", "El torneo ha alcanzado el máximo de participantes.");
      return;
    }

    setJoining(true);
    try {
      await joinTournament(id, user.uid);
      Alert.alert("¡Éxito!", "Te has inscrito en el torneo.");
      // Actualizar localmente o re-fetch
      setTournament(prev => prev ? ({
        ...prev,
        participants: [...(prev.participants || []), user.uid]
      }) : null);
      if (currentUserData) { // Añadir el usuario actual a la lista de participantes mostrada
        setParticipantsDetails(prev => [...prev, currentUserData]);
      }
      // Opcional: podrías llamar a fetchTournamentDetails() para asegurar consistencia total
    } catch (error) {
      console.error("Error joining tournament:", error);
      Alert.alert("Error", "No se pudo unir al torneo.");
    } finally {
      setJoining(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.centered}>
        <Text>Torneo no encontrado.</Text>
      </View>
    );
  }

  const isUserJoined = tournament.participants?.includes(user?.uid || '');
  const canJoin = !isAdmin && !isUserJoined && (tournament.participants?.length || 0) < tournament.maxParticipants && tournament.status === 'abierto';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerSection}>
        <Text style={styles.tournamentName}>{tournament.name}</Text>
        <Text style={styles.gameName}>Juego: {tournament.gameName}</Text>
        <Text style={styles.detailText}>
          Fecha: {tournament.date.toDate().toLocaleDateString()} - {tournament.date.toDate().toLocaleTimeString()}
        </Text>
        <Text style={styles.detailText}>
          Participantes: {tournament.participants?.length || 0} / {tournament.maxParticipants}
        </Text>
        <Text style={styles.detailText}>Estado: {tournament.status}</Text>
      </View>

      {user && canJoin && (
        <View style={styles.joinButtonContainer}>
          <Button
            title={joining ? "Apuntándose..." : "Apuntarse al Torneo"}
            onPress={handleJoinTournament}
            disabled={joining}
          />
        </View>
      )}
      {user && isUserJoined && (
          <Text style={styles.alreadyJoinedText}>Ya estás inscrito en este torneo.</Text>
      )}


      <View style={styles.participantsSection}>
        <Text style={styles.sectionTitle}>Participantes ({participantsDetails.length})</Text>
        {participantsDetails.length > 0 ? (
          <FlatList
            data={participantsDetails}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.participantItem}>
                <Text style={styles.participantName}>
                  {item.firstName} {item.lastName}
                </Text>
                {isAdmin && (
                  <>
                    <Text style={styles.participantInfo}>Email: {item.email}</Text>
                    <Text style={styles.participantInfo}>Teléfono: {item.phoneNumber}</Text>
                  </>
                )}
              </View>
            )}
            // Deshabilitar scroll de FlatList si está dentro de ScrollView
            // para evitar conflictos, o darle una altura fija.
            // scrollEnabled={false} 
          />
        ) : (
          <Text style={styles.noParticipantsText}>Aún no hay participantes inscritos.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tournamentName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  gameName: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  joinButtonContainer: {
    marginHorizontal: 20,
    marginVertical: 15,
  },
  alreadyJoinedText: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  participantsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  participantItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  participantName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  participantInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  noParticipantsText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
});