"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    const close = () => {
      setOpenMenu(false);
      setIsMobileMenuOpen(false);
    };
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
    router.push("/");
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

  // Short category names for menu
  const getShortName = (name) => {
    const shortNames = {
      "BEAUTY HAIR CARE SKIN CARE": "Beauty",
      "HEALTH & WELLNESS": "Health",
      "PERSONAL CARE": "Personal Care",
      "FOOD & NUTRITION": "Nutrition",
      // Add more mappings as needed
    };
    return shortNames[name] || name;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-sm">
        {/* Main Header - Reduced padding */}
        <div className="mx-auto max-w-full px-3 sm:px-4 lg:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-3">
            {/* LEFT SECTION: Menu + Logo */}
            <div className="flex items-center gap-1">
              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-[#2A4150] transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={22} />
              </button>

              {/* Logo - Always on left */}
              <Link href="/" className="shrink-0 flex items-center gap-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="
                                h-10
                                sm:h-12
                                md:h-14
                                lg:h-16
                                w-auto
                                max-w-45
                                object-contain
                                scale-110
                              "
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter">
                    <span className="text-[#2A4150]">G</span>
                    <span className="text-[#9ca0a3]">LAM</span>
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Search - Centered (hidden on mobile) */}
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

            {/* RIGHT SECTION: Search Icon + Cart + User */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              {/* Mobile Search Icon */}
              <button className="lg:hidden p-2 text-slate-600 hover:text-[#2A4150] transition-colors">
                <Search size={22} />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 text-slate-600 hover:text-[#2A4150] p-2 transition-colors"
              >
                <div className="relative">
                  <ShoppingCart size={22} className="md:w-6 md:h-6" />
                  {totalQuantity > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2A4150] text-[10px] font-bold text-white ring-2 ring-white">
                      {totalQuantity}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-sm font-medium">
                  Cart
                </span>
              </Link>

              {/* User Section */}
              <div className="relative" ref={menuRef}>
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
                    className="px-3 py-1.5 text-xs sm:text-sm md:px-5 md:py-2 font-medium"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search - Below header */}
        <div className="px-3 pb-2 lg:hidden">
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
            placeholder="Search products..."
          />
        </div>

        {/* Desktop Navigation - Compact & Balanced */}
        <nav className="hidden lg:block border-t border-slate-50 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <ul className="flex items-center justify-center gap-2 xl:gap-4 py-2">
              <li>
                <NavLink item="HOME" />
              </li>
              <li className="text-slate-300 select-none">|</li>
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <NavLink item={cat} />
                </li>
              ))}
              <li className="text-slate-300 select-none">|</li>
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

      {/* MOBILE SIDEBAR MENU */}
      <div
        className={`fixed inset-0 z-100 transition-visibility duration-300 ${isMobileMenuOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <span className="font-bold text-lg text-[#2A4150]">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-60px)] py-2">
            <MobileNavLink
              item="HOME"
              onClose={() => setIsMobileMenuOpen(false)}
            />
            {categories.map((cat) => (
              <MobileNavLink
                key={cat.id}
                item={cat}
                onClose={() => setIsMobileMenuOpen(false)}
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
        </aside>
      </div>

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

  // Short display name
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

function MobileNavLink({ item, onClose }) {
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
    <div className="border-b border-slate-50 last:border-0">
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
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {hasSub && isOpen && (
        <div className="bg-slate-50/50 py-1">
          {item.subCategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/category/${sub.name.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={onClose}
              className="block px-10 py-3 text-sm text-slate-600 hover:text-[#2A4150] hover:bg-white transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
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
