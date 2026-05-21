"use client";

import { useRouter } from "next/navigation";
import {
  Package,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  ImageIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import AuthGuard from "@/components/common/AuthGuard";
import {
  useDeleteOrder,
  useDownloadInvoice,
  useUpdateOrder,
} from "@/lib/mutations/useOrders";
import { useState } from "react";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useOrders } from "@/lib/queries/useOrders";

export default function OrdersPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useOrders();
  const orders = data?.orders || data || [];
  const { mutate: updateOrder } = useUpdateOrder();
  const { mutate: downloadInvoice, isLoading: downloading } =
    useDownloadInvoice();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
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

  // Get product image URL
  const getProductImageUrl = (item) => {
    // Check item image first
    if (item.image) {
      return getImageUrl(item.image);
    }
    
    // Check product images
    if (item.product?.images?.[0]) {
      return getImageUrl(item.product.images[0]);
    }
    
    // Check product image
    if (item.product?.image) {
      return getImageUrl(item.product.image);
    }
    
    return null;
  };

  const handleImageError = (itemKey) => {
    setImageErrors((prev) => ({ ...prev, [itemKey]: true }));
  };

  const handleCancelClick = (id) => {
    setSelectedOrderId(id);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = (remark) => {
    updateOrder(
      {
        id: selectedOrderId,
        data: {
          status: "Cancelled",
          cancelReason: `USER: ${remark}`,
        },
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setSuccessOpen(true);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A4150] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Failed to load orders</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-[#2A4150] underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return {
          style: "text-emerald-600 bg-emerald-50 border-emerald-200",
          icon: <CheckCircle2 size={14} />,
          label: "Delivered",
        };
      case "pending":
        return {
          style: "text-amber-600 bg-amber-50 border-amber-200",
          icon: <Clock size={14} />,
          label: "Pending",
        };
      case "cancelled":
        return {
          style: "text-red-600 bg-red-50 border-red-200",
          icon: <XCircle size={14} />,
          label: "Cancelled",
        };
      case "processing":
        return {
          style: "text-blue-600 bg-blue-50 border-blue-200",
          icon: <Package size={14} />,
          label: "Processing",
        };
      case "shipped":
        return {
          style: "text-purple-600 bg-purple-50 border-purple-200",
          icon: <Package size={14} />,
          label: "Shipped",
        };
      default:
        return {
          style: "text-slate-600 bg-slate-50 border-slate-200",
          icon: <Package size={14} />,
          label: status || "Processing",
        };
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        {/* TOP NAVBAR */}
        <header className="bg-[#F8FAFC] backdrop-blur-md sticky top-0 z-30 px-6 py-4 w-full">
          <div className="w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  My Orders
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Track and manage your purchases
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="w-full mx-auto px-4 md:px-6 py-8 max-w-7xl">
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Package size={40} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No Orders Yet
              </h3>
              <p className="text-slate-500 mb-6">
                When you place orders, they'll appear here
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-[#2A4150] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1a2f3a] transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => {
                const config = getStatusConfig(order.status);
                return (
                  <div
                    key={order.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-6 bg-linear-to-r from-slate-50 to-white border-b border-slate-200">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Order Date
                            </p>
                            <div className="flex items-center gap-2 text-slate-700">
                              <Calendar size={16} className="text-slate-400" />
                              <span className="text-sm font-medium">
                                {new Date(
                                  order.date || order.createdAt,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                              Order ID
                            </p>
                            <p className="text-sm font-mono font-medium text-slate-700">
                              #{String(order.id).slice(-8).toUpperCase()}
                            </p>
                          </div>
                          {order.paymentMethod && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Payment
                              </p>
                              <p className="text-sm font-medium text-slate-700">
                                {order.paymentMethod}
                              </p>
                            </div>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${config.style}`}
                        >
                          {config.icon}
                          {config.label}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {(order.items || order.orderItems || []).map(
                          (item, idx) => {
                            const imageUrl = getProductImageUrl(item);
                            const itemKey = `${order.id}-${idx}`;
                            
                            return (
                              <div
                                key={idx}
                                className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                              >
                                {/* Product Image */}
                                <div className="shrink-0 w-20 h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                  {imageUrl && !imageErrors[itemKey] ? (
                                    <img
                                      src={imageUrl}
                                      alt={
                                        item.name || item.product?.name || "Product"
                                      }
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                      onError={() => handleImageError(itemKey)}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                      <ImageIcon size={24} className="text-slate-300" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">
                                    {item.name ||
                                      item.product?.name ||
                                      "Product Name"}
                                  </h4>
                                  {item.product?.category?.name && (
                                    <p className="text-xs text-slate-400 mb-1">
                                      {item.product.category.name}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2">
                                    <p className="text-sm text-slate-600">
                                      Qty: {item.quantity || 1}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">
                                      ₹
                                      {(
                                        (item.price || item.unitPrice || 0) *
                                        (item.quantity || 1)
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>

                      {/* Order Summary & Actions */}
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-baseline gap-3">
                            <span className="text-sm text-slate-500">
                              Total Amount:
                            </span>
                            <span className="text-2xl font-bold text-[#2A4150]">
                              ₹
                              {(
                                order.total ||
                                order.totalAmount ||
                                0
                              ).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => downloadInvoice(order.id)}
                              disabled={downloading}
                              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#2A4150] transition-colors rounded-xl border border-slate-200 hover:border-[#2A4150] disabled:opacity-50"
                            >
                              {downloading ? "Downloading..." : "Download Invoice"}
                            </button>
                            
                            {order.status?.toLowerCase() === "pending" && (
                              <button
                                onClick={() => handleCancelClick(order.id)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors rounded-xl border border-red-200 hover:border-red-300"
                              >
                                Cancel Order
                              </button>
                            )}
                            
                            <button
                              onClick={() =>
                                router.push(`/customer/orders/${order.id}`)
                              }
                              className="flex items-center justify-center gap-2 bg-[#2A4150] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#1a2f3a] transition-all duration-300 group/btn"
                            >
                              Track Order
                              <ChevronRight
                                size={16}
                                className="group-hover/btn:translate-x-0.5 transition-transform"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      
      <ConfirmationDialog
        open={confirmOpen}
        title="Cancel Order?"
        description="Are you sure you want to cancel this order?"
        confirmText="Yes, Cancel Order"
        cancelText="No"
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmOpen(false)}
        variant="danger"
        showRemark={true}
      />
      
      <ConfirmationDialog
        open={successOpen}
        title="Order Cancelled"
        description="Your order has been cancelled successfully."
        confirmText="OK"
        showCancelButton={false}
        variant="success"
        onConfirm={() => setSuccessOpen(false)}
      />
    </AuthGuard>
  );
}