"use client";

import AddCategoryModal from "@/components/modals/AddCategoryModal";
import CategoriesTable from "@/components/table/CategoriesTable";
import Button from "@/components/ui/Button";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/mutations/useCategory";
import {
  useCreateSubCategory,
  useDeleteSubCategory,
  useUpdateSubCategory,
} from "@/lib/mutations/useSubCategories";
import { useCategories } from "@/lib/queries/useCategories";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Categories() {
  const [open, setOpen] = useState(false);
  const { data: categoriesData = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createSubCategory = useCreateSubCategory();
  const deleteSubCategory = useDeleteSubCategory();
  const updateSubCategory = useUpdateSubCategory();
  const handleAddCategory = (data) => {
    if (data.type === "subcategory") {
      createSubCategory.mutate(
        {
          name: data.name,
          sku: data.sku,
          description: data.description,
          categoryId: data.categoryId,
          image: data.image,
        },
        {
          onSuccess: () => {
            toast.success("SubCategory created successfully 🔥");
            setOpen(false);
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || "Create failed");
          },
        },
      );
    } else {
      createCategory.mutate(data, {
        onSuccess: () => {
          toast.success("Category created successfully ");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Create failed ");
        },
      });
    }
  };

  const handleDeleteCategory = (id) => {
    deleteCategory.mutate(id, {
      onSuccess: () => {
        toast.success("Category deleted ");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Delete failed ");
      },
    });
  };

  const handleDeleteSubCategory = (id) => {
    deleteSubCategory.mutate(id, {
      onSuccess: () => {
        toast.success("SubCategory deleted");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Delete failed");
      },
    });
  };

  const [editData, setEditData] = useState(null);

  const handleEditCategory = (row, type = "category") => {
  setEditData({
    ...row,
    type, 
  });
  setOpen(true);
};

const handleUpdate = (data) => {
  if (editData?.type === "subcategory") {
    updateSubCategory.mutate(
      { id: editData.id, data },
      {
        onSuccess: () => {
          toast.success("SubCategory updated ✅");
          setOpen(false);
          setEditData(null);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Update failed");
        },
      }
    );
  } else {
    updateCategory.mutate(
      { id: editData.id, data },
      {
        onSuccess: () => {
          toast.success("Category updated ✅");
          setOpen(false);
          setEditData(null);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Update failed");
        },
      }
    );
  }
};

  if (isLoading) {
    return <div className="p-6">Loading categories...</div>;
  }

  const formattedData = categoriesData.map((item) => ({
    id: item.id,
    image: item.image
      ? `http://localhost:8000${item.image}`
      : "https://via.placeholder.com/40",
    name: item.name,
    sku: item.sku,
    description: item.description,
    subCategories: (item.subCategories || []).map((sub) => ({
  ...sub,
  image: sub.image
    ? `http://localhost:8000${sub.image}`
    : "https://via.placeholder.com/40?text=Sub",
})),
  }));

  const handleUpdateCategory = (data) => {
    updateCategory.mutate(
      { id: editData.id, data },
      {
        onSuccess: () => {
          toast.success("Category updated successfully ");
          setOpen(false);
          setEditData(null);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Update failed ");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full bg-white min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2A4150]">
            Categories
          </h1>
          <p className="text-sm text-slate-500">
            Manage your product categories and organization.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Button
            text="Add Category"
            icon={<Plus size={18} />}
            className="w-full sm:w-auto flex justify-center items-center gap-2"
            onClick={() => setOpen(true)}
          />
        </div>
      </header>

      <section className="mt-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <div className="inline-block min-w-full align-middle">
            <CategoriesTable
              data={formattedData}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onDeleteSubCategory={handleDeleteSubCategory}
            />
          </div>
        </div>
      </section>

      <AddCategoryModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        onSubmit={editData ? handleUpdate : handleAddCategory}
        defaultValues={editData}
      />
    </div>
  );
}
