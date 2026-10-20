import React from "react";
import {
  AlertTriangle,
  Bell,
  Clock3,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

export default function ShippingPolicy() {
  const policySections = [
    {
      title: "Shipping Locations",
      icon: <MapPin className="h-5 w-5" />,
      items: [
        "We currently ship products across India",
        "International shipping (if applicable) will be mentioned separately",
      ],
    },
    {
      title: "Order Processing Time",
      icon: <Clock3 className="h-5 w-5" />,
      items: [
        "Orders are processed within 1–2 working days after payment confirmation",
        "Orders placed on Sundays or public holidays will be processed on the next working day",
      ],
    },
    {
      title: "Delivery Time",
      icon: <Truck className="h-5 w-5" />,
      items: [
        "Metro Cities: 2–4 working days",
        "Non-Metro / Rural Areas: 4–7 working days",
      ],
      note: "Delivery time may vary due to courier partner delays, weather conditions, government regulations, or unforeseen circumstances.",
    },
    {
      title: "Shipping Charges",
      icon: <Wallet className="h-5 w-5" />,
      items: [
        "Shipping charges (if applicable) will be clearly displayed at checkout",
        "Free shipping may be offered on selected products or minimum order values (as announced)",
      ],
    },
    {
      title: "Courier Partners",
      icon: <PackageCheck className="h-5 w-5" />,
      items: [
        "Orders are shipped through reputed and reliable courier partners",
        "Tracking details will be shared via SMS / Email / WhatsApp once the order is dispatched",
      ],
    },
    {
      title: "Packaging & Safety",
      icon: <ShieldCheck className="h-5 w-5" />,
      items: [
        "All products are securely packed to maintain quality, hygiene, and safety",
        "Temperature-sensitive products (if any) are packed as per standard guidelines",
      ],
    },
    {
      title: "Delivery Issues",
      icon: <AlertTriangle className="h-5 w-5" />,
      items: [
        "If the package is tampered, damaged, or opened, customers are advised not to accept delivery",
        "In case of non-delivery or delay, please contact us within 48 hours",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full border-b border-[#e0e0e0] bg-[#e0e0e0]/30 py-16">
        <div className="mx-auto w-full px-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#2A4150]/60">
            ALPHANUTRAPHARM
          </p>
          <h1 className="text-4xl font-bold text-[#2A4150]">Shipping Policy</h1>
        </div>
      </div>

      <main className="mx-auto w-full px-6 py-12">
        <div className="grid gap-8">
          <section className="rounded-2xl bg-[#2A4150] p-8 text-white shadow-xl shadow-[#2A4150]/10">
            <div className="flex items-start gap-4">
              <Bell className="h-6 w-6 shrink-0 text-[#e0e0e0]" />
              <div>
                <h2 className="mb-2 text-xl font-semibold">Our Commitment</h2>
                <p className="leading-relaxed text-white/80">
                  At ALPHANUTRAPHARM, we are committed to delivering quality
                  pharmaceutical and nutraceutical products safely and on time.
                </p>
              </div>
            </div>
          </section>

          <section
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            aria-label="Shipping policy details"
          >
            {policySections.map((section, index) => (
              <article
                key={section.title}
                className="group rounded-2xl border border-[#e0e0e0] bg-white p-6 transition-all hover:border-[#2A4150]/30"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-[#e0e0e0]/50 p-2 text-[#2A4150] transition-colors group-hover:bg-[#2A4150] group-hover:text-white">
                    {section.icon}
                  </div>
                  <h2 className="font-bold text-[#2A4150]">
                    {index + 1}. {section.title}
                  </h2>
                </div>
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#2A4150]/70 marker:text-[#2A4150]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {section.note && (
                  <p className="mt-3 text-sm leading-relaxed text-[#2A4150]/70">
                    {section.note}
                  </p>
                )}
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
