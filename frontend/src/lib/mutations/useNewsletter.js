import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ SUBSCRIBE NEWSLETTER
// ==============================
export const useSubscribeNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      api.post("/newsletter/subscribe", data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["newsletter"],
      });
    },
  });
};

// ==============================
// ✅ DELETE NEWSLETTER SUBSCRIBER
// ==============================
export const useDeleteNewsletterSubscriber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      api.delete(`/newsletter/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["newsletter"],
      });
    },
  });
};