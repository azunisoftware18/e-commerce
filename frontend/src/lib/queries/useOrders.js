import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ GET ALL ORDERS
// ==============================
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get("/order/get-orders");

      return res?.data?.data || [];
    },
  });
};

// ==============================
// ✅ GET SINGLE ORDER
// ==============================
export const useOrder = (id) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.get(`/order/get-order/${id}`);
      return res?.data?.data || null;
    },
    enabled: !!id,
  });
};

// ==============================
// ✅ GET ORDER STATUS OPTIONS
// ==============================
export const useOrderStatusOptions = () => {
  return useQuery({
    queryKey: ["order-status"],
    queryFn: async () => {
      const res = await api.get("/order/status-options");
      return res?.data?.data || [];
    },
  });
};