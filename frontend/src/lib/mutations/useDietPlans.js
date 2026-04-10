import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

// ==============================
// ✅ CREATE DIET PLAN
// ==============================
export const useCreateDietPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post("/diet-plan/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["diet-plans"]);
    },
  });
};

// ==============================
// ✅ DELETE DIET PLAN
// ==============================
export const useDeleteDietPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/diet-plan/${id}`);
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["diet-plans"]);
    },
  });
};

// ==============================
// 🔥 DOWNLOAD DIET PLAN
// ==============================
export const useDownloadDietPlan = () => {
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.get(`/diet-plan/download/${id}`, {
        responseType: "blob", 
      });

      // create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "diet-plan.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};

// ==============================
// ✅ UPDATE DIET PLAN
// ==============================
export const useUpdateDietPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "pdf" || key === "thumbnail") {
          if (data[key]?.[0]) {
            formData.append(key, data[key][0]);
          }
        } else {
          formData.append(key, data[key]);
        }
      });

      const res = await api.put(`/diet-plan/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["diet-plans"]);
    },
  });
};