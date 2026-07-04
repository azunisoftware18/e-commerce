"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import ProductCard from "@/components/common/ProductCard";
import { useRecommendations } from "@/lib/queries/useRecommendations";

export default function YouMightAlsoLike() {
  const {
    data: recommendations = [],
    isLoading,
  } = useRecommendations();

  const hasRecommendations = recommendations.length > 0;
  const totalRecommendations = recommendations.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12 sm:mt-16"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={20}
              className="text-[#2A4150]"
            />

            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              You Might Also Like
            </h2>
          </div>

          <p className="text-sm text-slate-400 mt-1">
            Based on items in your cart •{" "}
            {totalRecommendations} recommended products
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-72 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : hasRecommendations ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {recommendations.map((product) => (
            <div
              key={product.id}
              className="mx-auto w-full max-w-[220px]"
            >
              <ProductCard
                id={product.id}
                image={
                  product.images?.[0]?.url ||
                  "/placeholder-image.jpg"
                }
                title={product.name}
                description={product.description}
                price={product.price}
                stock={product.stock}
                status={product.status}
                category={product.category}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Sparkles
            size={40}
            className="mx-auto mb-3 text-slate-300"
          />

          <h3 className="text-lg font-bold text-slate-700">
            No Recommendations Found
          </h3>

          <p className="text-sm text-slate-400 mt-2">
            We couldn't find similar products right now.
          </p>
        </div>
      )}
    </motion.section>
  );
}