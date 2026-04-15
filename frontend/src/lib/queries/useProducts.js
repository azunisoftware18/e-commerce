import { useQuery } from "@tanstack/react-query";
import api from "../api";

// ✅ Get All Products
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/product/get-products");
      return res.data.data.products;
    },
  });
};

// ✅ Get Single Product
export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/product/get-product/${id}`);
      return res.data.data.product;
    },
    enabled: !!id,
  });
};