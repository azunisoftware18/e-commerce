"use client";

import React from "react";
import { Star, BadgeCheck } from "lucide-react";
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
  className = "",
}) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartItem = cartItems.find((item) => item.id === id);
  return (
    <Link href={`/product/${id}`}>
      <div
        className={`relative bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col w-75 h-full ${className}`}>
        

        <div className="w-full">
          <img src={image} alt={title} className="w-full h-64 content-fit " />
        </div>

        <div className="px-4 pb-2 flex flex-col items-center text-center gap-2 flex-1 bg-[#e0e0e0]">
          <h3 className="text-[17px] leading-tight font-medium text-slate-800 line-clamp-2 min-h-11">
            {title}
          </h3>

          <p className="text-[15px] font-medium text-[#689F38] line-clamp-2 min-h-11">
            {description}
          </p>

          <span className="text-[16px] text-slate-700 font-medium mt-1 min-h-6">
            {size}
          </span>

          <div className="flex items-center justify-center gap-1 text-[14px] font-semibold text-slate-700 mt-1">
            
          </div>

          <div className="text-2xl font-bold text-slate-900 mt-auto">
            ₹{price}
          </div>
        </div>

        <div className="px-2 pb-2 bg-[#e0e0e0] mt-auto">
          {!cartItem ? (
            <Button
              text="ADD TO CART"
              className="w-full h-11.25 font-bold py-3 rounded-md text-lg tracking-wide bg-[#2A4150] text-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dispatch(
                  addToCart({
                    id,
                    name: title, 
                    image,
                    price,
                    description, 
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
      </div>
    </Link>
  );
}
