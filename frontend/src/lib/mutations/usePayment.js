import { useMutation } from "@tanstack/react-query";
import api from "../api";

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: async ({ orderId }) => {
      const res = await api.post("/payment/create", { orderId });
      return res.data;
    },
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/payment/verify", data);
      return res.data;
    },
  });
};
