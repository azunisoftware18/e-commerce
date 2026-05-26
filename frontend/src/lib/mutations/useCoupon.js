import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ CREATE COUPON
// ==============================
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      api.post("/coupons/create", data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coupons"],
      });
    },
  });
};

// ==============================
// ✅ UPDATE COUPON
// ==============================
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/coupons/${id}`, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coupons"],
      });
    },
  });
};

// ==============================
// ✅ DELETE COUPON
// ==============================
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      api.delete(`/coupons/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coupons"],
      });
    },
  });
};

// ==============================
// ✅ APPLY COUPON
// ==============================
export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post(
        "/coupons/apply",
        data,
        {
          withCredentials: true,
        },
      );

      return res.data;
    },
  });
};

// ==============================
// ✅ TOGGLE COUPON STATUS
// ==============================

export const useToggleCouponStatus =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: (id) =>
        api.patch(
          `/coupons/toggle-status/${id}`,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["coupons"],
        });
      },
    });
  };