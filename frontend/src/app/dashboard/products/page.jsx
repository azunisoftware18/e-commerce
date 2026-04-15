"use client";

import AddProductModal from "@/components/modals/AddProductModal";
import ProductsTable from "@/components/table/ProductsTable";
import Button from "@/components/ui/Button";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/lib/mutations/useProducts";
import { useProducts } from "@/lib/queries/useProducts";
import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";

export default function Products() {
  const [open, setOpen] = useState(false);
  const createProduct = useCreateProduct();
  const { data: products = [], isLoading } = useProducts();
  const [editProduct, setEditProduct] = useState(null);
  const updateProduct = useUpdateProduct();
  const [viewProduct, setViewProduct] = useState(null);
  const formattedData = useMemo(() => {
    return products.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description, 
      category: item.category,
      categoryid: item.category?.id, 
      price: item.price,
      stock: item.stock,
      status: item.status,
      images: item.images, 
    }));
  }, [products]);

  const handleAddProduct = (data) => {
    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data },
        {
          onSuccess: () => {
            setOpen(false);
            setEditProduct(null);
          },
        },
      );
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          setOpen(false);
        },
      });
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setOpen(true);
  };

  const handleView = (product) => {
    setViewProduct(product);
  };

  if (isLoading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full bg-white min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2A4150] capitalize">
            Products
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            Manage your inventory, pricing, and product details.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Button
            onClick={() => setOpen(true)}
            text="Add Product"
            icon={<Plus size={18} />}
            className="w-full sm:w-auto flex justify-center items-center gap-2"
          />
        </div>
      </header>

      <section className="mt-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <div className="inline-block min-w-full align-middle">
            <ProductsTable
              data={formattedData}
              isLoading={isLoading}
              onEdit={handleEdit}
              onView={handleView}
            />
          </div>
        </div>
      </section>
      <AddProductModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditProduct(null);
        }}
        onSubmit={handleAddProduct}
        editData={editProduct}
      />
    </div>
  );
}
