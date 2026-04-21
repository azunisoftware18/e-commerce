import React from 'react';
import { Eye, Lock, FileText, Database, Bell, UserCheck, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const policies = [
    {
      title: "Information We Collect",
      icon: <Database className="w-5 h-5" />,
      description: "We collect information you provide directly to us, including name, email address, shipping address, and phone number when you make a purchase or create an account."
    },
    {
      title: "How We Use Data",
      icon: <Eye className="w-5 h-5" />,
      description: "Your data helps us process transactions, send order updates, improve our website functionality, and provide personalized shopping experiences."
    },
    {
      title: "Data Protection",
      icon: <Lock className="w-5 h-5" />,
      description: "We implement industry-standard SSL encryption and secure socket layer technology to protect your sensitive payment information during transmission."
    },
    {
      title: "Cookies Policy",
      icon: <FileText className="w-5 h-5" />,
      description: "We use cookies to remember items in your shopping cart and understand your preferences based on previous or current site activity."
    },
    {
      title: "Third-Party Sharing",
      icon: <Shield className="w-5 h-5" />,
      description: "We do not sell or trade your personal data. We only share information with trusted partners who assist us in operating our website and conducting our business."
    },
    {
      title: "Your Rights",
      icon: <UserCheck className="w-5 h-5" />,
      description: "You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting our support team."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="w-full bg-[#e0e0e0]/30 py-16 border-b border-[#e0e0e0]">
        <div className="w-full  mx-auto px-6">
          
          <h1 className="text-4xl font-bold text-[#2A4150] mb-2">Privacy Policy</h1>
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
                <h2 className="text-xl font-semibold mb-2">Policy Summary</h2>
                <p className="text-white/80 leading-relaxed">
                  Your privacy is critically important to us. We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
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
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Text Section */}
          <div className="mt-8 prose prose-slate max-w-none border-t border-[#e0e0e0] pt-12">
            <h2 className="text-2xl font-bold text-[#2A4150] mb-6">Detailed Data Handling</h2>
            <p className="text-[#2A4150]/70 mb-4">
              We retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
            </p>
            <p className="text-[#2A4150]/70 mb-8">
              Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
            </p>
            
            <div className="bg-[#e0e0e0]/20 rounded-xl p-6 border border-[#e0e0e0]">
              <h4 className="font-bold text-[#2A4150] mb-2">Questions?</h4>
              <p className="text-[#2A4150]/70 text-sm">
                If you have any questions about how we handle user data and personal information, feel free to contact us at 
                <span className="text-[#2A4150] font-semibold ml-1">privacy@yourstore.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}