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

export default function Footer() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const [email, setEmail] = useState("");
  const { mutate: subscribeNewsletter, isPending } =
  useSubscribeNewsletter();
  const companyName = settings?.companyName || "Herbs n Glam";
const words = companyName.split(" ");

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
    <footer className="bg-slate-900 text-slate-300 px-6 md:px-16 pt-16 pb-8 border-t border-slate-800">
      {/* MAIN FOOTER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
        {/* 1. COMPANY IDENTITY (Logo & Info) */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex flex-row items-center gap-3">
            {/* {logoUrl ? (
              <img
                src={"logoUrl"}
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
            )} */}
            <h2 className="text-white font-extrabold text-xl tracking-tight leading-none self-center">
  <span style={{ color: "#35583D" }}>
    {words[0]}
  </span>{" "}
  <span style={{ color: "#B8925A" }}>
    {words.slice(1).join(" ")}
  </span>
</h2>
          </div>

          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
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
                  className="hover:text-white transition"
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
        <div className="space-y-6">
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
                className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full border border-slate-700"
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
            <span className="font-medium tracking-wide">
              100% SECURE CHECKOUT
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 border-l border-slate-700 pl-4">
            {/* UPI */}
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAABJlBMVEX////2fAE5jj05jT///f/9///6//////73///2egA4jj78//31fAX///v3dQD2eQAuijI6jEH6dwD3cgA2jzvxdQA1kDjydQD5//mz0rI9jDnxcgAihif/+v+Lt4v0fwDvgQD2lET79O/33cbzt4X1iyr49+j9//T10roshzfk9OfzqXLa6tv67tthoWX3yaLM4Mzwn1Nan1zugRi70731wJPokz4diiSMvI3z27l0q3rtkTj1zKv0p2dRkVL1//SavprG4Mby5tEgj0Dgfw7V6NTwzKD65NWuyLDvrW5HkEzqwpPz7uCawpfyvIb1rGxbpGisji5QiDe7gR7IgBqCtYFxiCzZgAiGhyetgx1hiTaThCvx0LuEiyR4iDHy5MPyu5+1hRxf2BSmAAAN7ElEQVR4nO2dbUPbOBLHZTuO41iOHMdJTOLWFAhpKM/QUigsj6WF0t1ry5YF9ujt9/8SZ+cJJ5Yt2YFIucvvdV74nxmNRmONB4ApU6ZMmTJlypQpU/4P0G2b9SM8M5qWZf0Iz4ytnbN+hGdGaZZPtP9pR7U/1V/l/rcVrhXq8xrrp3hOcq8gbNi6Qog3NpjYf2FuFsHCOcgo8T9b3x7P4zwD8yUXQbepEBQeXU6mDRUdLJSRIBQWsnrMz3QNbDqfgR33G05RsnLDhIIgwLm4cKpnbKdoHL6YQIVAXqwjX2HpIi7SyODYsFpfJzHYZJuvC4IPLJ80M5EmssF7Q7RaS5lxPtvToOfeoLZChDZy0ZmNom1aomi8HOejPRFas6F2bIjqu7nocLpkiKIoGctjfLQnwl4pCV3UD4fRgWR7x1OYN1YBaVPhjuxatadQKO9Hh9O9tg0rzvoYn+1pkDdQX2GhEanQvvSWoSdR3Jw4Gza3zL5CVPgStR0sO3mxjbMtj/cBR+ZTHfYVQqG6qOGX4ozTEShK+UnbEt9WC48K1cJFRO62V5G6Eo2ZMT/hSOhZ8M50hQDVK4xCXQGO1PVSUdyxweQ4aq7ZrEMUVFg+yIV/poB141Gh8R5MTkHAtndLJgwqhNX58M9k8LX1qFBsLY3/SdOi6QsDFvQUmu/sULDRwKolPmLsMXnYVCj2B3VQoerWX2uhaLnUCggUJWdycjd7pTwoUEAqaoQ3jG1jQGFlk8XDpkLbrwoh6uehrOXlgEJ/2wcTktlkDwphhdBtDv3M/q0yqNCamJLN4VZYoKBWfx/62fKQCSdo2z+pq2GFSCgvNgd2xc/OsEKreAj0STjvryEUVijA8h+5gWCzF7KhZBwBUgWZCzYQxobQNcsrA+sskLL1w6mzRKogsyerH5ZxCv2luKH1H1/OfAw5qb8SX8rcK9TArzpWn2fGwmPuJoOjkJO2JS5z76W6/LYkuFiF3rbfPz7IYM/CKuQ/d9Nzr/A+6lPa7b3c1w9bOIFe7rbOe33YXsQkNH22+q8ojvEKxcoleMH3UpRfxyksrPX89Ct2GfpGnOH8KCy/waRsfdDsoq63vXA4ZetjXXJ+Es42opehn7stZHVfwVKEk/rB5oi1hniuEIxR6G/77SL/tlOMUmhJh6xFxKCD/TIuZQv46YGseXnL8MlpwIgvOT5FKeCgGmdDj/qJ7LlpUZSiBPq52wt+dwyZoE8QzA0NZJbDSWmfvORt+7waUdFPSiSFsL4ryzMxTurhfOR1w2iCtbi9oqPQbGgRKVuf2r94taGtbcTHGQ8ES+da5CLsLkXnmLWUCHR7uMqGZes43kn9HYPTxCa7S1yGPua36P2+Q741A7g8RskLcUlpHwi/R0bSrgkrRZvLgk22QVyGbRu6P07zkTlNB05zt6uI+sUQCKp3xfho6knk8k3N6wKVQtdVrys1ksI/WasJYSvyRZVKoc9PwoYhijvLvNXdsnp2lrjf9x315pSk0FrlTaGeO6kLxLS0C1T/ig+nHtzdstHAPrUJPSOeVQjRVKxscnbab2YPqPaKNqpr3p8SJBZ3OLshbev4MileoSq4FdKGYdVYaxpE/kWVsj2KvCWGU2/b5yk9ld8mWIY+VULu5ltxjqfsVHtHvwx9Cu41ccdovWetKsgiTKYQCeYdKZ7mjWWFn5LNfIl2M+wqVIWb06i6cM9LjT2OivwLhWQKoarCB0I4zYvOR06qUhlZPjOTKfRQz/KSFR9RrVWZDzfV5KtSwnXoK1TvTy3CIcPgpGRjN/8uxNbzsbhwtkawoWj9xknuliRlC2DekhIb0fkMdB7ahrK4a0I0ZvxOkChVWlw0RslXVHXEMOgfwrYvScZX1urarKVyUv+e+51VJGRvXDRGZTdMshqsQnh9WiM4KheNUYcwwdFpQKEJfxYJmQ0XjVHzMKUNvU3xhrRhcNEY9Tt9lS2E+W9C/s1FY9SH5Nv9I1sVQqhh3hil2Yt1N2Us9UDuN+JBkXFjlN2crwsjKISzRZFkRbaNUUruoqCmX4dQUG/JrzGY3pDW7NhrQjQiySUbpo1RgZ7YlKjkkg3Txij5fFSFrnlHNCLLxij5YIStok1BuDaKhH2f5eVavZE6oekCkflAqruxbIw6SVhlCzNrwhtSOGXWGJUF8pdC+s2wj3lPse0zqbvpfoPFEyhEW6T33qwaoxR5uCc2Ha5wS94xmGz7meb8qHtFG9WcrRUJwYZNY5QNfn8CC/olcOEHMdgwaYzStJgGiwSY0KSou7FojNLmUlbZwiCK3I1BY1QW1xObDqg+EHM3Bo1R8ptRt/tHhSb5lg2D3K05csrWwXRVSHzbxqQx6hPpcj4lLjLdB6IJWTRGrREaLKgxZ3+eEm9njL0xSpf1A7oblwRUhGbvKCwothujxqhQU7TyU6Rsqmtukc/AXXbWx5jWKLlf5YSv77Eg8+x7hcJFfZzP4/RSW/tPwmtCGKC/TZBLUR0qY86+9Ry5wYJCoieQ0oBjP15oi0/gop7AWpF4OOywczzmmqI28skJQV8gjYtKkiQaY39Doy2Mugyhiq5rVC7qKRy/QGA3RvVSaP6w8lQuKuV3lsHYj79XdO0H0fJc80d0J2IAS7RqEouS8Hkp5cvtDgia/xDfyfQsWGRS8/5jhFe/bRveWnmqRWi1rKXx93rZmjxrprehi1zz9pRqo/diDJMufT27Uh9BobdNfDulizEV47dDFldqbHt/lJwUmvctyjVobLL5OL0ip0/ZIETqfYsqiuaLxiqjN4fa3Aguarr3NOddv+nC2GN16YuiNT1aofvXqUVqC+rgrMqsFOYWUq7Cds2J7kAvic6f7F7fy+9SVtlM6D6cUgWZfM14z/CayVzqQOr+zIuULvoSRH+0/nlRAHhdTyPRNVXKkkwxbzlsL8++SVWDQu7W9zyVQk/gEctmCwVsqaneWHgC6aJoWyC728F2dqWkJrahi4QzqgO96P0JjD+FqTX3q8kVIuGmRndcKlaMmQzT23qyfaAKyY9OZzVSG1DPhgbrFllbT9xgAavohtje3EaSLAYlmWGFnxKHGYSuK5e0LvqR+ccFZfLXhEIKr/NFOhsarY+A+Wc+c68SdhtC8wddGuO5aJ6D7gN/6Fgihar5j/fkNAqtirTEQwv3fNIq260kSlQ1C+OSg++29IaOURsQqeTr+F0LGpc8fFSwP3SMEl8g3TZYMTaZ1JxC9IaO0fKNrmroueiqzb4BCASGjtHgnUAoSzKSyKzmNEx/6BiVi7r3dGVR34JZVufdIfpDxyhQ3b/oLOjXnDixYJIGC4jcB1oLOjw0UnYJDh2Lx9x6OCU1wT4KfMHBRt+ButitegJreaps27cgs8JoiODQsRhcc5b85bmewK88ZGp9PtFV2dDZXZGuZpF3jgAnX/joEBw6FiPw5s7LZKjiqH8bT+EmkIaHjuH1ocZ3ukxNsjyB3KxAgBs6hsV8dWzQLUK/JJPlyUXDQ8dwFD40vxqkL7N0BR57LspTmAkPHQsDy+8OB4eOxQhc5yqKAtzQMYwFN5q5OdLHgjt4ArlyUYAbOoYRaNtgHTdIJmTBds2JdVltCOzQsQEXLR346yru0/k9fZa0zLxqGAY7dCxI6Y0/Eyg0dAznoZfLgMNP6GOHjgUFXuR0GTd0DCNwSQkPDWQPduhYB1X1XLQ7Xy08dGzYRX2BnEXRDvihYz2F9bfd4WrhoWPDFtw8VPhUiB061nfRL7nuFMCY+Q5dgTaQZf4UxgwdcwW1Wl/r/Cxi6FjQRXmdWBkzdMyfk7PfddGooWN9HGb3nEjEDB1Daul1rhsZo4aO9V10j88VCKKHjqnQhNXdx59FDB3ruqjD8XS1qKFj0DsPzgfMEjV0rOOiHBXVQkQNHTNRfT74Gc6ooWNdgdwc58Ngh45Bv7B9MvC76JRN2uHjI4FR4IeOuebWycAU1ZihY37NiWewQ8egebYiD7xviB465sxweJh4BDd0DAqq2bgK/ipm6Ni4e+sSgx065hY+LA50QsQMHeNdIHboGPIFDrioEjl0bOy9dUkJDx1DEJY3hgduA4AZOsamty4p4aFjEJY29HCzDiZlY9Nbl5Tw0DFPoC0Pb9+yhnFRNr11SRkeOoZg/Q0uO1kePjkx661LytDQMYQKFzbutXv45MSqty4pQ0PHYOFCs3Hbd6jYzaa3LgXBoWOqF2QW8KF/aUggq966FASHjkGh9DaHV3hsDGz3zHrrUhAcOgZLX+QsPsM8GkxKmfXWJSU4dMzb6Evn+HWla0AKXE1g2VuXlODQMVWtn+fwz62BJSfQ2suyty4pwaFjsHwuY6Ood7AAM44YCDUMe+uS0h865kJU3o0M/Xqw2M22ty4pgaFjnsDIyKHYj9fxGffWJaU/dAyVTzrz0bFkgu+cGPbWpaAzdAyq5uyv2Oykd3Ji31uXlM7QMU/gSS7WLL2TE+veuuR0ho6ZWytZPW5t2b2biIx761KwCBE0UWOFEBvXHX8zZN9bl4L5EoSFxiJpEHHn5MS+ty4FCwVY+LCoZQgp2GZ7GbLvrUtKJiOfqaWNJkGeotiOJOV56K1Lij90zBMYvQ12UPyTk8RFb11S7ObfvgU1wvatgD9b3nmXh966pNjZgwOKmy+6fJnnpLcuKbp+oVGk0MqSwUtvXVKyTVtRKDLMbYOL3rpnZM/horfu+TgsXk5KzSkl65d89NY9H9sTUnNKT2YSo2gidG5vOk2ZMmXKlClTpkyZwoj/Arm4VgG34lQnAAAAAElFTkSuQmCC"
              alt="UPI"
              className="h-4 w-auto object-contain"
            />

            <img
              src="https://cdn-icons-png.flaticon.com/512/6963/6963703.png"
              alt="cod"
              className="h-5 w-auto object-contain"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/512/10351/10351751.png"
              alt="cod"
              className="h-5 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
