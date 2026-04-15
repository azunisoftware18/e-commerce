import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

// ✅ Create Category (with image)
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("sku", data.sku);
      formData.append("description", data.description);

      if (data.image) {
        formData.append("image", data.image);
      }

      return api.post("/category/create-category", formData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
  });
};

// ✅ Update Category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => {
      const formData = new FormData();

      if (data.name) formData.append("name", data.name);
      if (data.sku) formData.append("sku", data.sku);
      if (data.description) formData.append("description", data.description);
      if (data.image) formData.append("image", data.image);

      return api.put(`/category/update-category/${id}`, formData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
  });
};

// ✅ Delete Category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      api.delete(`/category/delete-category/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
  });
};