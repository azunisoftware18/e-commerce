"use client";

import React from "react";
import { 
  HeartPulse, 
  Users, 
  Award, 
  Target, 
  Stethoscope, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import Button from "@/components/ui/Button";

const stats = [
  { label: "Patients Healed", value: "10k+", icon: HeartPulse },
  { label: "Expert Doctors", value: "50+", icon: Stethoscope },
  { label: "Years Experience", value: "12+", icon: Award },
  { label: "Success Rate", value: "98%", icon: ShieldCheck },
];

const values = [
  {
    title: "Patient First",
    desc: "Every treatment plan is tailored to the unique needs and comfort of our patients.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Expert Care",
    desc: "Our team consists of board-certified specialists with decades of combined experience.",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "Innovation",
    desc: "We leverage the latest medical technology and research to provide advanced solutions.",
    color: "bg-purple-50 text-purple-600"
  }
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-[#2A4150] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest">About Our Mission</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[#2A4150] leading-[1.1] tracking-tight mb-8">
              We are dedicated to <span className="text-blue-600">your well-being.</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl">
              Since 2014, we've been at the forefront of medical excellence, 
              combining compassionate care with cutting-edge technology to help 
              you live your healthiest life.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button text="Meet Our Doctors" className="px-8 py-4 bg-[#2A4150] rounded-2xl" />
              <button className="flex items-center gap-2 font-bold text-[#2A4150] hover:gap-4 transition-all duration-300 ml-4">
                Our Services <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#2A4150]/5 -skew-x-12 translate-x-20 hidden lg:block" />
      </section>

      {/* --- Stats Grid --- */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:-translate-y-2 transition-transform">
              <div className="p-3 w-fit rounded-2xl bg-slate-50 text-[#2A4150] mb-4 group-hover:bg-[#2A4150] group-hover:text-white transition-colors">
                <stat.icon size={24} />
              </div>
              <h3 className="text-3xl font-black text-[#2A4150]">{stat.value}</h3>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Our Story Section --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden relative">
             {/* Placeholder for a high-quality team image */}
             <div className="absolute inset-0 bg-linear-to-tr from-[#2A4150]/20 to-transparent" />
             <div className="flex items-center justify-center h-full text-slate-300">
                <Users size={80} strokeWidth={1} />
             </div>
          </div>
          {/* Floating Card */}
          <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 max-w-60">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ShieldCheck size={20}/></div>
                <span className="font-bold text-[#2A4150]">Certified Care</span>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">Recognized by national health boards for excellence in patient safety.</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-black text-[#2A4150] tracking-tight">Redefining the standard of care.</h2>
          <p className="text-slate-500 leading-relaxed">
            Our journey began with a simple belief: that everyone deserves access to 
            high-quality, empathetic medical attention. We don't just treat symptoms; 
            we treat people. 
          </p>
          <div className="grid gap-4 pt-4">
            {values.map((v, i) => (
              <div key={i} className="flex gap-4 items-start p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className={`p-3 rounded-xl shrink-0 ${v.color}`}>
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#2A4150] mb-1">{v.title}</h4>
                  <p className="text-sm text-slate-500 leading-snug">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer CTA --- */}
      <section className="mx-6 mb-12">
        <div className="max-w-7xl mx-auto bg-[#2A4150] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to start your health journey?</h2>
            <p className="text-blue-100/60 mb-10 max-w-lg mx-auto">
              Book a consultation with our experts today and experience the difference of personalized care.
            </p>
            <Button text="Book Appointment" className="bg-white text-[#2A4150]! px-10 py-4 rounded-2xl font-bold text-lg" />
          </div>
          {/* Background circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mb-32 blur-3xl" />
        </div>
      </section>
    </div>
  );
}