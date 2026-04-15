import { useQuery } from "@tanstack/react-query";
import api from "../api";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get("/customer/get-customers");
      return res.data.data;
    },
  });
};

export const useCustomer = (id) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await api.get(`/customer/get-customer/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};