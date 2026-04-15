import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // cookies ke liye important
  
});

// 🔐 Request Interceptor (optional)
api.interceptors.request.use(
  (config) => {
    // Agar future me token use karna ho
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
      // yaha logout bhi kara sakte ho
    }

    return Promise.reject(error);
  }
);

export default api;