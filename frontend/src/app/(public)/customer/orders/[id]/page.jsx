"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  ShieldCheck,
  Download,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { useOrder } from "@/lib/queries/useOrders";
import AuthGuard from "@/components/common/AuthGuard";

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const { id: orderId } = React.use(params);
  const { data: order, isLoading, isError } = useOrder(orderId);
  const [imageErrors, setImageErrors] = useState({});

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // If image is an object with url/signedUrl
    if (typeof image === 'object') {
      if (image.signedUrl) return image.signedUrl;
      if (image.url) {
        if (image.url.startsWith('http')) return image.url;
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
    
    return null;
  };

  // Get product image URL from item
  const getItemImageUrl = (item) => {
    if (item.image) return getImageUrl(item.image);
    if (item.product?.images?.[0]) return getImageUrl(item.product.images[0]);
    if (item.product?.image) return getImageUrl(item.product.image);
    return null;
  };

  const handleImageError = (itemIndex) => {
    setImageErrors((prev) => ({ ...prev, [itemIndex]: true }));
  };

  // Helper to format dates consistently
  const formatDate = (dateString) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Logic to determine progress based on actual status
  const getStatusIndex = (status) => {
    const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
    const index = statuses.indexOf(status || "Pending");
    return index >= 0 ? index : 0;
  };

  const currentStatusIdx = getStatusIndex(order?.status);

  const trackingSteps = [
    { label: "Order Placed", date: formatDate(order?.createdAt) },
    { label: "Processing", date: currentStatusIdx >= 1 ? "In Progress" : "" },
    {
      label: "Shipped",
      date: order?.shippedAt ? formatDate(order.shippedAt) : "",
    },
    {
      label: "Delivered",
      date: order?.deliveredAt ? formatDate(order.deliveredAt) : "",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2A4150] rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Loading Order...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-slate-500 mb-8">
            We couldn't retrieve the details for this reference code.
          </p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-[#2A4150] text-white rounded-2xl font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getCancelReason = (reason) => {
    if (!reason) return null;
    if (reason.startsWith("USER:")) return null;
    return reason.replace(/^(STATUS|PAYMENT):\s*/, "");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shipped":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "delivered":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
        {/* HEADER */}
        <header className="bg-[#F8FAFC] backdrop-blur-md sticky top-0 z-30 px-6 py-4">
          <div className="w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2.5 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Order Details
                </h1>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded-md">
                    ID: {orderId.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    • {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* TRACKING TIMELINE */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
              {trackingSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIdx;
                const isCurrent = index === currentStatusIdx;

                return (
                  <div
                    key={index}
                    className="flex md:flex-col items-center gap-4 md:text-center flex-1 relative z-10"
                  >
                    {/* Line Connector */}
                    {index !== trackingSteps.length - 1 && (
                      <div className="hidden md:block absolute top-5 left-1/2 w-full h-0.5 bg-slate-100 -z-10">
                        <div
                          className={`h-full bg-emerald-500 transition-all duration-1000 ${isCompleted ? "w-full" : "w-0"}`}
                        />
                      </div>
                    )}

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-500 
                    ${isCompleted ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}
                    ${isCurrent ? "ring-4 ring-emerald-100 scale-110" : ""}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p
                        className={`text-[11px] font-black uppercase tracking-wider ${isCompleted ? "text-slate-900" : "text-slate-400"}`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {step.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: ITEMS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Package Contents
                  </h2>
                  <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                    {(order.items || order.orderItems || []).length} ITEMS
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {(order.items || order.orderItems || []).map((item, i) => {
                    const imageUrl = getItemImageUrl(item);
                    
                    return (
                      <div
                        key={i}
                        className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-6">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group">
                            {imageUrl && !imageErrors[i] ? (
                              <img
                                src={imageUrl}
                                alt={item.product?.name || "Product"}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={() => handleImageError(i)}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                <ImageIcon size={24} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-black text-slate-800 hover:text-[#2A4150] cursor-pointer flex items-center gap-2">
                              {item.product?.name || item.name || "Product"}
                              <ExternalLink
                                size={12}
                                className="text-slate-300"
                              />
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                              Quantity:{" "}
                              <span className="text-slate-900">
                                {item.quantity}
                              </span>
                            </p>
                            {item.product?.sku && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                SKU: {item.product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-black text-[#2A4150]">
                          ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BILLING */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                  Financial Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span>Items Subtotal</span>
                    <span className="text-slate-900 font-black">
                      ₹
                      {(order.total || order.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span>Shipping & Handling</span>
                    <span className="text-emerald-600 font-black tracking-tighter">
                      FREE
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span>Discount</span>
                      <span className="text-red-600 font-black">
                        -₹{order.discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Grand Total
                      </p>
                    </div>
                    <p className="text-4xl font-black text-[#2A4150] tracking-tighter">
                      ₹
                      {(order.total || order.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SIDEBAR */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-[#2A4150] rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <MapPin className="text-white" size={18} />
                    </div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-white/60">
                      Shipping To
                    </h2>
                  </div>
                  
                  {order.shipping ? (
                    <>
                      <p className="text-sm font-bold leading-relaxed mb-1">
                        {order.shipping.firstName} {order.shipping.lastName}
                      </p>
                      <p className="text-sm font-medium text-white/80 leading-relaxed">
                        {order.shipping.address}
                      </p>
                      <p className="text-sm font-medium text-white/80 leading-relaxed">
                        {order.shipping.city}, {order.shipping.state}{" "}
                        {order.shipping.pinCode || order.shipping.pincode}
                      </p>
                      {order.shipping.phone && (
                        <p className="text-sm font-medium text-white/80 leading-relaxed mt-2">
                          📞 {order.shipping.phone}
                        </p>
                      )}
                      {order.shipping.email && (
                        <p className="text-sm font-medium text-white/80 leading-relaxed">
                          ✉️ {order.shipping.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-white/60">No shipping details available</p>
                  )}
                </div>
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
              </div>

              {/* Tracking Details */}
              {(order.trackingId || order.courierName) && (
                <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Truck className="text-blue-600" size={18} />
                    </div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tracking Details
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {order.trackingId && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-semibold">
                          Tracking ID
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {order.trackingId}
                        </span>
                      </div>
                    )}
                    {order.courierName && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-semibold">
                          Courier
                        </span>
                        <span className="font-bold text-slate-900">
                          {order.courierName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8">
                <div
                  className={`p-4 rounded-2xl text-center border transition-colors ${
                    order.status === "Delivered"
                      ? "bg-emerald-50 border-emerald-100"
                      : order.status === "Cancelled"
                        ? "bg-red-50 border-red-100"
                        : "bg-blue-50 border-blue-100"
                  }`}
                >
                  <span
                    className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
                
                {order.status === "Cancelled" &&
                  getCancelReason(order.cancelReason) && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mt-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">
                        Cancel Reason
                      </p>
                      <p className="text-sm font-semibold text-red-700">
                        {getCancelReason(order.cancelReason)}
                      </p>
                    </div>
                  )}
                  
                {order.estimatedDelivery && (
                  <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Estimated Delivery
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {formatDate(order.estimatedDelivery)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}