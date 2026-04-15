import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ CREATE ORDER
// ==============================
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      api.post("/order/create-order", data),

    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });
};

// ==============================
// ✅ UPDATE ORDER
// ==============================
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/order/update-order/${id}`, data),

    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });
};

// ==============================
// ✅ DELETE ORDER
// ==============================
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      api.delete(`/order/delete-order/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });
};

// doenload invoice
export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async (orderId) => {
      const res = await api.get(`/order/invoice/${orderId}`, {
        responseType: "blob", // 🔥 important
      });

      return { data: res.data, orderId };
    },

    onSuccess: ({ data, orderId }) => {
      const url = window.URL.createObjectURL(new Blob([data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },

    onError: () => {
      alert("Invoice download failed");
    },
  });
};