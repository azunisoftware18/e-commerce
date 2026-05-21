"use client";

import { useMutation } from "@tanstack/react-query";
import api from "../api";

export const useResetForgotPassword = () => {
  return useMutation({
    mutationFn: (data) =>
      api.post("/auth/reset-forgot-password", data),
  });
};