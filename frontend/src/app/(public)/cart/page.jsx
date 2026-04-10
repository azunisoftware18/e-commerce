"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import QuantitySelector from "@/components/common/QuantitySelector";

import { removeFromCart, updateQty, setCart } from "@/store/slices/cartSlice";
import { setAddress } from "@/store/slices/addressSlice";
import { useCreateOrder } from "@/lib/mutations/useOrders";
import { useRouter } from "next/navigation";
import { openLogin } from "@/store/slices/authSlice";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";

export default function CartPage() {
  const dispatch = useDispatch();
  const reduxItems = useSelector((state) => state.cart.items);
  const { selectedAddressId, addresses } = useSelector(
    (state) => state.address,
  );
  const router = useRouter();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [coupon, setCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) dispatch(setCart(JSON.parse(cartData)));

    const addressData = localStorage.getItem("address");
    if (addressData) dispatch(setAddress(JSON.parse(addressData)));

    setIsHydrated(true);
  }, [dispatch]);

  const FREE_SHIPPING_MIN = 500;
  const DISCOUNT_THRESHOLD = 1000;

  const { subtotal, shipping, discount, total, progress } = useMemo(() => {
    const sub = reduxItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const ship = sub >= FREE_SHIPPING_MIN || sub === 0 ? 0 : 40;
    const disc = sub > DISCOUNT_THRESHOLD ? 100 : 0;
    return {
      subtotal: sub,
      shipping: ship,
      discount: disc,
      total: sub - disc + ship,
      progress: Math.min((sub / FREE_SHIPPING_MIN) * 100, 100),
    };
  }, [reduxItems]);

  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  if (!isHydrated) return <div className="min-h-screen bg-[#F8FAFC]" />;

  if (reduxItems.length === 0 && !showSuccessDialog) {
    return <EmptyCartView />;
  }

  const handlePlaceOrder = () => {
    // 🔐 CHECK LOGIN FIRST
    if (!isAuthenticated) {
      dispatch(openLogin());
      return;
    }

    if (!selectedAddress || !paymentMethod) {
      alert("Please select address and payment method");
      return;
    }

    const payload = {
      items: reduxItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      shipping: {
        firstName: selectedAddress.firstName || "User",
        lastName: selectedAddress.lastName || "",
        email: selectedAddress.email || "test@gmail.com",
        address: selectedAddress.address,
        city: selectedAddress.city,
        pinCode: selectedAddress?.pinCode ?? "",
      },
      payment: paymentMethod,
    };

    createOrder(payload, {
      onSuccess: (res) => {
        const orderId = res?.data?.data?.id;

        console.log("ORDER RESPONSE:", res);

        setCreatedOrderId(orderId);
        setShowSuccessDialog(true);

        dispatch(setCart([]));
        localStorage.removeItem("cart");
      },
      onError: (err) => {
        console.log(err);
        alert("Order failed");
      },
    });
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] py-8 md:py-12 px-4 animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb & Title */}
          <header className="mb-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#2A4150] transition-colors mb-4 text-sm font-semibold"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Shop
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Your Bag{" "}
              <span className="text-slate-400 font-normal">
                ({reduxItems.length})
              </span>
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content: Left Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Shipping Promo */}
              <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`p-2 rounded-xl ${shipping === 0 ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-[#2A4150]"}`}
                  >
                    <Truck size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none">
                      {shipping === 0
                        ? "Free Shipping Unlocked"
                        : "Almost there!"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-wider">
                      {shipping === 0
                        ? "Your order ships for free"
                        : `Add ₹${FREE_SHIPPING_MIN - subtotal} for free delivery`}
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${shipping === 0 ? "bg-emerald-500" : "bg-[#2A4150]"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </section>

              {/* Cart Items */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                {reduxItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdate={(delta) =>
                      dispatch(updateQty({ id: item.id, delta }))
                    }
                    onRemove={() => dispatch(removeFromCart(item.id))}
                  />
                ))}
              </div>

              {/* Address & Payment Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectionCard
                  title="Shipping To"
                  icon={<MapPin size={18} />}
                  isError={!selectedAddress}
                  link="/customer/address"
                >
                  {selectedAddress ? (
                    <div className="text-sm">
                      <p className="font-bold text-slate-800">
                        {selectedAddress.address}
                      </p>
                      <p className="text-slate-500">
                        {selectedAddress.city}, {selectedAddress.state}
                      </p>
                    </div>
                  ) : (
                    "Select an address to proceed"
                  )}
                </SelectionCard>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CreditCard size={18} /> Payment
                  </h3>
                  <div className="flex gap-3">
                    {["ONLINE", "COD"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                          paymentMethod === method
                            ? "border-[#2A4150] bg-[#2A4150]/5 text-[#2A4150]"
                            : "border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {method === "COD" ? "Cash" : "UPI/Card"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar: Right Column */}
            <aside className="lg:col-span-4 lg:sticky lg:top-8 space-y-4">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <h2 className="text-xl font-black text-slate-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <PriceRow label="Subtotal" value={subtotal} />
                  <PriceRow
                    label="Shipping"
                    value={shipping}
                    isFree={shipping === 0}
                  />
                  {discount > 0 && (
                    <PriceRow
                      label="Bag Discount"
                      value={-discount}
                      isDiscount
                    />
                  )}

                  <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-end">
                    <span className="font-bold text-slate-900">
                      Total Amount
                    </span>
                    <span className="text-3xl font-black text-[#2A4150] tracking-tighter italic">
                      ₹{total}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* <InputField
                  buttonText="Apply"
                  showButton={true}
                  placeholder="Coupon Code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="h-12 rounded-xl"
                />
                 */}
                  <Button
                    disabled={!selectedAddress || !paymentMethod || isPending}
                    onClick={handlePlaceOrder}
                    className="w-full py-4 text-lg font-black uppercase tracking-wider"
                    text="Place Order"
                    icon={<ChevronRight size={20} />}
                  />
                </div>

                {/* Security Badges */}
                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-around opacity-40 grayscale">
                  <ShieldCheck size={20} />
                  <RotateCcw size={20} />
                  <CreditCard size={20} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        open={showSuccessDialog}
        variant="success"
        title="Order Placed Successfully "
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

