"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import ProductCard from "./ProductCard";
import Link from "next/link";

export default function ProductSection({
  title,
  description,
  products = [],
  category,
  isBestSeller,
}) {
  const scrollRef = useRef();

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return "/placeholder.png";
    
    // If image is an object with url/signedUrl
    if (typeof image === 'object') {
      if (image.signedUrl) return image.signedUrl;
      if (image.url) {
        // Check if it's already a full URL
        if (image.url.startsWith('http')) return image.url;
        // If relative path, prepend base URL
        const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL || "http://localhost:8000";
        return `${BASE_URL}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
      }
    }
    
    // If image is a string
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL || "http://localhost:8000";
      return `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
    }
    
    return "/placeholder.png";
  };

  const filteredProducts = products.filter((p) => {
    // Remove Discontinued products
    if (p.status === "Discontinued") return false;

    if (isBestSeller) return true;

    if (category)
      return p.category?.name?.toLowerCase() === category.toLowerCase();

    return true;
  });

  let finalProducts = [...filteredProducts].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  finalProducts = finalProducts.slice(0, 20);

  // Scroll functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Don't render if no products
  if (finalProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
        </div>

        {!isBestSeller && (
          <Link
            href={`/category/${title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace("-products", "")}`}
          >
            <Button
              text="VIEW ALL"
              variant="primary"
              size="sm"
              className="px-4 py-2"
            />
          </Link>
        )}
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Left Arrow */}
        {finalProducts.length > 3 && (
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Right Arrow */}
        {finalProducts.length > 3 && (
          <button
            onClick={scrollRight}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Products Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scroll-smooth scrollbar-hide px-2 md:px-0 snap-x snap-mandatory"
        >
          {finalProducts.map((product) => {
            // Get the best available image
            const productImage = 
              getImageUrl(product.images?.[0]) || 
              getImageUrl(product.image) || 
              "/placeholder.png";

            return (
              <div
                key={product.id}
                className="sm:min-w-[48%] md:min-w-70 lg:min-w-75 snap-start first:ml-1 last:mr-1 shrink-0"
              >
                <ProductCard
                  id={product.id}
                  image={productImage}
                  title={product.name}
                  description={product.description}
                  price={product.price}
                  rating={product.rating || 4.5}
                  reviews={product.reviews || 0}
                  stock={product.stock}
                  status={product.status}
                  category={product.category}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}