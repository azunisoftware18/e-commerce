import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";


// ✅ CREATE / UPDATE (Upsert)
export const useUpsertSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const formData = new FormData();

      if (data.companyName) formData.append("companyName", data.companyName);
      if (data.phone) formData.append("phone", data.phone);
      if (data.email) formData.append("email", data.email);
      if (data.address) formData.append("address", data.address);

      // ✅ logo image
      if (data.image) {
        formData.append("image", data.image);
      }

      // ✅ social links JSON
      if (data.socialLinks) {
        formData.append(
          "socialLinks",
          JSON.stringify(data.socialLinks)
        );
      }

      return api.post("/settings", formData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
    },
  });
};


// ✅ DELETE
export const useDeleteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete("/settings"),

    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
    },
  });
};