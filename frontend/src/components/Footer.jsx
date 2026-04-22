"use client";

import React from "react";
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
} from "lucide-react";

// Hooks
import { useSettings } from "@/lib/queries/useSettings";

export default function Footer() {
  const { data: settings, isLoading: settingsLoading } = useSettings();

  const legalLinks = [
    { name: "Terms & Conditions", href: "/terms-conditions" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cancellation & Refund", href: "/cancellation-refund" },
  ];

  const getSocialIcon = (platform) => {
    const p = platform?.toLowerCase();
    if (p?.includes("facebook")) return <Facebook size={18} />;
    if (p?.includes("instagram")) return <Instagram size={18} />;
    if (p?.includes("twitter") || p?.includes("x"))
      return <Twitter size={18} />;
    if (p?.includes("linkedin")) return <Linkedin size={18} />;
    if (p?.includes("youtube")) return <Youtube size={18} />;
    return <Globe size={18} />; // Default icon
  };

  const policiesLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about-us" },
    { name: "Talk to our experts", href: "/consultation" },
  ];

  const formatCategory = (name) =>
    name?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <footer className="bg-slate-800 text-gray-300 px-6 md:px-16 py-12 border-t border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* 1. COMPANY IDENTITY (Logo & Info) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {settings?.logo ? (
              <img
                src={`http://api.herbsnglam.com/${settings?.logo}`}
                alt="Logo"
                className="w-20 h-10 object-cover "
              />
            ) : (
              <div className="bg-white text-slate-800 rounded-lg w-10 h-10 flex items-center justify-center font-bold">
                {settings?.companyName?.substring(0, 2).toUpperCase() || "H&G"}
              </div>
            )}
            <h2 className="text-white font-bold text-xl tracking-tight">
              {settings?.companyName || "Herbs & Glam"}
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            {settings?.address && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-slate-400 mt-1 shrink-0" />
                <span>{settings.address}</span>
              </div>
            )}
            {settings?.email && (
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-white transition"
                >
                  {settings.email}
                </a>
              </div>
            )}
            {settings?.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400 shrink-0" />
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

        {/* 2. PRODUCTS (Dynamic Categories) */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">
            Help & Support
          </h3>
          <ul className="space-y-3 text-sm">
            {legalLinks.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. QUICK LINKS */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {policiesLinks.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. SOCIAL PRESENCE */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">Follow Us</h3>
          <p className="text-sm mb-4 text-gray-400">
            Stay connected with us on social media for updates.
          </p>
          <div className="flex flex-wrap gap-3">
            {settings?.socialLinks?.length > 0 ? (
              settings.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={
                    link.url?.startsWith("http")
                      ? link.url
                      : `https://${link.url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-[#2A4150] hover:text-white transition-all transform hover:-translate-y-1 shadow-sm"
                  title={link.platform}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))
            ) : (
              <span className="text-xs text-gray-500">No links connected</span>
            )}
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-slate-700/50 mt-12 pt-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        {settings?.companyName || "Azzunique Pvt Ltd"}. All rights reserved.
      </div>
    </footer>
  );
}
