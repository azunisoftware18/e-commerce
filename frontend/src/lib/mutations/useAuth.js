"use client";

import { useMutation } from "@tanstack/react-query";
import api from "../api";

export const useLogin = () => {
  return useMutation({
    mutationFn: (data) => api.post("/auth/login", data),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/logout");
      return res.data;
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (data) => api.post("/auth/signup", data),
  });
};

export const useUpdateAdmin = () => {
  return useMutation({
    mutationFn: (data) => api.post("/auth/update-admin", data),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data) => api.post("/auth/forgot-password", data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data) => api.post("/auth/reset-password", data),
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data) => api.post("/auth/update-admin", data),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => api.post("/auth/reset-password", data),
  });
};