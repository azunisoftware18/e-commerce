"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function AddToCartCard({
  id,
  name,
  price,
  image,
  description,
  reviews = 0,
  rating = 0,
  initialQty = 1,
  onAddToCart,
  showReviews = true,
}) {
  const [qty, setQty] = useState(initialQty);

  const increase = () => setQty((prev) => prev + 1);
  const decrease = () => {
    if (qty > 1) setQty((prev) => prev - 1);
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white w-full max-w-sm">
      {/* Price */}
      <h2 className="text-2xl font-semibold text-slate-800">₹{price}</h2>
      <p className="text-xs text-slate-500">Inclusive of all Taxes</p>

      {/* Reviews */}
      {showReviews && (
        <div className="flex items-center gap-2 mt-2 text-sm">
          <div className="flex items-center text-yellow-500">
            <Star size={14} fill="currentColor" />
            <span className="ml-1 text-slate-700">{rating}</span>
          </div>
          <span className="text-blue-600 font-medium">{reviews} Reviews</span>
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm text-slate-700">Quantity :</span>

        <div className="flex items-center border border-slate-300 rounded-md overflow-hidden">
          <button
            onClick={decrease}
            className="px-3 py-1 text-lg text-slate-700 hover:bg-slate-100"
          >
            −
          </button>

          <span className="px-4 text-sm">{qty}</span>

          <button
            onClick={increase}
            className="px-3 py-1 text-lg text-slate-700 hover:bg-slate-100"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={() =>
          onAddToCart?.({
            id,
            name,
            price,
            image,
            description,
            quantity: qty,
          })
        }
        className="mt-4 w-full bg-[#2A4150] hover:bg-[#1f313c] text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
      >
        🛒 ADD TO CART
      </button>
    </div>
  );
}
