"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Truck, Zap, ShieldCheck } from "lucide-react";
import QuantitySelector from "@/components/common/QuantitySelector";
import { useProduct } from "@/lib/queries/useProducts";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQty } from "@/store/slices/cartSlice";

export default function ViewProductPage() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartItem = cartItems.find((item) => item.id === product?.id);

  const isOutOfStock =
    product?.status === "Out_of_Stock" || product?.stock === 0;

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">
        Loading Product...
      </div>
    );

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">
            Product Not Found
          </h2>
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
      {/* --- Top Navigation --- */}
      <div className="w-full mx-auto px-4 py-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="p-2 bg-slate-100 rounded-full mr-3 group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Shop
        </button>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* --- 🖼️ LEFT: Image Section (Sticky on Desktop) --- */}
          <div className="lg:sticky lg:top-36">
            <div className="aspect-4/5 rounded-[2.5rem] border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
              <img
                src={
                  product?.images?.[0]?.signedUrl ||
                  product?.images?.[0]?.url ||
                  "/placeholder-image.png"
                }
                alt={product?.title || product?.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-image.png";
                }}
              />
            </div>
          </div>

          {/* --- 📝 RIGHT: Details Section (Using Flex Order) --- */}
          <div className="flex flex-col">
            {/* 1. Header (Always Top) - Order 1 */}
            <div className="border-b border-slate-100 pb-6 order-1">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    isOutOfStock
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isOutOfStock ? "• Out of Stock" : "• In Stock"}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {product.name || product.title}
              </h1>
            </div>

            {/* 2. Price Section - Order 2 */}
            <div className="pt-8 order-2">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-blue-600">
                  ₹{product.price}
                </span>
                
              </div>
            </div>


            <div className="py-8 order-4 lg:order-3">
              <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100 relative">
                <div className="flex flex-col gap-4 mt-8 order-3 lg:order-4">
                  {!cartItem ? (
                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (isOutOfStock) {
                          alert("This product is out of stock");
                          return;
                        }

                        dispatch(
                          addToCart({
                            id: product.id,
                            name: product.title,
                            price: product.price,
                            image:
                              product?.images?.[0]?.signedUrl ||
                              product?.images?.[0]?.url ||
                              "/placeholder-image.png",
                            stock: product.stock,
                          }),
                        );
                      }}
                      className={`w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 ${
                        isOutOfStock
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-[#2A4150] text-white hover:bg-[#1a2b36]"
                      }`}
                    >
                      {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
                    </button>
                  ) : (
                    <div className="w-full h-full bg-[#2A4150] rounded-xl overflow-hidden shadow-lg">
                      <QuantitySelector
                        variant="button"
                        quantity={cartItem.quantity}
                        onIncrease={() => {
                          if (cartItem.quantity >= product.stock)
                            return alert("Out of stock!");
                          dispatch(updateQty({ id: product.id, delta: 1 }));
                        }}
                        onDecrease={() => {
                          if (cartItem.quantity === 1)
                            dispatch(removeFromCart(product.id));
                          else
                            dispatch(updateQty({ id: product.id, delta: -1 }));
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="absolute -top-3 left-8 bg-white px-4 py-1 border border-slate-100 rounded-full flex items-center gap-2 shadow-sm">
                  <Zap size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Product Highlights
                  </span>
                </div>
                <div
                  className="product-description mt-2"
                  dangerouslySetInnerHTML={{
                    __html: product.description || "",
                  }}
                />
              </div>
            </div>

            {/* 5. Trust Badges - Always Last (Order 5) */}
            <div className="mt-6 lg:mt-10 grid grid-cols-2 gap-4 order-5">
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
                <Truck className="text-blue-600" size={24} />
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  Free Express Delivery
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
                <ShieldCheck className="text-emerald-600" size={24} />
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    100% Authentic
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Direct Brand Origin
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
