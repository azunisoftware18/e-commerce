import { useQuery } from "@tanstack/react-query";
import api from "../api";

//  Get All SubCategories
export const useSubCategories = () => {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const res = await api.get("/subcategory");
      return res.data.data;
    },
  });
};

// Get Category with SubCategories
export const useCategoryWithSubCategories = (id) => {
  return useQuery({
    queryKey: ["category-subcategories", id],
    queryFn: async () => {
      const res = await api.get(
        `/subcategory/${id}/subcategories`
      );
      return res.data.data;
    },
    enabled: !!id,
  });
};