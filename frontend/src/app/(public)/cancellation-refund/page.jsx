'use client';

import React from 'react';
import { 
  RefreshCw, 
  XCircle, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Bell, 
  Undo2 
} from 'lucide-react';

export default function CancellationRefund() {
  const policies = [
    {
      title: "Order Cancellation",
      icon: <XCircle className="w-5 h-5" />,
      content: "You can cancel your order within 24 hours of purchase or before it has been dispatched. Once the order is in the 'Shipped' status, cancellation is no longer possible."
    },
    {
      title: "Refund Eligibility",
      icon: <CheckCircle2 className="w-5 h-5" />,
      content: "Refunds are applicable for products returned in original condition, with tags intact. Perishable goods, innerwear, and customized items are generally excluded from refunds."
    },
    {
      title: "Refund Timeline",
      icon: <Clock className="w-5 h-5" />,
      content: "Once we receive and inspect your return, the refund is processed within 5-7 business days. The credit will automatically be applied to your original method of payment."
    },
    {
      title: "Partial Refunds",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: "In certain situations, only partial refunds are granted (e.g., items with missing parts, or items returned more than 30 days after delivery)."
    },
    {
      title: "Payment Reversals",
      icon: <CreditCard className="w-5 h-5" />,
      content: "For failed transactions where the amount was debited but the order wasn't placed, the amount is typically reversed by your bank within 3-5 working days."
    },
    {
      title: "Late or Missing Refunds",
      icon: <RefreshCw className="w-5 h-5" />,
      content: "If you haven’t received a refund yet, first check your bank account again, then contact your credit card company. It may take some time before your refund is officially posted."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="w-full bg-[#e0e0e0]/30 py-16 border-b border-[#e0e0e0]">
        <div className="w-full mx-auto px-6">
          
          <h1 className="text-4xl font-bold text-[#2A4150] mb-2">Cancellation & Refund</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-6 py-12">
        <div className="grid gap-8">
          
          {/* Summary Box */}
          <div className="bg-[#2A4150] rounded-2xl p-8 text-white shadow-xl shadow-[#2A4150]/10">
            <div className="flex items-start gap-4">
              <Bell className="w-6 h-6 text-[#e0e0e0] shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Our Commitment</h2>
                <p className="text-white/80 leading-relaxed">
                  We want you to be completely satisfied with your purchase. If a product doesn't meet your expectations or you've changed your mind, our streamlined refund process is designed to be fair and transparent.
                </p>
              </div>
            </div>
          </div>

          {/* Policy Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((item, index) => (
              <div 
                key={index} 
                className="p-6 rounded-2xl border border-[#e0e0e0] bg-white hover:border-[#2A4150]/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#e0e0e0]/50 rounded-lg text-[#2A4150] group-hover:bg-[#2A4150] group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-[#2A4150]">{item.title}</h3>
                </div>
                <p className="text-[#2A4150]/70 text-sm leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Contact Section */}
          {/* <div className="mt-8 border-t border-[#e0e0e0] pt-12">
            <div className="bg-[#e0e0e0]/20 rounded-xl p-8 border border-[#e0e0e0] flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-[#2A4150] mb-1 text-lg">Need to initiate a return?</h4>
                <p className="text-[#2A4150]/70 text-sm">
                  Please have your Order ID and Registered Email ready.
                </p>
              </div>
              <a 
                href="mailto:support@yourbusiness.com" 
                className="px-6 py-3 bg-[#2A4150] text-white rounded-xl font-semibold hover:bg-[#1a2a35] transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div> */}
          
        </div>
      </div>
    </div>
  );
}