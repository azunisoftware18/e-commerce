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
} from "lucide-react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";

import Button from "@/components/ui/Button";

import { removeFromCart, updateQty, setCart } from "@/store/slices/cartSlice";
import { setAddress } from "@/store/slices/addressSlice";
import { useCreateOrder } from "@/lib/mutations/useOrders";
import { useRouter } from "next/navigation";
import { openLogin } from "@/store/slices/authSlice";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import {
  useCreatePaymentOrder,
  useVerifyPayment,
} from "@/lib/mutations/usePayment";
import { useCoupons } from "@/lib/queries/useCoupon";
import { useApplyCoupon } from "@/lib/mutations/useCoupon";

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

export default function CartPage() {
  const dispatch = useDispatch();
  const reduxItems = useSelector((state) => state.cart.items);
  const { selectedAddressId, addresses } = useSelector(
    (state) => state.address,
  );
  const router = useRouter();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutateAsync: applyCouponMutation } = useApplyCoupon();
  const { data: couponsData = [] } = useCoupons();
  const { isAuthenticated } = useSelector((state) => state.auth);
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

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) dispatch(setCart(JSON.parse(cartData)));

    const addressData = localStorage.getItem("address");
    if (addressData) dispatch(setAddress(JSON.parse(addressData)));

    setIsHydrated(true);
  }, [dispatch]);
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

  const FREE_SHIPPING_MIN = 500;

  const { subtotal, shipping, discount, total, progress } = useMemo(() => {
    const sub = reduxItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const ship = sub >= FREE_SHIPPING_MIN || sub === 0 ? 0 : 0;

    const disc = couponDiscount;

    return {
      subtotal: sub,
      shipping: ship,
      discount: disc,
      total: sub - disc + ship,
      progress: Math.min((sub / FREE_SHIPPING_MIN) * 100, 100),
    };
  }, [reduxItems, couponDiscount]);
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  if (!isHydrated)
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#2A4150] border-t-transparent rounded-full"
        />
      </div>
    );

  if (reduxItems.length === 0 && !showSuccessDialog) {
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
      items: reduxItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      couponCode: appliedCoupon,
      discount: couponDiscount,
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
          dispatch(setCart([]));
          localStorage.removeItem("cart");
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
                dispatch(setCart([]));
                localStorage.removeItem("cart");
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
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] py-6 sm:py-8 md:py-12 px-3 sm:px-4">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Your Cart{" "}
              <span className="text-slate-400 font-normal">
                ({reduxItems.length})
              </span>
            </h1>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Main Content: Left Column */}
            <motion.div
              className="lg:col-span-8 space-y-4 md:space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Available Coupons */}
              <motion.section
                variants={fadeInUp}
                className="bg-white p-4 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
      w-10
      h-10
      rounded-2xl
      bg-[#2A4150]
      text-white
      flex
      items-center
      justify-center
      shadow-lg
    "
                    >
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
                  {availableCoupons.map((couponItem) => (
                    <div
                      key={couponItem.id}
                      className="
          border
          border-dashed
          border-[#2A4150]/20
          rounded-2xl
          p-4
          flex
          items-center
          justify-between
          gap-4
          bg-[#2A4150]/[0.02]
        "
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
                        onClick={() => handleQuickApplyCoupon(couponItem.code)}
                        className="
                                    px-4
                                    py-2
                                    rounded-xl
                                    bg-[#2A4150]
                                    text-white
                                    text-xs
                                    sm:text-sm
                                    font-bold
                                    hover:opacity-90
                                    transition
                                  "
                      >
                        APPLY
                      </button>
                    </div>
                  ))}
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
                  {reduxItems.map((item, index) => (
                    <motion.div
                      key={item.id}
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
                          if (newQty > item.stock) {
                            alert(`Only ${item.stock} items available`);
                            return;
                          }
                          if (item.stock === 0) {
                            alert("This product is out of stock");
                            return;
                          }
                          dispatch(updateQty({ id: item.id, delta }));
                        }}
                        onRemove={() => dispatch(removeFromCart(item.id))}
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
                          {selectedAddress.firstName} {selectedAddress.lastName}
                        </p>
                        <p className="text-slate-600">
                          {selectedAddress.address}
                        </p>
                        <p className="text-slate-500">
                          {selectedAddress.city}, {selectedAddress.state} -{" "}
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
                          {method === "COD" ? "Cash on Delivery" : "Online"}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Sidebar: Right Column */}
            <motion.aside
              className="lg:col-span-4 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-36">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4 sm:mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                  <PriceRow label="Subtotal" value={subtotal} />
                  <PriceRow
                    label="Shipping"
                    value={shipping}
                    isFree={shipping === 0}
                  />
                  {discount > 0 && (
                    <PriceRow
                      label="Discount"
                      value={`-₹${discount}`}
                      isDiscount
                    />
                  )}

                  <motion.div
                    className="pt-3 sm:pt-4 border-t border-dashed border-slate-200 flex justify-between items-end"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      Total Amount
                    </span>
                    <motion.span
                      key={total}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl sm:text-3xl font-black text-[#2A4150] tracking-tighter"
                    >
                      ₹{total}
                    </motion.span>
                  </motion.div>
                </div>
                {/* Coupon Section */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">
                    Apply Coupon
                  </h3>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      className="
        flex-1
        border
        border-slate-200
        rounded-xl
        px-4
        py-3
        text-sm
        outline-none
        focus:border-[#2A4150]
      "
                    />

                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="
        px-4
        py-3
        rounded-xl
        bg-[#2A4150]
        text-white
        text-sm
        font-bold
        hover:opacity-90
        transition
      "
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  </div>

                  {appliedCoupon && (
                    <div className="mt-3 text-sm text-green-600 font-semibold">
                      Coupon Applied: {appliedCoupon}
                    </div>
                  )}

                  {couponError && (
                    <div className="mt-3 text-sm text-red-500 font-semibold">
                      {couponError}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-xs sm:text-sm font-semibold flex items-center gap-2"
                    >
                      <AlertCircle size={14} /> {errorMsg}
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      disabled={isPending}
                      onClick={handlePlaceOrder}
                      className="w-full py-3 sm:py-4 text-base sm:text-lg font-black uppercase tracking-wider"
                      text={isPending ? "Processing..." : "Place Order"}
                      icon={
                        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                      }
                    />
                  </motion.div>
                </div>

                {/* Security Badges */}
                <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-50 flex justify-around opacity-40 grayscale">
                  <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
                  <RotateCcw size={18} className="sm:w-5 sm:h-5" />
                  <CreditCard size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>
            </motion.aside>
          </div>
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

// --- Updated CartItem with Quantity on Right Side ---
const CartItem = ({ item, onUpdate, onRemove }) => (
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
        src={item.image}
        className="w-full h-full object-cover"
        alt={item.name}
      />
    </motion.div>

    {/* Product Info & Actions */}
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Left Side - Product Details */}
      <div className="flex-1">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
          {item.name}
        </h3>
        <div
          className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2"
          style={{
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
          dangerouslySetInnerHTML={{
            __html: item.description || "No description",
          }}
        />
        {/* Mobile Price */}
        <motion.span
          className="font-black text-slate-900 text-base block sm:hidden mt-2"
          key={item.price * item.quantity}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          ₹{item.price * item.quantity}
        </motion.span>
      </div>

      {/* Right Side - Price (Desktop) + Quantity + Remove */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
        {/* Desktop Price */}
        <motion.span
          className="font-black text-slate-900 text-sm sm:text-base hidden sm:block min-w-[70px] text-right"
          key={item.price * item.quantity}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          ₹{item.price * item.quantity}
        </motion.span>

        {/* Quantity Selector */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(-1)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-bold text-base"
          >
            <Minus size={14} />
          </motion.button>
          <span className="w-6 text-center font-semibold text-slate-800 text-sm sm:text-base">
            {item.quantity}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(1)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center font-bold text-base"
          >
            <Plus size={14} />
          </motion.button>
        </div>

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
      {isFree ? "FREE" : `₹${value}`}
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
      Looks like you haven't decided yet. Our new collection is waiting!
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
