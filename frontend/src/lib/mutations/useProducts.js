import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import toast from "react-hot-toast";

// ==============================
// CREATE PRODUCT
// ==============================
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("categoryid", data.categoryid);
      formData.append("subCategoryId", data.subCategoryId);
      formData.append("price", data.price);
      formData.append("stock", data.stock);
      formData.append("status", data.status);

      formData.append("frontImage", data.frontImage);
      formData.append("backImage", data.backImage);
      formData.append("leftImage", data.leftImage);
      formData.append("rightImage", data.rightImage);

      return api.post("/product/create-product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Create failed");
    },
  });
};

// ==============================
// UPDATE PRODUCT
// ==============================
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("categoryid", data.categoryid);
      formData.append("subCategoryId", data.subCategoryId);
      formData.append("price", data.price);
      formData.append("stock", data.stock);
      formData.append("status", data.status);

      if (data.frontImage) {
        formData.append("frontImage", data.frontImage);
      }

      if (data.backImage) {
        formData.append("backImage", data.backImage);
      }

      if (data.leftImage) {
        formData.append("leftImage", data.leftImage);
      }

      if (data.rightImage) {
        formData.append("rightImage", data.rightImage);
      }

      return api.put(`/product/update-product/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    },
  });
};

// ==============================
// DELETE PRODUCT
// ==============================
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/product/delete-product/${id}`),

    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Delete failed");
    },
  });
};