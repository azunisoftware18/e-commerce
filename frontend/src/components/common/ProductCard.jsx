"use client";

import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import Button from "../ui/Button";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQty } from "@/store/slices/cartSlice";
import QuantitySelector from "./QuantitySelector";

export default function ProductCard({
  id,
  image,
  title,
  description,
  size,
  rating,
  reviews,
  price,
  stock,
  status,
  className = "",
}) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartItem = cartItems.find((item) => item.id === id);
  const isOutOfStock = status === "Out_of_Stock" || stock === 0;

  return (
    <Link
      href={`/product/${id}`}
      className="block h-full group select-none touch-manipulation"
    >
      <div
        className={`
          relative bg-white border border-slate-100 rounded-lg sm:rounded-xl 
          overflow-hidden shadow-xl
          transition-all duration-500 ease-out flex flex-col 
          w-full h-full
          
          /* Mobile Press Touch Effect (Active State) */
          active:scale-[0.97] active:shadow-md active:border-emerald-500/20
          
          /* Tablet and Desktop Hover Animations */
          md:hover:-translate-y-2
          md:hover:shadow-[#2A4150] 
          md:hover:border-[#2A4150] 
          
          will-change-transform ${className}
        `}
      >
        {/* IMAGE SECTION WITH HOVER SCALE & REFLECTION SHIMMER */}
        <div className="w-full relative overflow-hidden bg-slate-50 aspect-square flex items-center justify-center p-3 sm:p-4">
          <img
            src={image}
            alt={title}
            className={`
              w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-60 lg:h-60 
              object-cover rounded-md sm:rounded-lg 
              transition-transform duration-700 ease-out 
              md:group-hover:scale-105
              ${isOutOfStock ? "opacity-40 blur-[1px]" : ""}
            `}
            loading="lazy"
          />

          {/* GLASS-SHINE SHIMMER - Visible on hover for desktop */}
          <div
            className="
            absolute inset-0 w-[200%] h-full 
            bg-linear-to-r from-transparent via-white/20 to-transparent 
            -skew-x-12 -translate-x-[150%] 
            md:group-hover:translate-x-[150%] 
            transition-transform duration-1000 ease-out 
            pointer-events-none hidden md:block
          "
          />

          {/* OUT OF STOCK GLASS BADGE */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] sm:backdrop-blur-xs flex items-center justify-center transition-all duration-300">
              <span
                className="
                bg-rose-500 text-white 
                text-[8px] sm:text-[10px] md:text-xs 
                font-black 
                px-2 sm:px-3 py-1 sm:py-1.5 
                rounded-full shadow-md tracking-widest uppercase 
                transition-transform duration-300 
                md:group-hover:scale-105
              "
              >
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* DETAILS SECTION - Reduced spacing */}
        <div className="p-2.5 sm:p-3 md:p-4 flex flex-col gap-1 sm:gap-1.5 flex-1 bg-white">
          {/* TITLE */}
          <h3
            className="
    text-sm sm:text-base
    font-semibold md:font-bold
    text-slate-800
    overflow-hidden
    text-ellipsis
    whitespace-nowrap
    w-full
  "
          >
            {title}
          </h3>

          {/* DESCRIPTION - Hidden on mobile, visible on tablet+ */}
          {description && (
            <p
              className="
    hidden sm:block
    text-xs
    text-slate-500
    overflow-hidden
    leading-relaxed
  "
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {description?.replace(/<[^>]*>?/gm, "")}
            </p>
          )}

          {/* SIZE / VARIANT BADGE */}
          {size && (
            <div className="mb-1 sm:mb-1.5">
              <span
                className="
                inline-block 
                bg-slate-50 border border-slate-200 
                text-slate-600 
                text-[10px] sm:text-xs 
                px-2 sm:px-2.5 py-0.5 sm:py-1 
                rounded-md 
                font-medium 
                transition-all duration-300 
                md:group-hover:bg-emerald-50/50 
                md:group-hover:border-emerald-200
              "
              >
                Pack: {size}
              </span>
            </div>
          )}

          {/* PRICE TAG AREA - Tighter spacing */}
          <div
            className="
            mt-auto pt-1.5 sm:pt-2
            border-t border-slate-50 
            flex items-center justify-between 
            transition-all duration-300 
            md:group-hover:border-emerald-100
          "
          >
            <div className="flex flex-col gap-0">
              <span
                className="
                text-[8px] sm:text-[10px] md:text-[10px]
                uppercase tracking-wider 
                text-slate-400 
                font-semibold
                leading-none
                mb-0.5
              "
              >
                Price
              </span>
              <span
                className="
                font-semibold md:font-bold
                text-slate-900 
                leading-none 
                transition-transform duration-300 
                md:group-hover:translate-x-0.5
              "
              >
                ₹{price}
              </span>
            </div>
          </div>
        </div>

        {/* BUTTON / ACTION AREA - Compact */}
        <div className="px-2.5 sm:px-3 md:px-4 pb-2.5 sm:pb-3 md:pb-4 pt-0 bg-white">
          {!cartItem ? (
            <Button
              text={
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
                  <span className="text-[10px] sm:text-xs md:text-sm">
                    {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
                  </span>
                  {!isOutOfStock && (
                    <ShoppingCart
                      className="
                        w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 
                        transform transition-transform duration-300 
                        md:group-hover:translate-x-0.5
                      "
                    />
                  )}
                </div>
              }
              disabled={isOutOfStock}
              className={`
                w-full 
                h-9 sm:h-10 md:h-11 
                font-bold md:font-extrabold 
                rounded-md sm:rounded-lg 
                text-[10px] sm:text-xs md:text-sm 
                tracking-wider uppercase 
                transition-all duration-300 
                active:scale-[0.95] md:active:scale-95
                ${
                  isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-[#2A4150] text-white md:hover:shadow-lg md:hover:shadow-emerald-600/20"
                }
              `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (isOutOfStock) return;

                dispatch(
                  addToCart({
                    id,
                    name: title,
                    image,
                    price,
                    description,
                    stock,
                  }),
                );
              }}
            />
          ) : (
            <div
              className="
                w-full 
                h-9 sm:h-10 md:h-11 
                bg-[#2A4150] 
                rounded-md sm:rounded-lg 
                overflow-hidden 
                shadow-sm 
                border border-[#2A4150] 
                transition-transform duration-200 
                active:scale-[0.96]
              "
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <QuantitySelector
                variant="button"
                quantity={cartItem.quantity}
                showRemove={false}
                className="h-full w-full"
                onIncrease={() => {
                  if (isOutOfStock || cartItem.quantity >= stock) {
                    alert(`Only ${stock} items available`);
                    return;
                  }
                  dispatch(updateQty({ id, delta: 1 }));
                }}
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
      </div>
    </Link>
  );
}
