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

export default function Footer() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const [email, setEmail] = useState("");

  const legalLinks = [
    { name: "Terms & Conditions", href: "/terms-conditions" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cancellation & Refund", href: "/cancellation-refund" },
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
        hoverClass: "hover:bg-[#25D366] hover:border-[#25D366] hover:text-white"
      };
    }
    if (p.includes("facebook")) {
      return {
        icon: <Facebook size={18} />,
        hoverClass: "hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white"
      };
    }
    if (p.includes("instagram")) {
      return {
        icon: <Instagram size={18} />,
        hoverClass: "hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white"
      };
    }
    if (p.includes("twitter") || p.includes("x")) {
      return {
        icon: <Twitter size={18} />,
        hoverClass: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white"
      };
    }
    if (p.includes("linkedin")) {
      return {
        icon: <Linkedin size={18} />,
        hoverClass: "hover:bg-[#0077B5] hover:border-[#0077B5] hover:text-white"
      };
    }
    if (p.includes("youtube")) {
      return {
        icon: <Youtube size={18} />,
        hoverClass: "hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white"
      };
    }
    
    // Default Fallback
    return {
      icon: <Globe size={18} />,
      hoverClass: "hover:bg-emerald-600 hover:border-emerald-600 hover:text-white"
    };
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Subscribed with: ${email}`);
    setEmail("");
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
    <footer className="bg-slate-900 text-slate-300 px-6 md:px-16 pt-16 pb-8 border-t border-slate-800">
      {/* MAIN FOOTER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
        
        {/* 1. COMPANY IDENTITY (Logo & Info) */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex flex-row items-center gap-3">
            {logoUrl ? (
  <img
    src={logoUrl}
    alt="Logo"
    className="h-14 w-auto object-contain"
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />
) : (
              <div className="bg-emerald-600 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold shadow-md shrink-0">
                {settings?.companyName?.substring(0, 2).toUpperCase() || "H&G"}
              </div>
            )}
            <h2 className="text-white font-extrabold text-xl tracking-tight leading-none self-center">
              {settings?.companyName || "Herbs & Glam"}
            </h2>
          </div>

          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Experience the purity of nature combined with premium wellness solutions tailored just for you.
          </p>

          <div className="space-y-3 text-sm text-slate-400">
            {settings?.address && (
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{settings.address}</span>
              </div>
            )}
            {settings?.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-emerald-500 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition">
                  {settings.email}
                </a>
              </div>
            )}
            {settings?.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-emerald-500 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition">
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
                <Link href={item.href} className="text-slate-400 hover:text-white transition-colors">
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
                <Link href={item.href} className="text-slate-400 hover:text-white transition-colors">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. NEWSLETTER & SOCIALS */}
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-bold tracking-wider uppercase text-xs mb-4">
              Stay Updated
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full border border-slate-700"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-md transition-colors flex items-center justify-center shrink-0"
                title="Subscribe"
              >
                <Send size={14} />
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
                      href={link.url?.startsWith("http") ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      // Yahan dynamically custom `config.hoverClass` pass ho rhi hai
                      className={`w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center transition-all transform hover:-translate-y-0.5 border border-slate-700 ${config.hoverClass}`}
                      title={link.platform}
                    >
                      {config.icon}
                    </a>
                  );
                })
              ) : (
                <span className="text-xs text-slate-500">No links connected</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()}{" "}
          <span className="text-slate-400 font-medium">
            {settings?.companyName || "Azzunique Pvt Ltd"}
          </span>
          . All rights reserved.
        </div>

        <div className="flex items-center gap-4 text-slate-400 bg-slate-800/40 px-4 py-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="font-medium tracking-wide">100% SECURE CHECKOUT</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-700 pl-4 text-[10px] text-slate-500 font-semibold tracking-widest">
            <span>UPI</span>
            <span>CARDS</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}