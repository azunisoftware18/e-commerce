"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  User,
  MapPin,
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Search,
} from "lucide-react";

import SearchField from "./ui/SearchField";
import LoginModal from "./modals/LoginModal";
import Button from "./ui/Button";
import { closeLogin, logout, openLogin } from "@/store/slices/authSlice";
import { useCategories } from "@/lib/queries/useCategories";
import { useProducts } from "@/lib/queries/useProducts";
import { useSettings } from "@/lib/queries/useSettings";

// Animated Hamburger Icon Component
function AnimatedMenuIcon({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-8 h-8 flex items-center justify-center focus:outline-none lg:hidden"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="relative w-5 h-5">
        <motion.span
          className="absolute left-0 top-0 h-0.5 bg-slate-600 rounded-full"
          style={{ width: "100%" }}
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 8 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
        <motion.span
          className="absolute left-0 top-1/2 h-0.5 bg-slate-600 rounded-full"
          style={{ width: "100%", y: "-50%" }}
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -20 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="absolute left-0 bottom-0 h-0.5 bg-slate-600 rounded-full"
          style={{ width: "100%" }}
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -8 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </button>
  );
}

// Animated Cart Icon Component
function AnimatedCartIcon({ quantity }) {
  const [previousQuantity, setPreviousQuantity] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (quantity > 0 && quantity > previousQuantity) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
    setPreviousQuantity(quantity);
  }, [quantity, previousQuantity]);

  return (
    <div id="header-cart">
      <Link
        href="/cart"
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2A4150] text-white font-medium text-xs hover:scale-105 transition-all duration-300"
      >
        <motion.div
          className="relative"
          animate={
            isAnimating
              ? {
                  scale: [1, 1.2, 0.9, 1.1, 1],
                }
              : {}
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <ShoppingCart size={22} className="md:w-4 md:h-6" />

          <AnimatePresence mode="wait">
            {quantity > 0 && (
              <motion.span
                key={quantity}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                  },
                }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white"
              >
                {quantity}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <span className="hidden lg:inline text-sm font-semibold">Cart</span>
      </Link>
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(true);
  const lastScrollY = useRef(0);
  const isSearchManuallyOpened = useRef(false);
  const { user, isAuthenticated, openLoginModal } = useSelector(
    (state) => state.auth,
  );
  const cartItems = useSelector((state) => state.cart.items);
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const { data: products = [] } = useProducts();

  const searchResults = products
    .filter((p) =>
      [p.name, p.category?.name, p.subCategory?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .slice(0, 5);

  // Handle scroll behavior for mobile search
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (isSearchManuallyOpened.current) {
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowMobileSearch(false);
        setIsMobileSearchOpen(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowMobileSearch(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", () => setOpenMenu(false));

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", () => setOpenMenu(false));
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setOpenMenu(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const toggleMobileSearch = () => {
    const newState = !isMobileSearchOpen;
    setIsMobileSearchOpen(newState);

    if (newState) {
      setShowMobileSearch(true);
      isSearchManuallyOpened.current = true;
    } else {
      isSearchManuallyOpened.current = false;
      if (window.scrollY > 100) {
        setShowMobileSearch(false);
      }
    }
  };

  const getLogoUrl = () => {
    if (!settings) return null;

    if (settings.logoSignedUrl) {
      return settings.logoSignedUrl;
    }

    if (
      settings.logo &&
      typeof settings.logo === "string" &&
      settings.logo.startsWith("http")
    ) {
      return settings.logo;
    }

    if (settings.logoKey) {
      return `https://azzunique-fintech-node.s3.ap-south-1.amazonaws.com/${settings.logoKey}`;
    }

    return null;
  };

  const logoUrl = getLogoUrl();

  const words = (settings?.companyName || "").trim().split(" ");

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-full px-3 sm:px-4 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-3">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 flex-shrink-0">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-[60px] sm:h-[68px] md:h-[75px] lg:h-[85px] w-auto object-contain"
                />

                {settings?.companyName && (
                  <div className="flex flex-col items-start sm:items-center antialiased -ml-2 sm:ml-0">
                    {/* --- MOBILE VIEW ME COMPANY NAME THODA CHOTA KIYA GAYA HAI (text-[15px] sm:text-[18px]) --- */}
                    <span className="relative inline-block text-[15px] sm:text-[18px] md:text-[22px] lg:text-[32px] font-serif leading-[0.9] whitespace-nowrap tracking-[0.02em] select-none capitalize">
                      <span className="text-[#2D5138] font-medium tracking-normal">
                        {words[0].toLowerCase()}
                      </span>{" "}
                      <span className="text-[#C29D6B] italic font-normal tracking-[0.01em]">
                        {words.slice(1).join(" ").toLowerCase()}
                      </span>
                      <span className="absolute -top-1 -right-4 text-[9px] sm:text-[11px] md:text-[13px] text-[#2D5138] font-sans font-normal normal-case">
                        &trade;
                      </span>
                    </span>

                    <span className="mt-2 text-center text-[8px] sm:text-[9px] md:text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-[#2D5138]">
                      Glam Your Beauty
                    </span>
                  </div>
                )}
              </Link>
            </div>

            <div className="hidden lg:block flex-1 max-w-2xl mx-4 xl:mx-8">
              <SearchField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                results={searchResults}
                showResults
                onResultClick={(item) => {
                  router.push(
                    `/category/${item.category?.name
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")}?search=${item.name}`,
                  );
                }}
                placeholder="Search products, categories..."
              />
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              <button
                className="lg:hidden p-2 text-slate-600 hover:text-[#2A4150] transition-colors"
                onClick={toggleMobileSearch}
              >
                {isMobileSearchOpen ? <X size={22} /> : <Search size={22} />}
              </button>

              <AnimatedCartIcon quantity={totalQuantity} />

              <div className="relative hidden lg:block" ref={menuRef}>
                {isAuthenticated ? (
                  <UserDropdown
                    user={user}
                    isOpen={openMenu}
                    setOpen={setOpenMenu}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Button
                    text="Login"
                    onClick={() => dispatch(openLogin())}
                    className="px-3 py-1.5 text-xs sm:text-sm md:px-5 md:py-2 font-medium rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                  />
                )}
              </div>

              <AnimatedMenuIcon
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(true)}
              />
            </div>
          </div>
        </div>

        <div
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileSearchOpen && showMobileSearch
              ? "max-h-20 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-3 pb-2">
            <SearchField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              results={searchResults}
              showResults
              onResultClick={(item) => {
                router.push(
                  `/category/${item.category?.name
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")}?search=${item.name}`,
                );
                setIsMobileSearchOpen(false);
                isSearchManuallyOpened.current = false;
              }}
              placeholder="Search products..."
            />
          </div>
        </div>

        <nav className="hidden lg:block border-t border-slate-50 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <ul className="flex items-center justify-center gap-2 xl:gap-4 py-2">
              <li>
                <NavLink item="HOME" />
              </li>
              <li className="text-slate-300 select-none"></li>
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <NavLink item={cat} />
                </li>
              ))}
              <li className="text-slate-300 select-none"></li>
              <li>
                <NavLink item="DIET PLANS" />
              </li>
              <li>
                <NavLink item="EXPERTS" />
              </li>
              <li>
                <NavLink item="ABOUT US" />
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* MOBILE SIDEBAR MENU - Animated */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="font-bold text-lg text-[#2A4150]">Menu</span>
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={22} />
                </motion.button>
              </div>

              <div className="overflow-y-auto h-[calc(100%-60px)]">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-[#2A4150] text-white p-2.5">
                          <User size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-[#2A4150] truncate capitalize">
                            {user?.name || "Customer"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user?.email || "Account & Orders"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href="/customer/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-center py-2 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-[#2A4150] hover:text-[#2A4150] transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/customer/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-center py-2 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-[#2A4150] hover:text-[#2A4150] transition-colors"
                        >
                          Orders
                        </Link>
                      </div>

                      <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/60">
                        <Link
                          href="/customer/address"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1.5 text-xs font-medium text-slate-600 hover:text-[#2A4150]"
                        >
                          Manage Address
                        </Link>
                        {user?.role?.toLowerCase() === "admin" && (
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="py-1.5 text-xs font-medium text-blue-600 hover:underline"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-1.5 py-1.5 text-xs font-semibold text-red-500 hover:text-red-600 text-left"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#2A4150]">Welcome!</p>
                        <p className="text-xs text-slate-500">Login to manage orders</p>
                      </div>
                      <button
                        onClick={() => {
                          dispatch(openLogin());
                          setIsMobileMenuOpen(false);
                        }}
                        className="px-4 py-2 bg-[#2A4150] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#1a2b36] transition-colors"
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>

                <div className="py-2">
                  <MobileNavLink
                    item="HOME"
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                  {categories.map((cat, idx) => (
                    <MobileNavLink
                      key={cat.id}
                      item={cat}
                      onClose={() => setIsMobileMenuOpen(false)}
                      index={idx}
                    />
                  ))}
                  <div className="border-t border-slate-100 my-2" />
                  <MobileNavLink
                    item="DIET PLANS"
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                  <MobileNavLink
                    item="EXPERTS"
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                  <MobileNavLink
                    item="ABOUT US"
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <LoginModal
        isOpen={openLoginModal}
        onClose={() => dispatch(closeLogin())}
      />
    </>
  );
}

// --- SUB-COMPONENTS ---

function NavLink({ item }) {
  const [hover, setHover] = useState(false);
  const isString = typeof item === "string";
  const name = isString ? item : item.name;
  const hasSubCategories = !isString && item.subCategories?.length > 0;

  const displayName = isString
    ? name
    : name.length > 15
      ? name.substring(0, 15) + "..."
      : name;

  let href;

  if (isString) {
    if (item === "HOME") {
      href = "/";
    } else if (item === "EXPERTS") {
      href = "/consultation";
    } else if (item === "DIET PLANS") {
      href = "/diet-plans";
    } else {
      href = `/${item.toLowerCase().replace(/\s+/g, "-")}`;
    }
  } else {
    href = `/category/${name.toLowerCase().replace(/\s+/g, "-")}`;
  }

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href={href}
        onClick={(e) => {
          if (!isString) {
            e.preventDefault();
          }
        }}
        className="group flex items-center gap-1 py-1.5 text-[11px] xl:text-xs font-semibold tracking-wide text-slate-600 hover:text-[#2A4150] transition-colors"
      >
        {displayName}

        {hasSubCategories && (
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${hover ? "rotate-180" : ""}`}
          />
        )}

        <span
          className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#2A4150] transition-all duration-300 ${
            hover ? "w-full" : "w-0"
          }`}
        />
      </Link>

      {hasSubCategories && (
        <div
          className={`absolute left-0 top-full z-100 min-w-50 pt-2 transition-all duration-200 ${
            hover
              ? "translate-y-0 opacity-100 visible"
              : "translate-y-2 opacity-0 invisible"
          }`}
        >
          <div className="overflow-hidden rounded-lg border border-slate-100 bg-white py-1 shadow-xl">
            {item.subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center justify-between px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-[#2A4150]"
              >
                {sub.name} <ChevronRight size={14} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavLink({ item, onClose, index = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const isString = typeof item === "string";
  const name = isString ? item : item.name;
  const hasSub = !isString && item.subCategories?.length > 0;

  let href;

  if (isString) {
    if (item === "HOME") {
      href = "/";
    } else if (item === "EXPERTS") {
      href = "/consultation";
    } else if (item === "DIET PLANS") {
      href = "/diet-plans";
    } else {
      href = `/${item.toLowerCase().replace(/\s+/g, "-")}`;
    }
  } else {
    href = `/category/${name.toLowerCase().replace(/\s+/g, "-")}`;
  }

  return (
    <motion.div
      className="border-b border-slate-50 last:border-0"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="flex items-center justify-between">
        <Link
          href={href}
          onClick={(e) => {
            if (!isString) {
              e.preventDefault();
            } else {
              onClose();
            }
          }}
          className="flex-1 px-5 py-3.5 text-sm font-semibold text-slate-700 tracking-wide"
        >
          {name}
        </Link>
        {hasSub && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-4 text-slate-400 hover:text-[#2A4150] transition-colors"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </button>
        )}
      </div>
      <AnimatePresence>
        {hasSub && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50/50 overflow-hidden"
          >
            <div className="py-1">
              {item.subCategories.map((sub, subIdx) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: subIdx * 0.05 }}
                >
                  <Link
                    href={`/category/${sub.name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={onClose}
                    className="block px-10 py-3 text-sm text-slate-600 hover:text-[#2A4150] hover:bg-white transition-colors"
                  >
                    {sub.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UserDropdown({ user, isOpen, setOpen, onLogout }) {
  const menuItems = [
    { label: "Your Profile", href: "/customer/profile" },
    { label: "Your Orders", href: "/customer/orders" },
    { label: "Manage Address", href: "/customer/address" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className="flex items-center gap-1 rounded-lg p-1.5 text-[#2A4150] transition-colors hover:bg-slate-50"
      >
        <div className="rounded-full bg-slate-100 p-1.5">
          <User size={20} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 animate-in fade-in zoom-in duration-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50">
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {user?.role?.toLowerCase() === "admin" && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 border-t border-slate-100 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </>
  );
}