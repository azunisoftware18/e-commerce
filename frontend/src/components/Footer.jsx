"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Globe,
  Send,
  ShieldCheck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
// Hooks
import { useSettings } from "@/lib/queries/useSettings";
import { useSubscribeNewsletter } from "@/lib/mutations/useNewsletter";
import toast from "react-hot-toast";
import PaymentMethods from "./common/PaymentMethods";

export default function Footer() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const [email, setEmail] = useState("");
  const { mutate: subscribeNewsletter, isPending } =
  useSubscribeNewsletter();
  const companyName = settings?.companyName || "Herbs n Glam";
const words = companyName.split(" ");

  const legalLinks = [
    { name: "Terms & Conditions", href: "/terms-conditions" },
    { name: "Return & Refund Policy", href: "/privacy-policy" },
    { name: "Shipping Policy", href: "/shipping-policy" },
  ];

  const policiesLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about-us" },
    { name: "Talk to our experts", href: "/consultation" },
  ];

  // 1. Brand Specific Icon & Hover Colors Configuration Function
  const getSocialConfig = (platform) => {
    const p = platform?.toLowerCase() || "";

    if (p.includes("whatsapp")) {
      return {
        icon: <FaWhatsapp size={18} />,
        hoverClass:
          "hover:bg-[#25D366] hover:border-[#25D366] hover:text-white",
      };
    }
    if (p.includes("facebook")) {
      return {
        icon: <Facebook size={18} />,
        hoverClass:
          "hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white",
      };
    }
    if (p.includes("instagram")) {
      return {
        icon: <Instagram size={18} />,
        hoverClass:
          "hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white",
      };
    }
    if (p.includes("twitter") || p.includes("x")) {
      return {
        icon: <Twitter size={18} />,
        hoverClass:
          "hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white",
      };
    }
    if (p.includes("linkedin")) {
      return {
        icon: <Linkedin size={18} />,
        hoverClass:
          "hover:bg-[#0077B5] hover:border-[#0077B5] hover:text-white",
      };
    }
    if (p.includes("youtube")) {
      return {
        icon: <Youtube size={18} />,
        hoverClass:
          "hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white",
      };
    }

    // Default Fallback
    return {
      icon: <Globe size={18} />,
      hoverClass:
        "hover:bg-emerald-600 hover:border-emerald-600 hover:text-white",
    };
  };

  const handleSubscribe = (e) => {
  e.preventDefault();

  subscribeNewsletter(
    { email },
    {
      onSuccess: (res) => {
  toast.success(res?.data?.message);
  setEmail("");
},

      onError: (error) => {
  toast.error(
    error?.response?.data?.message ||
      "Something went wrong."
  );
},
    },
  );
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

  return (
    <footer className="border-t border-slate-800 bg-slate-900 px-4 pb-6 pt-10 text-slate-300 sm:px-6 sm:pb-8 sm:pt-12 md:px-10 md:pt-16 lg:px-16">
      {/* MAIN FOOTER GRID */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-b border-slate-800 pb-10 sm:gap-x-8 sm:gap-y-10 sm:pb-12 lg:grid-cols-5">
        {/* 1. COMPANY IDENTITY (Logo & Info) */}
        <div className="col-span-2 space-y-5 lg:col-span-2">
          <Link href="/" className="inline-flex items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-14 w-auto max-w-full object-contain sm:h-16 md:h-[72px]"
              />
            ) : (
              <h2 className="text-white font-extrabold text-xl tracking-tight leading-none">
                <span style={{ color: "#35583D" }}>{words[0]}</span>{" "}
                <span style={{ color: "#B8925A" }}>
                  {words.slice(1).join(" ")}
                </span>
              </h2>
            )}
          </Link>

          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Experience the purity of nature combined with premium wellness
            solutions tailored just for you.
          </p>

          <div className="space-y-3 text-sm text-slate-400">
            {settings?.address && (
              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="text-emerald-500 mt-0.5 shrink-0"
                />
                <span>{settings.address}</span>
              </div>
            )}
            {settings?.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-emerald-500 shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all transition hover:text-white"
                >
                  {settings.email}
                </a>
              </div>
            )}
            {settings?.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-500 shrink-0" />
                <a
                  href={`tel:${settings.phone}`}
                  className="hover:text-white transition"
                >
                  {settings.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 2. HELP & SUPPORT */}
        <div>
          <h3 className="text-white font-bold tracking-wider uppercase text-xs mb-5">
            Help & Support
          </h3>
          <ul className="space-y-3 text-sm">
            {legalLinks.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-slate-400 hover:text-slate-300 transition-all hover:text-[15px]"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. QUICK LINKS */}
        <div>
          <h3 className="text-white font-bold tracking-wider uppercase text-xs mb-5">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            {policiesLinks.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-slate-400 hover:text-slate-300 transition-all hover:text-[15px]"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. NEWSLETTER & SOCIALS */}
        <div className="col-span-2 space-y-6 lg:col-span-1">
          <div>
            <h3 className="text-white font-bold tracking-wider uppercase text-xs mb-4">
              Stay Updated
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Follow to get special offers, free giveaways, and updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
  type="submit"
  disabled={isPending}
  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-md transition-colors flex items-center justify-center shrink-0"
  title="Subscribe"
>
  {isPending ? (
    <span className="text-xs px-2">...</span>
  ) : (
    <Send size={14} />
  )}
</button>
            </form>
          </div>

          <div>
            <h3 className="text-white font-bold tracking-wider uppercase text-xs mb-3">
              Follow Us
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {settings?.socialLinks?.length > 0 ? (
                settings.socialLinks.map((link, index) => {
                  // Har platform ke liye configuration nikalna
                  const config = getSocialConfig(link.platform);

                  return (
                    <a
  key={index}
  href={
    link.platform?.toLowerCase().includes("whatsapp")
      ? `https://wa.me/${link.url.replace(/\D/g, "")}`
      : link.url?.startsWith("http")
      ? link.url
      : `https://${link.url}`
  }
  target="_blank"
  rel="noopener noreferrer"
  className={`w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center transition-all transform hover:-translate-y-0.5 border border-slate-700 ${config.hoverClass}`}
  title={link.platform}
>
  {config.icon}
</a>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500">
                  No links connected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 text-center text-xs text-slate-500 sm:mt-8 md:flex-row md:text-left">
        <div>
          © {new Date().getFullYear()}{" "}
          <span className="text-slate-400 font-medium">
            {settings?.companyName || "Azzunique Pvt Ltd"}
          </span>
          . All rights reserved.
        </div>

        <div>
          <PaymentMethods />
        </div>
      </div>
    </footer>
  );
}
