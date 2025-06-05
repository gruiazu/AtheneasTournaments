// app/create-tournament.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/constants/AuthContext';
import { createTournamentInFirestore } from '@/constants/firestoreService';
// Opcional: para un DatePicker más avanzado
// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function CreateTournamentScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [gameName, setGameName] = useState('');
  const [dateString, setDateString] = useState(''); // Formato YYYY-MM-DD
  const [timeString, setTimeString] = useState(''); // Formato HH:MM (24h)

  // Para el DatePicker opcional
  // const [date, setDate] = useState(new Date());
  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const [showTimePicker, setShowTimePicker] = useState(false);

  const [loading, setLoading] = useState(false);

  // Protección de ruta básica
  if (!isAdmin && user) { // Si no es admin pero está logueado
    Alert.alert("Acceso Denegado", "No tienes permisos para crear torneos.");
    router.replace('/'); // Redirigir a la página principal
    return null;
  }
  if (!user) { // Si no está logueado
     router.replace('/login');
     return null;
  }

  // const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
  //   const currentDate = selectedDate || date;
  //   setShowDatePicker(Platform.OS === 'ios');
  //   setDate(currentDate);
  //   setDateString(currentDate.toISOString().split('T')[0]); // YYYY-MM-DD
  // };

  // const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
  //   const currentTime = selectedTime || date;
  //   setShowTimePicker(Platform.OS === 'ios');
  //   setDate(currentTime); // Actualiza la hora en el estado 'date'
  //   setTimeString(currentTime.toTimeString().split(' ')[0].substring(0,5)); // HH:MM
  // };

  const handleCreateTournament = async () => {
    if (!name || !maxParticipants || !gameName || !dateString || !timeString) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    const parsedMaxParticipants = parseInt(maxParticipants, 10);
    if (isNaN(parsedMaxParticipants) || parsedMaxParticipants <= 0) {
      Alert.alert('Error', 'El número máximo de participantes debe ser un número positivo.');
      return;
    }

    // Validar formato de fecha YYYY-MM-DD y hora HH:MM
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!dateRegex.test(dateString) || !timeRegex.test(timeString)) {
        Alert.alert('Error', 'Formato de fecha (YYYY-MM-DD) u hora (HH:MM) inválido.');
        return;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);

    // Validar que los componentes de fecha y hora sean válidos
    if (month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        Alert.alert('Error', 'Fecha u hora inválida.');
        return;
    }
    
    const tournamentDateTime = new Date(year, month - 1, day, hours, minutes);
    if (isNaN(tournamentDateTime.getTime())) {
        Alert.alert('Error', 'La fecha y hora ingresadas no son válidas.');
        return;
    }
    if (tournamentDateTime < new Date()) {
        Alert.alert('Error', 'La fecha del torneo no puede ser en el pasado.');
        return;
    }


    setLoading(true);
    try {
      if (!user?.uid) {
        throw new Error("Usuario no autenticado.");
      }
      const tournamentData = {
        name,
        maxParticipants: parsedMaxParticipants,
        date: Timestamp.fromDate(tournamentDateTime),
        gameName,
        creatorUid: user.uid,
      };
      const newTournamentRef = await createTournamentInFirestore(tournamentData);
      Alert.alert('Éxito', 'Torneo creado correctamente.');
      router.push(`/tournament/${newTournamentRef.id}`); // Navegar al detalle del torneo
    } catch (error: any) {
      console.error("Error creando torneo:", error);
      Alert.alert('Error al crear torneo', error.message || 'Ocurrió un error desconocido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Nuevo Torneo</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del Torneo"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre del Juego"
        value={gameName}
        onChangeText={setGameName}
      />
      <TextInput
        style={styles.input}
        placeholder="Máximo de Participantes"
        value={maxParticipants}
        onChangeText={setMaxParticipants}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Fecha del Torneo (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dateString}
        onChangeText={setDateString}
      />
      <Text style={styles.label}>Hora del Torneo (HH:MM - 24h)</Text>
      <TextInput
        style={styles.input}
        placeholder="HH:MM"
        value={timeString}
        onChangeText={setTimeString}
      />

      {/* Ejemplo de cómo integrar DatePicker (requiere @react-native-community/datetimepicker) */}
      {/*
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Seleccionar Fecha: {dateString || 'No seleccionada'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          minimumDate={new Date()} // No permitir fechas pasadas
        />
      )}
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Seleccionar Hora: {timeString || 'No seleccionada'}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={date} // Usar el mismo 'date' para que tome la fecha seleccionada
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangeTime}
        />
      )}
      */}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Crear Torneo" onPress={handleCreateTournament} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    marginLeft: 2,
  },
  // Estilos para DatePicker opcional
  // dateButton: {
  //   backgroundColor: '#007AFF',
  //   padding: 15,
  //   borderRadius: 5,
  //   alignItems: 'center',
  //   marginBottom: 15,
  // },
  // dateButtonText: {
  //   color: '#fff',
  //   fontSize: 16,
  // },
});