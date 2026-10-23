
const paymentMethods = [
  { name: "VISA", className: "text-xl font-black italic tracking-wide" },
  { name: "G Pay", className: "text-sm font-bold" },
  { name: "BHIM UPI", className: "text-sm font-extrabold italic" },
  { name: "Net Banking", className: "text-sm font-medium" },
  { name: "Wallet", className: "text-sm font-medium" },
  { name: "Cash on Delivery", className: "text-sm font-medium" },
];

export default function PaymentMethods() {
  return (
    <section
      aria-label="Accepted payment methods"
      className="w-full  text-white"
    >
      <div className="mx-auto flex min-h-[52px] max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-3 px-4 py-3 sm:justify-start sm:px-8">
        <span className="whitespace-nowrap text-sm font-semibold text-white/90">
          We accept
        </span>

        {paymentMethods.map((method) => (
          <span
            key={method.name}
            className={`whitespace-nowrap ${method.className}`}
          >
            {method.name}
          </span>
        ))}

        {/* Mastercard symbol */}
        <span
          aria-label="Mastercard"
          title="Mastercard"
          className="inline-flex items-center"
        >
          <span className="relative -mr-2.5 h-5 w-5 rounded-full bg-red-500" />
          <span className="h-5 w-5 rounded-full bg-orange-400/90 mix-blend-screen" />
        </span>
      </div>
    </section>
  );
}
