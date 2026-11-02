import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // Required to send authentication cookies.
  
});

// 🔐 Request Interceptor (optional)
api.interceptors.request.use(
  (config) => {
    // Use this if token-based authentication is added later.
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response Interceptor (error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handle
    if (error.response?.status === 401) {
      console.log("Unauthorized ❌");
      // A logout action can be handled here if needed.
    }

    return Promise.reject(error);
  }
);

export const logWebsiteVisit = async () => {
  const response = await api.post("/audit/visit");
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get("/audit/logs");
  return response.data.data;
};

export default api;
