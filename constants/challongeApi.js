import axios from "axios";

const CHALLONGE_API_KEY = "hC7BfGpzFzeelkdzkHr4w6jlFiookQdBW133LH88";  

const api = axios.create({
  baseURL: "https://api.challonge.com/v1/",
  params: { api_key: CHALLONGE_API_KE },
});

export const crearTorneo = async (nombre, tipo = "single elimination") => {
  try {
    const response = await api.post("tournaments.json", {
      tournament: {
        name: nombre,
        tournament_type: tipo,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear torneo:", error);
    throw error;
  }
};