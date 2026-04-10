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
} from "lucide-react";

import SearchField from "./ui/SearchField";
import LoginModal from "./modals/LoginModal";
import Button from "./ui/Button";
import { closeLogin, logout, openLogin } from "@/store/slices/authSlice";
import { useCategories } from "@/lib/queries/useCategories";

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const { data: categories = [] } = useCategories();
  const [openMenu, setOpenMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, openLoginModal } = useSelector(
    (state) => state.auth,
  );
  const cartItems = useSelector((state) => state.cart.items);
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Close menus on click outside or scroll
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#e0e0e0] bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 -ml-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 text-xl font-black tracking-tighter md:text-3xl"
            >
              <span className="text-[#2A4150]">Azz</span>
              <span className="text-[#9ca0a3]">unique</span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden max-w-xl flex-1 mx-8 md:block">
              <SearchField showButton />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-6">
  
              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 text-slate-700 hover:text-[#2A4150] p-2"
              >
                <div className="relative">
                  <ShoppingCart size={22} className="md:w-6 md:h-6" />
                  {totalQuantity > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#2A4150] text-[10px] font-bold text-white">
                      {totalQuantity}
                    </span>
                  )}
                </div>
                <span className="hidden text-sm font-medium lg:inline">
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
                    className="px-3 py-1.5 text-xs md:text-sm md:px-6 md:py-2"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <SearchField showButton={false} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block border-t border-slate-50 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <ul className="flex items-center justify-between py-3">
              <li>
                <NavLink item="HOME" />
              </li>
              {categories.map((cat) => (
                <li key={cat.id} className="uppercase">
                  <NavLink item={cat} />
                </li>
              ))}
              <li>
                <NavLink item="FREE DIET PLANS" />
              </li>
              <li>
                <NavLink item="TALK TO OUR EXPERTS" />
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
          className={`absolute left-0 top-0 h-full w-70 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-bold text-[#2A4150]">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-60px)] py-4">
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
            <MobileNavLink
              item="ABOUT US"
              onClose={() => setIsMobileMenuOpen(false)}
            />
            <MobileNavLink
              item="FREE DIET PLANS"
              onClose={() => setIsMobileMenuOpen(false)}
            />
            <MobileNavLink
              item="TALK TO OUR EXPERTS"
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

  let href;

  if (isString) {
    if (item === "HOME") {
      href = "/";
    } else if (item === "TALK TO OUR EXPERTS") {
      href = "/consultation";
      } else if (item === "FREE DIET PLANS") {
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
        className="group flex items-center py-2 text-[11px] font-bold tracking-widest text-slate-600 hover:text-[#2A4150] md:text-[12px]"
      >
        {name}
        {hasSubCategories && (
          <ChevronDown
            size={14}
            className={`ml-1 transition-transform ${hover ? "rotate-180" : ""}`}
          />
        )}
        <span
          className={`absolute -bottom-1 left-0 h-0.5 bg-[#2A4150] transition-all ${hover ? "w-full" : "w-0"}`}
        />
      </Link>

      {hasSubCategories && (
        <div
          className={`absolute left-0 top-full z-100 min-w-55 pt-2 transition-all ${hover ? "translate-y-0 opacity-100 visible" : "translate-y-2 opacity-0 invisible"}`}
        >
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white py-2 shadow-2xl">
            {item.subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center justify-between px-5 py-3 text-[13px] font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-[#2A4150]"
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
    } else if (item === "TALK TO OUR EXPERTS") {
      href = "/consultation";
    } else if (item === "FREE DIET PLANS") {
      href = "/diet-plans";
    } else {
      href = `/${item.toLowerCase().replace(/\s+/g, "-")}`;
    }
  } else {
    href = `/category/${name.toLowerCase().replace(/\s+/g, "-")}`;
  }

  return (
    <div className="border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between px-4">
        <Link
          href={href}
          onClick={onClose}
          className="flex-1 py-4 text-sm font-bold text-slate-700 uppercase tracking-tight"
        >
          {name}
        </Link>
        {hasSub && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-4 text-slate-400"
          >
            <ChevronDown
              size={18}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {hasSub && isOpen && (
        <div className="bg-slate-50 py-2">
          {item.subCategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/category/${sub.name.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={onClose}
              className="block px-8 py-3 text-sm text-slate-600"
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
    // { label: "Contact Us", href: "/contact-us" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className="flex items-center gap-1 rounded-lg p-1 text-[#2A4150] transition-colors hover:bg-slate-50"
      >
        <div className="rounded-full bg-slate-100 p-1.5">
          <User size={22} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 animate-in fade-in zoom-in duration-200 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-xl z-50">
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            {user?.role?.toLowerCase() === "admin" && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 border-t border-[#e0e0e0] hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </>
  );
}
