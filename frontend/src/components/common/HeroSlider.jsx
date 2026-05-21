"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HeroSlider({
  images = [],
  autoSlide = true,
  interval = 5000,
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoSlide || images.length <= 1) return;
    const slider = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(slider);
  }, [images, autoSlide, interval]);

  const prevSlide = () =>
    setCurrent(current === 0 ? images.length - 1 : current - 1);
  const nextSlide = () => setCurrent((current + 1) % images.length);

  if (!images.length) return null;

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-slate-900 group">
      {/* Slides */}
      {images.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === current
              ? "opacity-100 scale-100 z-10"
              : "opacity-0 scale-105 z-0"
          }`}
        >
          <div className="relative w-full h-full">
            {/* FIXED: Changed object-fill to object-cover to prevent image stretching */}
            <img
              src={item.src}
              alt={item.title}
              className="w-full h-full object-cover object-center "
            />

            {/* Professional Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-center px-6 md:px-20 lg:px-32">
              <div
                className={`transition-all duration-1000 delay-300 transform ${
                  index === current
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                {/* Optional Soft Subtitle/Tagline */}
                <span className="text-white/90 text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
                  Premium Wellness Collection
                </span>

                {/* FIXED: Changed font-black & tracking-tighter to elegant font-serif & tracking-wide */}
                <h2 className="text-white text-4xl md:text-6xl lg:text-7xl font-serif font-normal mb-5 uppercase leading-tight tracking-wide max-w-3xl drop-shadow-sm">
                  {item.title}
                </h2> 

                {/* Description with better visibility */}
                <p className="text-white/80 text-sm md:text-base max-w-xl mb-8 leading-relaxed font-light tracking-wide">
                  {item.description}
                </p>

                {/* FIXED: Added rounded corners to match the Login button style */}
                <Link
                  href={typeof item.link === "string" ? item.link : "/"}
                  className="inline-block bg-white text-black px-8 py-3 md:px-10 md:py-3.5 text-xs md:text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-[#2A4150] hover:text-white shadow-md transition-all duration-300 transform active:scale-95"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <div className="absolute inset-0 z-20 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <button
            onClick={prevSlide}
            className="pointer-events-auto backdrop-blur-md bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all duration-300 border border-white/20"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="pointer-events-auto backdrop-blur-md bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all duration-300 border border-white/20"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      )}

      {/* Modern Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="group py-2"
            >
              <div
                className={`h-0.5 transition-all duration-500 ${
                  current === i
                    ? "w-10 bg-white"
                    : "w-5 bg-white/40 group-hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}