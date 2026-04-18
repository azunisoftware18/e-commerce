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
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQty } from "@/store/slices/cartSlice";

export default function ViewProductPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = useProduct(id);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartItem = cartItems.find((item) => item.id === product?.id);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: `http://api.herbsnglam.com${product.images?.[0]?.url}`,
        description: product.description,
      }),
    );
  };

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
      <div className="w-full mx-auto px-4 py-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-600 transition-colors group"
        >
          <div className="p-2 bg-slate-100 rounded-full mr-3 group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Shop
        </button>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="aspect-4/5 rounded-[2.5rem] border border-[#e0e0e0] overflow-hidden bg-slate-50 relative group">
              <img
                src={`http://api.herbsnglam.com${product.images?.[0]?.url}`}
                className="w-full h-full object-cover"
              />
              {/* <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-[#e0e0e0] hover:text-red-500 transition-all hover:scale-110">
                <Heart size={22} />
              </button> */}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="border-b border-[#e0e0e0] pb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-orange-100 text-orange-700 px-3 py-1 rounded-md">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                {product.title}
              </h1>
            </div>

            <div className="py-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-blue-600 tracking-tight">
                  ₹{product.price}
                </span>
                <div className="flex flex-col"></div>
              </div>
              <p className="text-slate-500 mt-6 leading-relaxed text-lg">
                {product.description ||
                  "Premium quality formula designed for lasting results. Dermatologically tested, cruelty-free, and crafted with natural ingredients for your daily routine."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              {!cartItem ? (
                <Button
                  text="ADD TO CART"
                  className="w-full h-11.25 font-bold py-3 rounded-md text-lg tracking-wide bg-[#2A4150] text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(
                      addToCart({
                        id: product.id,
                        name: product.title,
                        image: `http://localhost:8000${product.images?.[0]?.url}`,
                        price: product.price,
                        description: product.description,
                      }),
                    );
                  }}
                />
              ) : (
                <div
                  className="w-full h-11.25 bg-[#2A4150] rounded-md overflow-hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <QuantitySelector
                    variant="button"
                    quantity={cartItem.quantity}
                    showRemove={false}
                    className="h-[full]"
                    onIncrease={() => dispatch(updateQty({ id, delta: 1 }))}
                    onDecrease={() => {
                      if (cartItem.quantity === 1) {
                        dispatch(removeFromCart(id));
                      } else {
                        dispatch(updateQty({ id, delta: -1 }));
                      }
                    }}
                  />
                </div>
              )}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
