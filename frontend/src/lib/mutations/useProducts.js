import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import toast from "react-hot-toast";

// ==============================
// ✅ CREATE PRODUCT
// ==============================
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "images" && value) {
          Array.from(value).forEach((file) => {
            formData.append("images", file);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      return api.post("/product/create-product", formData);
    },

    onSuccess: () => {
      toast.success("Product created successfully ");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Create failed ");
    },
  });
};

// ==============================
// ✅ UPDATE PRODUCT
// ==============================
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "images" && value) {
          Array.from(value).forEach((file) => {
            formData.append("images", file);
          });
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      return api.put(`/product/update-product/${id}`, formData);
    },

    onSuccess: () => {
      toast.success("Product updated successfully ");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed ");
    },
  });
};

// ==============================
// ✅ DELETE PRODUCT
// ==============================
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      api.delete(`/product/delete-product/${id}`),

    onSuccess: () => {
  toast.success("Product deleted ");
  queryClient.invalidateQueries(["products"]);
},

onError: (err) => {
  toast.error(err.response?.data?.message || "Delete failed ");
},
  });
};