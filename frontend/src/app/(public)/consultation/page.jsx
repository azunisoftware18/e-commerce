'use client';

import ConsultationForm from "@/components/forms/ConsultationForm";
import { useCreateConsultation } from "@/lib/mutations/useConsultation";
import toast from "react-hot-toast";

export default function Consultation() {
  const { mutate, isPending } = useCreateConsultation();

  const handleSubmit = (data) => {
    mutate(data, {
      onSuccess: (res) => {
        toast.success("Consultation request submitted");
      },
      onError: (err) => {
        console.log("ERROR:", err);
        toast.error(err?.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#2A4150]">
      
      {/* LEFT SECTION: Form Content Area */}
      {/* Mobile/Tablet par w-full (full width) rahega aur desktop par automatic split standard side layout (md:w-1/2) le lega */}
      <section className="w-full md:w-1/2 flex items-center justify-center py-12 px-4 sm:px-8 md:p-12 lg:p-20 text-white shadow-2xl z-10">
        <div className="w-full max-w-lg mx-auto">
          
          <header className="mb-8 md:mb-10 text-center md:text-left">
            <span className="text-slate-300 uppercase tracking-widest text-xs font-bold bg-white/10 px-3 py-1 rounded-full inline-block md:bg-transparent md:p-0 md:rounded-none">
              Get Started
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 tracking-tight">
              Book a <span className="text-slate-300">Consultation</span>
            </h1>
            <div className="h-1 w-16 bg-slate-300 mx-auto md:mx-0 mb-6 rounded-full"></div>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-md mx-auto md:mx-0">
              Take the first step toward your health goals. Please fill out the form below.
            </p>
          </header>

          {/* Form wrapper layout glassmorphism details */}
          <div className="bg-white/5 p-1 rounded-3xl sm:rounded-4xl backdrop-blur-sm text-[#2A4150]">
            <ConsultationForm
              title="" 
              onSubmitForm={handleSubmit}   
              isSubmitting={isPending}    
              showSubmitButton={true}
            />
          </div>
        </div>
      </section>

      {/* RIGHT SECTION: Visual Image Section */}
      {/* ⚡ 'hidden md:block' se mobile aur tablet par image clean tareeqe se hide ho jayegi */}
      <section className="hidden md:block relative md:w-1/2 h-screen sticky top-0 overflow-hidden">
        <img 
          src="https://i.pinimg.com/1200x/1c/e6/48/1ce6488e1797d67b3904e71ddbd682f6.jpg" 
          alt="Professional Consultation" 
          className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700 ease-in-out"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-[#2A4150]/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A4150] via-[#2A4150]/20 to-transparent opacity-100"></div>

        {/* Elegant Overlap Quote: Only on desktops */}
        <div className="hidden lg:block absolute bottom-12 right-12 bg-white/10 backdrop-blur-md p-6 border border-white/10 rounded-2xl max-w-xs">
          <p className="text-white text-sm italic font-medium leading-relaxed">
            "Your health is an investment, not an expense."
          </p>
        </div>
      </section>

    </main>
  );
}