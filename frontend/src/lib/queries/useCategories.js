import { useQuery } from "@tanstack/react-query";
import api from "../api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/category/get-categories");
      return res.data.data.categories;
    },
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const res = await api.get(`/category/get-category/${id}`);
      return res.data.data.category;
    },
    enabled: !!id,
  });
};