"use client";

import { useCategories } from "@/lib/queries/useCategories";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  const { data: categories = [], isLoading } = useCategories();

  const policiesLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about-us" },
    { name: "Talk to our experts", href: "/consultation" },
  ];

  const formatCategory = (name) =>
    name?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <footer className="bg-slate-800 text-gray-300 px-6 md:px-16 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* LEFT */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white text-slate-800 rounded-full w-10 h-10 flex items-center justify-center font-bold">
              A
            </div>
            <h2 className="text-white font-semibold text-lg">
              Herbs & Glam Pvt Ltd
            </h2>
          </div>

          <p className="text-sm mb-2">Healing with Science.</p>
          <p className="text-sm">
            To shop in USA, Canada, UAE and UK. Go to{" "}
            <span className="text-white font-medium">Azzunique.shop</span>
          </p>
        </div>

        {/* PRODUCTS */}
        <div>
          <h3 className="text-white font-semibold mb-4">Products</h3>

          <ul className="space-y-2 text-sm">
            {isLoading ? (
              <li className="text-gray-400">Loading...</li>
            ) : (
              categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.name
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="hover:text-white transition"
                  >
                    {formatCategory(cat.name)}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* POLICIES + SOCIAL */}
        <div>
          <h3 className="text-white font-semibold mb-4">Policies</h3>

          <ul className="space-y-2 text-sm mb-6">
            {policiesLinks.map((item, index) => (
              <li key={index}>
                <Link href={item.href} className="hover:text-white transition">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* SOCIAL ICONS */}
          <div className="flex gap-4">
            <a href="#" target="_blank" className="hover:text-white transition">
              <Facebook size={18} />
            </a>
            <a href="#" target="_blank" className="hover:text-white transition">
              <Instagram size={18} />
            </a>
            <a href="#" target="_blank" className="hover:text-white transition">
              <Twitter size={18} />
            </a>
            <a href="#" target="_blank" className="hover:text-white transition">
              <Youtube size={18} />
            </a>
            <a href="#" target="_blank" className="hover:text-white transition">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      {/* <div className="border-t border-slate-700 mt-10 pt-5 text-center text-sm text-gray-400">
        © 2026 Azzunique Pvt Ltd. All rights reserved.
      </div> */}
    </footer>
  );
}
