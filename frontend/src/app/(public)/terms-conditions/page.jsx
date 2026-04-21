'use client';

import React from 'react';
import { ShieldCheck, Scale, Truck, CreditCard, RefreshCw, AlertCircle, Bell, FileText } from 'lucide-react';

export default function TermsAndConditions() {
  const sections = [
    {
      title: "1. Introduction",
      icon: <Scale className="w-5 h-5" />,
      content: "Welcome to our eCommerce platform. By accessing or using our website, you agree to be bound by these terms. If you disagree with any part of the terms, then you may not access the service."
    },
    {
      title: "2. Intellectual Property",
      icon: <ShieldCheck className="w-5 h-5" />,
      content: "The Service and its original content, features, and functionality are and will remain the exclusive property of the company. Our logo, designs, and graphics are protected by copyright and trademark laws."
    },
    {
      title: "3. User Accounts",
      icon: <AlertCircle className="w-5 h-5" />,
      content: "When you create an account, you must provide information that is accurate and complete. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account."
    },
    {
      title: "4. Payments & Billing",
      icon: <CreditCard className="w-5 h-5" />,
      content: "We use secure third-party payment processors. By submitting your payment information, you grant us the right to provide the information to these third parties subject to our Privacy Policy."
    },
    {
      title: "5. Shipping & Delivery",
      icon: <Truck className="w-5 h-5" />,
      content: "Delivery times are estimates and not guaranteed. We are not responsible for delays caused by the carrier or customs departments for international orders."
    },
    {
      title: "6. Returns & Refunds",
      icon: <RefreshCw className="w-5 h-5" />,
      content: "Items can be returned within 30 days of purchase. Products must be in original packaging and unused condition. Digital downloads and personalized items are non-refundable."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header (Matching Privacy Policy) */}
      <div className="w-full bg-[#e0e0e0]/30 py-16 border-b border-[#e0e0e0]">
        <div className="w-full mx-auto px-6">
          
          <h1 className="text-4xl font-bold text-[#2A4150] mb-2">Terms & Conditions</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-6 py-12">
        <div className="grid gap-8">
          
          {/* Summary Box (Matching Privacy Policy) */}
          <div className="bg-[#2A4150] rounded-2xl p-8 text-white shadow-xl shadow-[#2A4150]/10">
            <div className="flex items-start gap-4">
              <Bell className="w-6 h-6 text-[#e0e0e0] shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Notice to Users</h2>
                <p className="text-white/80 leading-relaxed italic">
                  Please read these terms and conditions carefully before using our service. These terms 
                  outline the rules and regulations for the use of our website.
                </p>
              </div>
            </div>
          </div>

          {/* Policy Grid (Matching Privacy Policy) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((item, index) => (
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

          {/* Detailed Contact Section (Matching Privacy Policy) */}
          <div className="mt-8 border-t border-[#e0e0e0] pt-12">
            <div className="bg-[#e0e0e0]/20 rounded-xl p-6 border border-[#e0e0e0]">
              <h4 className="font-bold text-[#2A4150] mb-2 text-lg">Contact Us</h4>
              <p className="text-[#2A4150]/70 text-sm">
                If you have any questions about these Terms, please contact our legal department at:
                <br />
                <span className="text-[#2A4150] font-semibold mt-2 block italic">support@yourbusiness.com</span>
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}