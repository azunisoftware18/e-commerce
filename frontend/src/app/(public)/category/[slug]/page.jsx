"use client";

import React, { use } from "react";
import ProductCard from "@/components/common/ProductCard";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/queries/useProducts";
import { BoxIcon } from "lucide-react";

export default function CategoryPage({ params }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const safeSlug = slug || "";
  const { data: products = [], isLoading } = useProducts();

  const normalize = (str) =>
  str?.toLowerCase().replace(/\s+/g, "-");

const filteredProducts = products.filter((product) => {
   if (product.status === "Discontinued") return false;
  const categorySlug = normalize(product.category?.name);
  const subCategorySlug = normalize(product.subCategory?.name);

  const query = search.toLowerCase();

  const matchesSearch =
    !search ||
    [
      product.name,
      product.category?.name,
      product.subCategory?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);

  // 🔥 SEARCH ONLY
  if (!safeSlug && search) {
    return matchesSearch;
  }

  // 🔥 BEST SELLER
  if (safeSlug === "best-seller") {
    return product.isBestSeller && matchesSearch;
  }

  // 🔥 CATEGORY FILTER
  const matchesCategory =
    categorySlug === safeSlug || subCategorySlug === safeSlug;

  return matchesCategory && matchesSearch;
});

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#2A4150] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading amazing products...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 py-6 md:px-8 lg:px-10 min-h-screen bg-[#fcfcfc]">
      <div className="mb-8 border-b border-slate-100 pb-5">
        <h1 className="text-2xl md:text-3xl font-black uppercase text-[#2A4150] tracking-tight">
  {search
    ? `Search: ${search}`
    : safeSlug.replace(/-/g, " ")}{" "}
  <span className="text-slate-400 font-light">
    {search ? "Results" : "Collection"}
  </span>
</h1>
        {/* <p className="text-sm text-slate-500 mt-1">
          Showing {filteredProducts.length} items
        </p> */}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              className="w-full"
              id={product.id}
              image={
                product.images?.[0]?.url
                  ? `http://api.herbsnglam.com${product.images[0].url}`
                  : "/placeholder-product.png"
              }
              title={product.name}
              description={product.description}
              price={product.price}
              rating={4.5}
              reviews={10}
              size="Standard"
              badge={product.status === "Active" ? "New" : ""}
              stock={product.stock}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <BoxIcon className="w-16 h-16 text-slate-300" />
          </div>
          <h3 className="text-xl text-slate-800 font-bold">
            No products found
          </h3>
          <p className="text-slate-500 max-w-xs mt-2">
  {search
    ? `No results found for "${search}"`
    : `We couldn't find any products in the "${safeSlug}" category`}
</p>
        </div>
      )}
    </div>
  );
}
