"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Minus,
  Plus,
  TicketPercent,
  Heart,
  ShoppingCart,
  Sparkles,
  Tag,
  Coins, 
} from "lucide-react";
import Link from "next/link";

import Button from "@/components/ui/Button";
import { useCreateOrder } from "@/lib/mutations/useOrders";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { openLogin } from "@/store/slices/authSlice";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import {
  useCreatePaymentOrder,
  useVerifyPayment,
} from "@/lib/mutations/usePayment";
import { useCoupons } from "@/lib/queries/useCoupon";
import { useApplyCoupon } from "@/lib/mutations/useCoupon";
import { useProducts } from "@/lib/queries/useProducts";
import ProductCard from "@/components/common/ProductCard";
import {
  useAddToCart,
  useUpdateCart,
  useRemoveCartItem,
  useClearCart,
} from "@/lib/mutations/useCart";
import {
  useAddToWishlist,
  useRemoveWishlistItem,
  useMoveToCart,
} from "@/lib/mutations/useWishlist";
import { useDispatch } from "react-redux";
import { useCart } from "@/lib/queries/useCart";
import { useWishlist } from "@/lib/queries/useWishlist";
import YouMightAlsoLike from "@/components/common/YouMightAlsoLike";
import { useRewardBalance } from "@/lib/queries/useRewards";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Sub-category row component with header
const SubCategoryRow = ({ subCategory, products }) => {
  if (!products || products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 last:mb-0"
    >
      <div className="flex items-center gap-2 mb-4">
        <Tag size={18} className="text-[#2A4150]" />
        <h3 className="text-base sm:text-lg font-bold text-slate-800">
          {subCategory}
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          ({products.length} items)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={
              product.images?.[0] || product.image || "/placeholder-image.jpg"
            }
            title={product.name}
            description={product.description}
            price={product.price}
            rating={product.rating || 4.5}
            reviews={product.reviews || 0}
            stock={product.stock}
            status={product.status}
            category={product.category}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default function CartPage() {
  // React Query hooks for Cart and Wishlist
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: wishlist, isLoading: isWishlistLoading } = useWishlist();
  const updateCart = useUpdateCart();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeWishlistItem = useRemoveWishlistItem();
  const moveToCart = useMoveToCart();
  const { data: rewardBalance } = useRewardBalance();
  const router = useRouter();
  const dispatch = useDispatch();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutateAsync: applyCouponMutation } = useApplyCoupon();
  const { data: couponsData = [] } = useCoupons();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Address state - keep Redux for address since it's not cart/wishlist related
  const { selectedAddressId, addresses } = useSelector(
    (state) => state.address,
  );
  const selectedAddress = addresses?.find(
  (addr) => addr.id === selectedAddressId
);

  const [coupon, setCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { mutateAsync: createPaymentOrder } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [activeTab, setActiveTab] = useState("cart");
  const [useReward, setUseReward] = useState(false);
  const [rewardDiscount, setRewardDiscount] = useState(0);
  // Extract items from API response
  const cartItems = cart?.items || [];
  const wishlistItems = wishlist?.items || [];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (couponsData?.length) {
      setAvailableCoupons(couponsData.filter((coupon) => coupon.isActive));
    }
  }, [couponsData]);

  
  const handleQuickApplyCoupon = async (code) => {
    setCoupon(code);

    try {
      setCouponLoading(true);
      setCouponError("");

      const data = await applyCouponMutation({
        couponCode: code,
        cartTotal: subtotal,
      });

      if (!data.success) {
        setCouponError(data.message);
        return;
      }

      setAppliedCoupon(data.couponCode);
      setCouponDiscount(data.discount);
      setCouponError("");
    } catch (error) {
      console.log(error);
      setCouponError(
        error?.response?.data?.message || "Failed to apply coupon",
      );
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleMoveToWishlist = (item) => {
    addToWishlist.mutate({
      productId: item.product.id,
    });
    removeCartItem.mutate(item.product.id);
  };

  const handleMoveToCartFromWishlist = (item) => {
    if (item.product.stock <= 0) {
      alert(
        "This product is currently Out of Stock and cannot be moved to Cart.",
      );
      return;
    }

    moveToCart.mutate({
      productId: item.product.id,
    });
  };

  const FREE_SHIPPING_MIN = 500;

  const { subtotal, shipping, discount, total, progress } = useMemo(() => {
    const sub = cartItems.reduce(
      (acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0),
      0,
    );

    const ship = sub >= FREE_SHIPPING_MIN || sub === 0 ? 0 : 0;
    const disc = couponDiscount;

    return {
      subtotal: sub,
      shipping: ship,
      discount: disc,
      total: sub - disc - rewardDiscount + ship,
      progress: Math.min((sub / FREE_SHIPPING_MIN) * 100, 100),
    };
  }, [cartItems, couponDiscount, rewardDiscount]);

  const maxRewardDiscount = subtotal * 0.1;

  const maxRewardPoints =
  Math.floor(maxRewardDiscount / 10) * 10;
  
  const availableRewardPoints = rewardBalance?.rewardPoints || 0;

  useEffect(() => {
  if (!useReward) {
    setRewardDiscount(0);
    return;
  }

  if (availableRewardPoints < 10) {
    setRewardDiscount(0);
    return;
  }

  const usablePoints = Math.min(
    availableRewardPoints,
    maxRewardPoints
  );

  setRewardDiscount(usablePoints / 10);

}, [useReward, availableRewardPoints, maxRewardPoints]);

  if (!isHydrated || isCartLoading || isWishlistLoading)
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#2A4150] border-t-transparent rounded-full"
        />
      </div>
    );

  if (
    cartItems.length === 0 &&
    wishlistItems.length === 0 &&
    !showSuccessDialog
  ) {
    return <EmptyCartView />;
  }

  const handleApplyCoupon = async () => {
    try {
      setCouponLoading(true);
      setCouponError("");

      const data = await applyCouponMutation({
        couponCode: coupon,
        cartTotal: subtotal,
      });

      if (!data.success) {
        setCouponError(data.message);
        setAppliedCoupon(null);
        setCouponDiscount(0);
        return;
      }

      setAppliedCoupon(data.couponCode);
      setCouponDiscount(data.discount);
      setCouponError("");
    } catch (error) {
      console.log(error);
      setCouponError(
        error?.response?.data?.message || "Failed to apply coupon",
      );
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      dispatch(openLogin());
      return;
    }

    if (!selectedAddress && !paymentMethod) {
      setErrorMsg("Please select address and payment method");
      return;
    }

    if (!selectedAddress) {
      setErrorMsg("Please select an address");
      return;
    }

    if (!paymentMethod) {
      setErrorMsg("Please select a payment method");
      return;
    }

    setErrorMsg("");

    const payload = {
      items: cartItems.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        price: Number(item.product.price),
      })),
      couponCode: appliedCoupon,
      discount: couponDiscount,
      useReward,
      shipping: {
        firstName: selectedAddress.firstName || "User",
        lastName: selectedAddress.lastName || "",
        email: selectedAddress.email || "test@example.com",
        address: selectedAddress.address,
        state: selectedAddress.state,
        city: selectedAddress.city,
        pinCode: selectedAddress?.pinCode ?? "",
      },
    };

    if (paymentMethod === "COD") {
      createOrder(payload, {
        onSuccess: (res) => {
          const orderId = res?.data?.data?.id;
          setCreatedOrderId(orderId);
          setShowSuccessDialog(true);
          clearCart.mutate();
        },
        onError: () => alert("Order failed"),
      });
      return;
    }

    if (paymentMethod === "ONLINE") {
      createOrder(payload, {
        onSuccess: async (res) => {
          try {
            const orderId = res?.data?.data?.id;
            const paymentData = await createPaymentOrder({ orderId });

            if (!paymentData?.success) {
              alert(paymentData?.message || "Payment failed");
              return;
            }

            const razorpayOrder = paymentData.data;

            const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
              amount: razorpayOrder.amount,
              currency: "INR",
              order_id: razorpayOrder.id,
              handler: async function (response) {
                await verifyPayment(response);
                setCreatedOrderId(orderId);
                setShowSuccessDialog(true);
                clearCart.mutate();
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
          } catch (error) {
            console.error(error);
            alert("Payment failed");
          }
        },
        onError: () => alert("Order failed"),
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[white] py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Title */}
          <motion.header
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#2A4150] transition-colors mb-3 sm:mb-4 text-xs sm:text-sm font-semibold"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Shop
            </Link>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {activeTab === "cart" ? "Your Cart" : "Your Wishlist"}{" "}
                <span className="text-slate-400 font-normal">
                  (
                  {activeTab === "cart"
                    ? cartItems.length
                    : wishlistItems.length}
                  )
                </span>
              </h1>

              {/* Tab Buttons */}
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab("cart")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      activeTab === "cart"
                        ? "bg-[#2A4150] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <ShoppingBag size={14} />
                    Cart ({cartItems.length})
                  </motion.button>
                )}

                {wishlistItems.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab("wishlist")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      activeTab === "wishlist"
                        ? "bg-pink-500 text-white"
                        : "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100"
                    }`}
                  >
                    <Heart
                      size={14}
                      className={activeTab === "wishlist" ? "fill-current" : ""}
                    />
                    Wishlist ({wishlistItems.length})
                  </motion.button>
                )}
              </div>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Main Content: Left Column */}
            <motion.div
              className="lg:col-span-8 space-y-4 md:space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {activeTab === "wishlist" ? (
                /* Wishlist Section */
                <>
                  {wishlistItems.length === 0 ? (
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-8 text-center"
                    >
                      <Heart
                        size={48}
                        className="mx-auto text-slate-300 mb-4"
                      />
                      <h3 className="text-lg font-bold text-slate-700 mb-2">
                        Your wishlist is empty
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Save items you love for later
                      </p>
                      <button
                        onClick={() => setActiveTab("cart")}
                        className="px-4 py-2 bg-[#2A4150] text-white rounded-xl text-sm font-bold"
                      >
                        View Cart
                      </button>
                    </motion.div>
                  ) : (
                    <motion.section
                      variants={fadeInUp}
                      className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100"
                    >
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-xl md:rounded-t-2xl border-b border-pink-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-lg">
                            <Heart size={20} className="fill-current" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                              Saved Items
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold">
                              {wishlistItems.length}{" "}
                              {wishlistItems.length === 1 ? "item" : "items"}{" "}
                              saved for later
                            </p>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence mode="popLayout">
                        {wishlistItems.map((item, index) => (
                          <motion.div
                            key={item.id || item.product?.id}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ delay: index * 0.05 }}
                            layout
                          >
                            <WishlistItem
                              item={item}
                              onMoveToCart={() =>
                                handleMoveToCartFromWishlist(item)
                              }
                              onRemove={() =>
                                removeWishlistItem.mutate(item.product.id)
                              }
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.section>
                  )}

                  {/* Quick Action */}
                  {wishlistItems.length > 0 && (
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white p-4 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm"
                    >
                      <button
                        onClick={() => {
                          wishlistItems.forEach((item) => {
                            handleMoveToCartFromWishlist(item);
                          });
                          setActiveTab("cart");
                        }}
                        className="w-full py-3 bg-[#2A4150] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                      >
                        Move All Items to Cart
                      </button>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Cart Section */
                <>
                  {cartItems.length > 0 ? (
                    <>
                      {/* Available Coupons */}
                      <motion.section
                        variants={fadeInUp}
                        className="bg-white p-4 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#2A4150] text-white flex items-center justify-center shadow-lg">
                              <TicketPercent size={20} />
                            </div>
                            <div>
                              <h3 className="text-base sm:text-lg font-black text-slate-900">
                                Available Coupons
                              </h3>
                              <p className="text-xs text-slate-400 font-semibold">
                                Apply & Save More
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase">
                            Save More
                          </span>
                        </div>

                        <div className="space-y-3">
                          {availableCoupons.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">
                              No coupons available at the moment
                            </p>
                          ) : (
                            availableCoupons.map((couponItem) => (
                              <div
                                key={couponItem.id}
                                className="border border-dashed border-[#2A4150]/20 rounded-2xl p-4 flex items-center justify-between gap-4 bg-[#2A4150]/[0.02]"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-[#2A4150] text-sm sm:text-base">
                                      {couponItem.code}
                                    </span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase">
                                      Active
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    {couponItem.discountType === "percentage"
                                      ? `${couponItem.discountValue}% OFF`
                                      : `₹${couponItem.discountValue} OFF`}
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    Min Order ₹{couponItem.minOrderAmount}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleQuickApplyCoupon(couponItem.code)
                                  }
                                  className="px-4 py-2 rounded-xl bg-[#2A4150] text-white text-xs sm:text-sm font-bold hover:opacity-90 transition"
                                >
                                  APPLY
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.section>

                      {/* Shipping Promo */}
                      <motion.section
                        variants={fadeInUp}
                        className="bg-white p-4 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`p-2 rounded-xl ${
                              shipping === 0
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-blue-100 text-[#2A4150]"
                            }`}
                          >
                            <Truck size={18} className="sm:w-5 sm:h-5" />
                          </motion.div>
                          <div>
                            <h4 className="font-bold text-slate-900 leading-none text-sm sm:text-base">
                              {shipping === 0
                                ? "Free Shipping Unlocked"
                                : "Almost there!"}
                            </h4>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 uppercase font-black tracking-wider">
                              {shipping === 0
                                ? "Your order ships for free"
                                : `Add ₹${FREE_SHIPPING_MIN - subtotal} for free delivery`}
                            </p>
                          </div>
                        </div>
                      </motion.section>

                      {/* Cart Items */}
                      <motion.div
                        variants={fadeInUp}
                        className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100"
                      >
                        <AnimatePresence mode="popLayout">
                          {cartItems.map((item, index) => (
                            <motion.div
                              key={item.id || item.product?.id}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 50 }}
                              transition={{ delay: index * 0.05 }}
                              layout
                            >
                              <CartItem
                                item={item}
                                onUpdate={(delta) => {
                                  const newQty = item.quantity + delta;
                                  if (newQty > item.product.stock) {
                                    alert(
                                      `Only ${item.product.stock} items available`,
                                    );
                                    return;
                                  }
                                  if (item.product.stock === 0) {
                                    alert("This product is out of stock");
                                    return;
                                  }
                                  updateCart.mutate({
                                    productId: item.product.id,
                                    quantity: newQty,
                                  });
                                }}
                                onRemove={() =>
                                  removeCartItem.mutate(item.product.id)
                                }
                                onMoveToWishlist={() =>
                                  handleMoveToWishlist(item)
                                }
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>

                      {/* Address & Payment Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div variants={fadeInUp}>
                          <SelectionCard
                            title="Shipping To"
                            icon={<MapPin size={18} />}
                            isError={!selectedAddress}
                            link="/customer/address"
                          >
                            {selectedAddress ? (
                              <div className="text-xs sm:text-sm">
                                <p className="font-bold text-slate-800">
                                  {selectedAddress.firstName}{" "}
                                  {selectedAddress.lastName}
                                </p>
                                <p className="text-slate-600">
                                  {selectedAddress.address}
                                </p>
                                <p className="text-slate-500">
                                  {selectedAddress.city},{" "}
                                  {selectedAddress.state} -{" "}
                                  {selectedAddress.pinCode}
                                </p>
                              </div>
                            ) : (
                              "Select an address to proceed"
                            )}
                          </SelectionCard>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                          <div className="bg-white p-4 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                              <CreditCard size={16} /> Payment
                            </h3>
                            <div className="flex gap-3">
                              {["ONLINE", "COD"].map((method) => (
                                <motion.button
                                  key={method}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setPaymentMethod(method)}
                                  className={`flex-1 py-2.5 sm:py-3 rounded-xl border-2 transition-all font-bold text-xs sm:text-sm ${
                                    paymentMethod === method
                                      ? "border-[#2A4150] bg-[#2A4150]/5 text-[#2A4150]"
                                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                                  }`}
                                >
                                  {method === "COD"
                                    ? "Cash on Delivery"
                                    : "Online"}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    /* Empty Cart but has Wishlist Items */
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-8 text-center"
                    >
                      <ShoppingBag
                        size={48}
                        className="mx-auto text-slate-300 mb-4"
                      />
                      <h3 className="text-lg font-bold text-slate-700 mb-2">
                        Your cart is empty
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        But you have {wishlistItems.length}{" "}
                        {wishlistItems.length === 1 ? "item" : "items"} in your
                        wishlist
                      </p>
                      <button
                        onClick={() => setActiveTab("wishlist")}
                        className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-bold"
                      >
                        View Wishlist
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>

            {/* Sidebar: Right Column - Only show when in cart view with items */}
           {activeTab === "cart" && cartItems.length > 0 && (
  <motion.aside
    className="w-full col-span-1 md:col-span-12 lg:col-span-4 space-y-4 sm:space-y-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    {/* Main Container: Absolute sticky position restricted only to desktop monitors (lg and up) */}
    <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 static lg:sticky lg:top-36 transition-all duration-300">
      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-5 pb-4 border-b border-slate-100">
        Order Summary
      </h2>

      {/* --- REWARDS SECTION --- */}
      <div className="mb-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-dashed border-[#2A4150]/20 bg-[#2A4150]/[0.02]">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex gap-2.5 sm:gap-3">
            <Coins 
              size={20} 
              className={useReward && availableRewardPoints >= 10 ? "text-emerald-600 mt-0.5 shrink-0" : "text-[#2A4150] mt-0.5 shrink-0"} 
            />
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm md:text-base">
                Use Reward Points
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                Available: <span className="font-bold text-[#2A4150]">{availableRewardPoints} pts</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 font-medium leading-tight">
                Min: 10 pts • Max: {maxRewardPoints} pts <span className="block sm:inline sm:text-slate-400/80">(10% of order)</span>
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={useReward}
            disabled={availableRewardPoints < 10}
            onChange={(e) => setUseReward(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#2A4150] focus:ring-[#2A4150] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 mt-1 shrink-0"
          />
        </div>

        {/* Validation Errors */}
        {availableRewardPoints < 10 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] sm:text-xs text-rose-500 font-semibold">
            <AlertCircle size={14} className="shrink-0" />
            Minimum 10 reward points required.
          </div>
        )}

        {/* Success Active State Banner */}
        {useReward && availableRewardPoints >= 10 && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2 justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Applied {Math.min(availableRewardPoints, maxRewardPoints)} points</span>
            </div>
            <div className="font-bold text-slate-800">
              Saved <span className="text-emerald-600 font-extrabold">₹{rewardDiscount}</span>
            </div>
          </div>
        )}
      </div>

      {/* --- PRICE BREAKDOWN PANEL --- */}
      <div className="space-y-3 sm:space-y-4 mb-5">
        <PriceRow label="Subtotal" value={subtotal} />
        <PriceRow 
          label="Shipping" 
          value={shipping} 
          isFree={shipping === 0} 
        />
        
        {discount > 0 && (
          <PriceRow 
            label="Coupon Discount" 
            value={discount} 
            isDiscount 
          />
        )}
        
        {rewardDiscount > 0 && (
          <PriceRow 
            label="Reward Discount" 
            value={rewardDiscount} 
            isDiscount 
          />
        )}

        {/* Total Metric Display */}
        <motion.div
          className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-end gap-2"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col">
            <span className="font-black text-slate-900 text-xs sm:text-sm md:text-base tracking-tight">
              Total Amount
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Inclusive of all taxes
            </span>
          </div>
          <motion.span
            key={total}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl font-black text-[#2A4150] tracking-tighter whitespace-nowrap"
          >
            ₹{total}
          </motion.span>
        </motion.div>
      </div>

      {/* --- MANUAL COUPON PANEL --- */}
      <div className="mb-5 pt-4 border-t border-slate-100">
        <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">
          Apply Promo Code
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            className="flex-1 w-full min-w-0 border border-slate-200 bg-slate-50/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold uppercase placeholder:normal-case tracking-wider outline-none transition focus:bg-white focus:border-[#2A4150] focus:ring-1 focus:ring-[#2A4150]"
          />

          <button
            onClick={handleApplyCoupon}
            disabled={couponLoading}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#2A4150] text-white text-xs font-black tracking-wider hover:bg-[#1E303C] disabled:opacity-50 transition shrink-0"
          >
            {couponLoading ? "APPLYING..." : "APPLY"}
          </button>
        </div>

        {appliedCoupon && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <CheckCircle2 size={14} className="shrink-0" />
            Code active: {appliedCoupon}
          </div>
        )}

        {couponError && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-500 font-bold">
            <AlertCircle size={14} className="shrink-0" />
            {couponError}
          </div>
        )}
      </div>

      {/* --- ERROR MESSAGE & ACTION BUTTON --- */}
      <div className="space-y-3">
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose-600 text-xs sm:text-sm font-bold flex items-center gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100"
          >
            <AlertCircle size={16} className="shrink-0" /> {errorMsg}
          </motion.div>
        )}
        
        <motion.div
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          <Button
            disabled={isPending}
            onClick={handlePlaceOrder}
            className="w-full py-3.5 sm:py-4 bg-[#2A4150] hover:bg-[#1E303C] text-white text-sm sm:text-base font-black uppercase tracking-widest rounded-xl transition shadow-lg shadow-[#2A4150]/10 flex items-center justify-center gap-2"
            text={isPending ? "Processing..." : "Place Order"}
            icon={<ChevronRight size={18} className="shrink-0" />}
          />
        </motion.div>
      </div>

      {/* --- TRUST BADGES --- */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-around items-center text-slate-400 opacity-60 gap-1">
        <div className="flex flex-col items-center gap-1 hover:text-[#2A4150] transition-colors cursor-default select-none">
          <ShieldCheck size={18} className="sm:size-5" />
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-1 hover:text-[#2A4150] transition-colors cursor-default select-none">
          <RotateCcw size={18} className="sm:size-5" />
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">Returns</span>
        </div>
        <div className="flex flex-col items-center gap-1 hover:text-[#2A4150] transition-colors cursor-default select-none">
          <CreditCard size={18} className="sm:size-5" />
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">Verified</span>
        </div>
      </div>
    </div>
  </motion.aside>
)}
          </div>

          {/* You Might Also Like Section - Grouped by Sub-Category */}
          {activeTab === "cart" && cartItems.length > 0 && <YouMightAlsoLike />}
        </div>
      </div>

      <ConfirmationDialog
        open={showSuccessDialog}
        variant="success"
        title="Order Placed Successfully!"
        description="Your order has been placed successfully. You can track your order status anytime."
        showCancelButton={false}
        confirmText="Track Order"
        onConfirm={() => {
          if (createdOrderId) {
            router.push(`/customer/orders/${createdOrderId}`);
          } else {
            console.error("Order ID missing");
          }
        }}
        onCancel={() => {
          setShowSuccessDialog(false);
          setCreatedOrderId(null);
        }}
      />
    </>
  );
}

// --- CartItem Component with Wishlist Button ---
const CartItem = ({ item, onUpdate, onRemove, onMoveToWishlist }) => (
  <motion.div
    layout
    className="p-4 sm:p-5 flex gap-3 sm:gap-4 group"
    whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
  >
    {/* Product Image */}
    <motion.div
      className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl md:rounded-2xl overflow-hidden border border-slate-100 shrink-0"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={item.product?.images?.[0]?.url || "/placeholder-image.jpg"}
        className="w-full h-full object-cover"
        alt={item.product?.name || "Product"}
      />
    </motion.div>

    {/* Product Info & Actions */}
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Left Side - Product Details */}
      <div className="flex-1">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
          {item.product?.name}
        </h3>
        <div
          className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2"
          style={{
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
          dangerouslySetInnerHTML={{
            __html: item.product?.description || "No description",
          }}
        />
        {/* Mobile Price */}
        <motion.span
          className="font-black text-slate-900 text-base block sm:hidden mt-2"
          key={(item.product?.price || 0) * item.quantity}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          ₹{(item.product?.price || 0) * item.quantity}
        </motion.span>
      </div>

      {/* Right Side - Price (Desktop) + Quantity + Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
        {/* Desktop Price */}
        <motion.span
          className="font-black text-slate-900 text-sm sm:text-base hidden sm:block min-w-[70px] text-right"
          key={(item.product?.price || 0) * item.quantity}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          ₹{(item.product?.price || 0) * item.quantity}
        </motion.span>

        {/* Quantity Selector */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(-1)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={14} />
          </motion.button>
          <span className="w-6 text-center font-semibold text-slate-800 text-sm sm:text-base">
            {item.quantity}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(1)}
            disabled={item.quantity >= (item.product?.stock || 0)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Move to Wishlist */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={onMoveToWishlist}
            className="p-1.5 sm:p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
            aria-label="Move to wishlist"
            title="Save for later"
          >
            <Heart size={16} className="sm:w-[18px] sm:h-[18px]" />
          </motion.button>

          {/* Remove Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={onRemove}
            className="p-1.5 sm:p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- WishlistItem Component ---
const WishlistItem = ({ item, onMoveToCart, onRemove }) => (
  <motion.div
    layout
    className="p-4 sm:p-5 flex gap-3 sm:gap-4 group"
    whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
  >
    {/* Product Image */}
    <motion.div
      className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl md:rounded-2xl overflow-hidden border border-slate-100 shrink-0"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={item.product?.images?.[0]?.url || "/placeholder-image.jpg"}
        className="w-full h-full object-cover"
        alt={item.product?.name || "Product"}
      />
    </motion.div>

    {/* Product Info & Actions */}
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
          {item.product?.name}
        </h3>
        <motion.span
          className="font-black text-slate-900 text-sm sm:text-base"
          key={item.product?.price}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          ₹{item.product?.price}
        </motion.span>
        {item.product?.stock === 0 && (
          <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
            Out of Stock
          </span>
        )}
        {item.product?.stock > 0 && item.product?.stock <= 5 && (
          <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
            Only {item.product.stock} left
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMoveToCart}
          disabled={item.product?.stock === 0}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1 ${
            item.product?.stock === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-[#2A4150] text-white hover:opacity-90"
          }`}
        >
          <ShoppingCart size={14} />
          Move to Cart
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={onRemove}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Remove from wishlist"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const PriceRow = ({ label, value, isFree, isDiscount }) => (
  <motion.div
    className={`flex justify-between text-xs sm:text-sm font-bold ${
      isDiscount ? "text-emerald-600" : "text-slate-500"
    }`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <span>{label}</span>
    <motion.span
      className={isFree ? "text-emerald-600" : ""}
      whileHover={{ scale: 1.05 }}
    >
      {isFree ? "FREE" : `${isDiscount ? "- " : ""}₹${value}`}
    </motion.span>
  </motion.div>
);

const SelectionCard = ({ title, icon, isError, children, link }) => (
  <motion.div
    className={`bg-white p-4 sm:p-5 rounded-xl md:rounded-2xl border shadow-sm transition-all h-full ${
      isError ? "border-red-100 bg-red-50/20" : "border-slate-200"
    }`}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex justify-between items-start mb-2 sm:mb-3">
      <h3 className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {icon} {title}
      </h3>
      <Link
        href={link}
        className="text-[10px] font-black text-blue-600 uppercase border-b border-blue-600"
      >
        change address
      </Link>
    </div>
    <div
      className={`text-xs sm:text-sm ${
        isError
          ? "text-red-500 font-bold flex items-center gap-1"
          : "text-slate-600 font-medium"
      }`}
    >
      {isError && <AlertCircle size={12} />} {children}
    </div>
  </motion.div>
);

const EmptyCartView = () => (
  <motion.div
    className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, type: "spring" }}
  >
    <motion.div
      className="relative mb-6 sm:mb-8"
      animate={{ rotate: [0, -5, 5, -5, 0] }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-slate-100 p-8 sm:p-10 rounded-full">
        <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300" />
      </div>
    </motion.div>
    <motion.h2
      className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      YOUR CART IS EMPTY
    </motion.h2>
    <motion.p
      className="text-slate-500 mb-6 sm:mb-8 max-w-xs font-medium text-sm sm:text-base"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      Looks like you haven&apos;t decided yet. Our new collection is waiting!
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href="/">
        <Button
          className="px-8 sm:px-12 py-3 sm:py-4 rounded-full shadow-lg shadow-slate-200 text-sm sm:text-base"
          text="Start Exploring"
          icon={<ArrowLeft size={18} className="sm:w-5 sm:h-5" />}
        />
      </Link>
    </motion.div>
  </motion.div>
);
