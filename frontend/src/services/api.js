import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for search requests
  headers: {
    "Content-Type": "application/json"
  }
});

export const apiService = {
  async getBuildings() {
    const response = await apiClient.get("/buildings");
    return response.data;
  },

  async search(params) {
    const response = await apiClient.post("/search", params);
    return response.data;
  },

  async healthCheck() {
    const response = await apiClient.get("/health");
    return response.data;
  }
};

