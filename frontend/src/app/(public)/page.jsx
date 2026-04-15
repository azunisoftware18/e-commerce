"use client";

import HeroSlider from "@/components/common/HeroSlider";
import ProductSection from "@/components/common/ProductSection";
import { useCategories } from "@/lib/queries/useCategories";
import { useProducts } from "@/lib/queries/useProducts";

export default function Home() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL || "http://localhost:8000";

  const sliderImages = categories.map((cat) => ({
    src: cat.image
      ? `${BASE_URL}${cat.image}`
      : "https://via.placeholder.com/1200x400",
    title: cat.name,
    description: cat.description,
    link: `/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
  }));

  return (
    <main className="min-h-screen">
      <HeroSlider images={sliderImages} />
      <div className="space-y-10 py-10">
        <ProductSection
          title="Best Sellers"
          description="Explore best-selling safe, natural products"
          products={products}
          isBestSeller
        />

        {categories.map((cat) => {
          const categoryProducts = products.filter(
            (p) => p.category?.name?.toLowerCase() === cat.name?.toLowerCase(),
          );

          if (categoryProducts.length === 0) return null;

          return (
            <ProductSection
              key={cat.id}
              title={`${cat.name} PRODUCTS`}
              description={cat.description || `Explore ${cat.name}`}
              products={categoryProducts}
              category={cat.name} 
            />
          );
        })}
      </div>
    </main>
  );
}
