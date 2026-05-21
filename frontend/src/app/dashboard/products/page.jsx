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
import toast from "react-hot-toast";

export default function Products() {
  const [open, setOpen] = useState(false);
  const createProduct = useCreateProduct();
  const { data: products = [], isLoading } = useProducts();
  const [editProduct, setEditProduct] = useState(null);
  const updateProduct = useUpdateProduct();
  const [viewProduct, setViewProduct] = useState(null);

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // If image is an object
    if (typeof image === 'object') {
      if (image.signedUrl) return image.signedUrl;
      if (image.url) return image.url;
      if (image.key) {
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL || "http://localhost:8000";
        return `${BASE_URL}/${image.key}`;
      }
    }
    
    // If image is a string
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL || "http://localhost:8000";
      return `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
    }
    
    return null;
  };

  // Format products data with proper image URLs
  const formattedData = useMemo(() => {
    return products.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      categoryid: item.category?.id,
      subCategoryId: item.subCategoryId,
      price: item.price,
      stock: item.stock,
      status: item.status,
      images: item.images,
      // Get first image URL
      displayImage: getImageUrl(item.images?.[0]) || getImageUrl(item.image),
      // Keep original data
      originalImages: item.images,
      subCategory: item.subCategory,
      sku: item.sku,
    }));
  }, [products]);

  const handleAddProduct = (data) => {
    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data },
        {
          onSuccess: () => {
            toast.success("Product updated successfully!");
            setOpen(false);
            setEditProduct(null);
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || "Update failed");
          },
        },
      );
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          toast.success("Product created successfully!");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Create failed");
        },
      });
    }
  };

  const handleEdit = (product) => {
    // Prepare product data for editing
    const editData = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status,
      categoryId: product.categoryid || product.category?.id,
      subCategoryId: product.subCategoryId,
      images: product.originalImages || product.images,
    };
    setEditProduct(editData);
    setOpen(true);
  };

  const handleView = (product) => {
    setViewProduct(product);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A4150] mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading products...</p>
        </div>
      </div>
    );
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
            onClick={() => {
              setEditProduct(null);
              setOpen(true);
            }}
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

      {/* Product View Modal */}
      {viewProduct && (
        <ProductViewModal
          product={viewProduct}
          open={!!viewProduct}
          onClose={() => setViewProduct(null)}
          getImageUrl={getImageUrl}
        />
      )}

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

// Product View Modal Component
const ProductViewModal = ({ product, open, onClose, getImageUrl }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">{product.name}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Product Images */}
        {product.images && product.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={getImageUrl(img) || "https://via.placeholder.com/400?text=No+Image"}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400?text=No+Image";
                }}
              />
            ))}
          </div>
        )}

        {/* Product Details */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-500">Description</label>
            <div className="mt-1 text-slate-700 prose prose-sm max-w-none">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="text-slate-400 italic">No description</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-500">Price</label>
              <p className="text-lg font-bold text-green-600">₹{product.price?.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Stock</label>
              <p className={`text-lg font-semibold ${product.stock === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                {product.stock === 0 ? 'Out of Stock' : product.stock}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Category</label>
              <p className="text-slate-700">{product.category?.name || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Sub Category</label>
              <p className="text-slate-700">{product.subCategory?.name || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">SKU</label>
              <p className="text-slate-700">{product.sku || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Status</label>
              <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                product.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {product.status || "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};