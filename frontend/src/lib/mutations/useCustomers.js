import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

// ✅ Create Customer
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/customer/create-customer", data),

    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/customer/update-customer/${id}`, data),

    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/customer/delete-customer/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
    },
  });
};