"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import { useOrder } from "@/lib/queries/useOrders";
import Button from "@/components/ui/Button";
import { 
  ArrowLeft, 
  AlertCircle, 
  Calendar, 
  ShoppingBag, 
  User, 
  MapPin, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Coins,
  CreditCard 
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_IMAGE_URL || "";

export default function OrderProductsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: order, isLoading, error } = useOrder(id);
  const [imgSrc, setImgSrc] = React.useState({});

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-white">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <p className="text-rose-700 font-medium">
            Failed to load order details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-6 bg-white">
        <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-36 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-slate-200 rounded-xl"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-200 rounded-xl"></div>
            <div className="h-32 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-white">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-amber-700 font-medium">
            Order not found. The order may have been removed or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const discount = order.discount || 0;
  const total = Number(order.total);
  const formattedDate = new Date(order.date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Processing: "bg-sky-50 text-sky-700 border-sky-200",
      Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styles[status] || styles.Pending;
  };

  const getPaymentBadge = (payment) => {
    const styles = {
      Pending: "bg-orange-50 text-orange-700 border-orange-200",
      Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Failed: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styles[payment] || styles.Pending;
  };

  return (
    <div className="p-4 md:p-8 w-full  bg-white min-h-screen text-slate-900 selection:bg-indigo-100">
      {/* Back Button Action Link */}
      <div className="mb-5">
        <Button
          text="Back to Orders"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.back()}
        />
      </div>

      {/* Top Bar / Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Order Overview
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-mono">
            ID: {order.id}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
          <Calendar className="h-4 w-4 text-slate-400" />
          Placed on {formattedDate}
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start ">
        {/* Left Column - Product Items & Shipping/Customer data */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items Segment */}
          <div>
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
              <ShoppingBag className="h-5 w-5 text-slate-400" />
              Items in Order ({order.items.length})
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => {
                const rawUrl = item.product.images?.[0]?.url;
                const computedSrc = rawUrl
                  ? rawUrl.startsWith("http")
                    ? rawUrl
                    : `${BASE_URL}${rawUrl}`
                  : "/placeholder-image.png";

                return (
                  <div
                    key={item.id}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex gap-4 md:gap-5"
                  >
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-white">
                      <Image
                        src={imgSrc[item.id] || computedSrc}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 768px) 96px, 112px"
                        className="object-cover"
                        onError={() => {
                          setImgSrc((prev) => ({
                            ...prev,
                            [item.id]: "/placeholder-image.png",
                          }));
                        }}
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-semibold text-base md:text-lg text-slate-900 truncate">
                            {item.product.name}
                          </h3>
                          <span className="text-base md:text-lg font-bold text-slate-900">
                            ₹
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                        {item.product.category && (
                          <span className="inline-block bg-white text-slate-600 px-2 py-0.5 rounded text-xs font-medium mt-1">
                            {item.product.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-slate-500 border-t border-slate-200 pt-3 mt-2">
                        <div>
                          Qty:{" "}
                          <span className="font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <div>
                          Price:{" "}
                          <span className="font-semibold text-slate-800">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer & Shipping Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-slate-400" />
                Customer Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">Name</span>
                  <span className="font-medium text-slate-700">
                    {order.customer?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium text-slate-700 break-all pl-4 text-right">
                    {order.customer?.email || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-medium text-slate-700">
                    {order.customer?.phone || "—"}
                  </span>
                </div>
              </div>
            </div>

            {order.shipping && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm">
                <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  Shipping Address
                </h2>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">
                    {order.shipping.firstName} {order.shipping.lastName}
                  </p>
                  <p>{order.shipping.address}</p>
                  <p>
                    {order.shipping.city}, {order.shipping.state} -{" "}
                    {order.shipping.pinCode}
                  </p>
                  {order.shipping.email && (
                    <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">
                      {order.shipping.email}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary & Status Trackers */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Order Summary Segment */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-lg text-slate-800 mb-4">
              Payment Summary
            </h2>
            <div className="space-y-3 text-sm pb-4 border-b border-slate-200">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({order.items.length} items)</span>
                <span className="text-slate-800 font-medium">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    -₹{discount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span className="text-slate-800 font-medium">
                  {total - subtotal + discount > 0
                    ? `₹${(total - subtotal + discount).toLocaleString("en-IN")}`
                    : "Free"}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center mb-6">
              <span className="font-bold text-slate-900 text-base">
                Grand Total
              </span>
              <span className="font-extrabold text-xl text-slate-900">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                {order.paymentMode || "—"}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-semibold border ${getPaymentBadge(order.payment)}`}
              >
                {order.payment}
              </span>
            </div>
          </div>

          {/* Conditional Alerts Section */}
          {(order.trackingId ||
            order.deliveredAt ||
            order.cancelReason ||
            order.rewardCredited) && (
            <div className="space-y-4">
              {/* Tracking Status */}
              {order.trackingId && (
                <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
                  <div className="flex items-center gap-2 text-sky-800 font-semibold text-sm">
                    <Truck className="h-4 w-4 shrink-0" />
                    Tracking Logistics
                  </div>
                  <div className="mt-2 text-xs text-sky-700/90 font-mono space-y-0.5">
                    <p>ID: {order.trackingId}</p>
                    {order.courierName && (
                      <p className="font-sans font-medium text-slate-600 mt-1">
                        Carrier: {order.courierName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Receipt Timestamp */}
              {order.deliveredAt && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Delivery Confirmed
                  </div>
                  <p className="mt-1 text-xs text-emerald-700">
                    Received on{" "}
                    {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {/* Cancel Exceptions */}
              {order.cancelReason && (
                <div className="bg-rose-50 rounded-xl border border-rose-200 p-4">
                  <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                    <XCircle className="h-4 w-4 shrink-0" />
                    Cancellation Reason
                  </div>
                  <p className="mt-1 text-xs text-rose-700 font-medium">
                    {order.cancelReason}
                  </p>
                </div>
              )}

              {/* Loyalty Program Reward Points */}
              {order.rewardCredited && (
                <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                  <div className="flex items-center gap-2 text-indigo-800 font-semibold text-sm">
                    <Coins className="h-4 w-4 shrink-0" />
                    Rewards Disbursed
                  </div>
                  <p className="mt-1 text-xs text-indigo-700">
                    Loyalty tokens credited successfully to this user identity
                    profile.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}