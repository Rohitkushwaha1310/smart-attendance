import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ add /api since your backend uses that prefix
  withCredentials: true, // optional if backend uses cookies
});

export default api;

