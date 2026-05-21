"use client";

import HeroSlider from "@/components/common/HeroSlider";
import ProductSection from "@/components/common/ProductSection";
import { useCategories } from "@/lib/queries/useCategories";
import { useProducts } from "@/lib/queries/useProducts";
import { getImageUrl, getCategoryImageUrl } from "@/lib/utils/imageUtils";

export default function Home() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const sliderImages = categories.map((cat) => ({
    src: getCategoryImageUrl(cat),
    title: cat.name,
    description: cat.description,
    link: `/category/${cat.name?.toLowerCase().replace(/\s+/g, "-")}`,
  }));

  // Add proper image URLs to products
  const productsWithImages = products.map(product => ({
    ...product,
    displayImage: getImageUrl(product.image || product.images?.[0])
  }));

  return (
    <main className="min-h-screen">
      <HeroSlider images={sliderImages} />
      <div className="space-y-10 py-10">
        <ProductSection
          title="Best Sellers"
          description="Explore best-selling safe, natural products"
          products={productsWithImages}
          isBestSeller
        />

        {categories.map((cat) => {
          const categoryProducts = productsWithImages.filter(
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