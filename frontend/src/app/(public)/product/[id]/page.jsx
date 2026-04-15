"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Star,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ShoppingCart,
  Zap,
  Heart,
} from "lucide-react";
import Button from "@/components/ui/Button";
import QuantitySelector from "@/components/common/QuantitySelector"; // Path check kar lena
import { useProduct } from "@/lib/queries/useProducts";

export default function ViewProductPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = useProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-10 rounded-3xl border border-[#e0e0e0] shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">
            Product Not Found
          </h2>
          <p className="text-slate-500 mt-2">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 text-blue-600 font-bold hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Bar / Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <div className="p-2 bg-slate-100 rounded-full mr-3 group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Shop
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="aspect-4/5 rounded-[2.5rem] border border-[#e0e0e0] overflow-hidden bg-slate-50 relative group">
              <img
                src={`http://localhost:8000${product.images?.[0]?.url}`}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-[#e0e0e0] hover:text-red-500 transition-all hover:scale-110">
                <Heart size={22} />
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="border-b border-[#e0e0e0] pb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white px-3 py-1 rounded-md">
                  New Arrival
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-orange-100 text-orange-700 px-3 py-1 rounded-md">
                  In Stock
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                {product.title}
              </h1>

              <div className="flex items-center mt-6 gap-6">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      className={
                        s <= 4
                          ? "text-orange-400 fill-orange-400"
                          : "text-slate-200"
                      }
                    />
                  ))}
                  <span className="ml-3 font-bold text-slate-900">4.8</span>
                </div>
                <div className="h-4 w-px bg-[#e0e0e0]" />
                <span className="text-slate-500 font-medium">1.2k Reviews</span>
              </div>
            </div>

            <div className="py-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-blue-600 tracking-tight">
                  ₹{product.price}
                </span>
                <div className="flex flex-col">
                  <span className="text-slate-400 line-through text-sm font-bold">
                    ₹{product.price + 250}
                  </span>
                  <span className="text-green-600 text-xs font-black uppercase tracking-tighter">
                    Save 25% Today
                  </span>
                </div>
              </div>
              <p className="text-slate-500 mt-6 leading-relaxed text-lg">
                {product.description ||
                  "Premium quality formula designed for lasting results. Dermatologically tested, cruelty-free, and crafted with natural ingredients for your daily routine."}
              </p>
            </div>

            {/* INTEGRATED QUANTITY SELECTOR */}
            <div className="max-w-50">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Quantity
              </label>
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity((q) => q + 1)}
                onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                showRemove={false} // Product page par remove button ki zarurat nahi hoti
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button
                className="flex-[1.5] py-5 text-lg font-black gap-3 shadow-xl shadow-blue-100"
                text="Add to Bag"
                icon={<ShoppingCart size={22} />}
              />
              <Button
                icon={<Zap />}
                className="flex-1 bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all hover:shadow-xl active:scale-95"
              ></Button>
            </div>

            {/* Trust Footer */}
            <div className="mt-12 pt-8 border-t border-[#e0e0e0] grid grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <Truck className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Express Shipping
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Delivery in 2-3 days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-2xl border border-green-100">
                  <ShieldCheck className="text-green-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    1 Year Warranty
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authenticity guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
