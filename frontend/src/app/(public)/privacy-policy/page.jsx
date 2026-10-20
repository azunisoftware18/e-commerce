import React from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  Clock3,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export default function ReturnRefundPolicy() {
  const policySections = [
    {
      title: "No Return Policy (General Rule)",
      icon: <ShieldCheck className="h-5 w-5" />,
      description:
        "Medicines, supplements, and healthcare products cannot be returned or exchanged once sold, as per health and safety regulations.",
    },
    {
      title: "Exceptions – When Returns Are Accepted",
      icon: <PackageCheck className="h-5 w-5" />,
      description: "Returns or replacements are accepted only in the following cases:",
      items: [
        "Product received is damaged",
        "Product received is defective",
        "Wrong product delivered",
        "Product is expired at the time of delivery",
      ],
    },
    {
      title: "Return Request Timeline",
      icon: <Clock3 className="h-5 w-5" />,
      description:
        "Customers must raise a return or replacement request within 48 hours of receiving the product. Requests raised after this period will not be accepted.",
    },
    {
      title: "Proof Required",
      icon: <Camera className="h-5 w-5" />,
      description: "To process a return or replacement, the customer must provide:",
      items: [
        "Clear photos or videos of the product",
        "Original invoice/bill",
        "Batch number and expiry date visible",
      ],
    },
    {
      title: "Refund Policy",
      icon: <Wallet className="h-5 w-5" />,
      items: [
        "If approved, refunds will be processed within 7–10 working days",
        "Refunds will be made via the original mode of payment",
        "Shipping charges (if any) are non-refundable, unless the error is from ALPHANUTRAPHARM",
      ],
    },
    {
      title: "Replacement Policy",
      icon: <BadgeCheck className="h-5 w-5" />,
      items: [
        "Approved cases may be eligible for replacement instead of refund",
        "Replacement is subject to product availability",
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
          <h1 className="text-4xl font-bold text-[#2A4150]">
            Return &amp; Refund Policy
          </h1>
        </div>
      </div>

      <main className="mx-auto w-full px-6 py-12">
        <div className="grid gap-8">
          <section className="rounded-2xl bg-[#2A4150] p-8 text-white shadow-xl shadow-[#2A4150]/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 shrink-0 text-[#e0e0e0]" />
              <div>
                <h2 className="mb-2 text-xl font-semibold">Policy Summary</h2>
                <p className="leading-relaxed text-white/80">
                  At ALPHANUTRAPHARM, customer safety and product quality are our
                  top priorities. Due to the nature of pharmaceutical and
                  nutraceutical products, our return policy is governed by strict
                  quality and safety standards.
                </p>
              </div>
            </div>
          </section>

          <section
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            aria-label="Return and refund policy details"
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

                {section.description && (
                  <p className="text-sm leading-relaxed text-[#2A4150]/70">
                    {section.description}
                  </p>
                )}

                {section.items && (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#2A4150]/70 marker:text-[#2A4150]">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>

          <section className="rounded-2xl border border-[#e0e0e0] bg-[#e0e0e0]/20 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-white p-2 text-[#2A4150]">
                <ReceiptText className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-[#2A4150]">
                7. Products Not Eligible for Return
              </h2>
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#2A4150]/70 marker:text-[#2A4150]">
              <li>Opened or used products</li>
              <li>Products damaged due to mishandling by the customer</li>
              <li>Products returned without original packaging and invoice</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