// --- Sub-Components for Cleanliness ---

const CartItem = ({ item, onUpdate, onRemove }) => (
  <div className="p-5 flex gap-4 group">
    <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
      <img
        src={item.image}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        alt={item.name}
      />
    </div>
    <div className="flex-1 flex flex-col justify-between">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold text-slate-900">{item.name}</h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {item.description || "No description"}
          </p>
        </div>

        <span className="font-black text-slate-900">
          ₹{item.price * item.quantity}
        </span>
      </div>
      <div className="mt-6 sm:mt-0">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() => onUpdate(1)}
          onDecrease={() => onUpdate(-1)}
          onRemove={onRemove}
        />
      </div>
    </div>
  </div>
);

const PriceRow = ({ label, value, isFree, isDiscount }) => (
  <div
    className={`flex justify-between text-sm font-bold ${isDiscount ? "text-emerald-600" : "text-slate-500"}`}
  >
    <span>{label}</span>
    <span className={isFree ? "text-emerald-600" : ""}>
      {isFree ? "FREE" : `₹${value}`}
    </span>
  </div>
);

const SelectionCard = ({ title, icon, isError, children, link }) => (
  <div
    className={`bg-white p-5 rounded-2xl border shadow-sm transition-all ${isError ? "border-red-100 bg-red-50/20" : "border-slate-200"}`}
  >
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {icon} {title}
      </h3>
      <Link
        href={link}
        className="text-[10px] font-black text-blue-600 uppercase border-b border-blue-600"
      >
        Edit
      </Link>
    </div>
    <div
      className={`text-sm ${isError ? "text-red-500 font-bold flex items-center gap-1" : "text-slate-600 font-medium"}`}
    >
      {isError && <AlertCircle size={14} />} {children}
    </div>
  </div>
);

const EmptyCartView = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
    <div className="bg-slate-100 p-10 rounded-full mb-8 relative">
      <ShoppingBag className="w-16 h-16 text-slate-300" />
      <div className="absolute top-0 right-0 w-6 h-6 bg-[#2A4150] rounded-full border-4 border-white" />
    </div>
    <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">
      YOUR BAG IS EMPTY
    </h2>
    <p className="text-slate-500 mb-8 max-w-xs font-medium italic">
      Looks like you haven't decided yet. Our new collection is waiting!
    </p>
    <Link href="/">
      <Button
        className="px-12 py-4 rounded-full shadow-lg shadow-slate-200"
        text="Start Exploring"
        icon={<ArrowLeft size={20} />}
      />
    </Link>
  </div>
);
