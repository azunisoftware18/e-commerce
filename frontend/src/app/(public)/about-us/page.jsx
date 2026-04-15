import React from 'react';
import { Heart, Activity, ShieldCheck, Quote } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="bg-white min-h-screen font-sans text-[#2A4150]">
      {/* --- Header Section --- */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        {/* Decorative Greenery Background (Abstract simulation of the image header) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 opacity-20 pointer-events-none">
           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="#4ADE80" d="M44.7,-76.4C58.1,-69.2,69.5,-57.4,77.3,-43.7C85.1,-30,89.3,-15,88.2,-0.6C87.1,13.7,80.7,27.5,72.4,40.3C64.1,53.1,53.9,65,41.2,72.2C28.5,79.4,13.2,82,-1.3,84.2C-15.8,86.4,-31.6,88.2,-45.5,82.5C-59.4,76.8,-71.4,63.6,-78.6,48.9C-85.8,34.2,-88.2,18.1,-87.3,2.5C-86.3,-13.1,-82,-28.1,-73.8,-41.2C-65.6,-54.3,-53.4,-65.4,-39.9,-72.5C-26.4,-79.6,-11.7,-82.7,2.1,-86.3C15.8,-89.9,31.3,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Health, Balance & Happiness for All
          </h1>
          <p className="text-lg md:text-xl italic text-gray-600 max-w-2xl mx-auto border-l-4 border-[#2A4150] pl-6 py-2">
            "Our mission is to promote optimal health and vitality through practitioner 
            formulated botanical and nutritional supplements of the highest quality."
          </p>
        </div>
      </section>

      {/* --- Main Journey Card --- */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto bg-[#e0e0e0] rounded-[3rem] p-8 md:p-16 shadow-inner">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-8">Our founder’s journey</h2>
            <div className="relative inline-block">
              <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden shadow-lg mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" 
                  alt="Founder" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative wave line simulation */}
              <div className="absolute top-1/2 -left-20 -right-20 h-px bg-white/50 -z-10 hidden md:block"></div>
            </div>
          </div>

          {/* Founder Text */}
          <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed text-[#2A4150]/80">
            <div className="space-y-4">
              <p>
                Several years back, I was diagnosed with pre-diabetes, and my Non-Alcoholic Fatty Liver was on meds for a year with no significant improvement. Research led me to incorporate a new approach to my diet and lifestyle. I thought that taking health supplements would help my digestion but instead, they were causing an upset stomach.
              </p>
              <p>
                The experience was so profound that it changed my perspective about health and nutrition and I also realized this is an opportunity to fill a gap in the market and solve the problem of quality health supplements for the general population.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                After years of research, I launched our own line of health supplements that are 100% natural, organic, and made from superior ingredients to ensure maximum results. Our brand began to grow; we started getting repeat orders and positive feedback from our customers.
              </p>
              <p>
                Word of mouth and customer feedback have turned our brand into a respected provider of high-quality products. I'm currently working on reaching more people with the goal of educating people to choose healthier lifestyles.
              </p>
            </div>
          </div>

          {/* Quote Block */}
          <div className="mt-16 text-center max-w-2xl mx-auto">
            <Quote className="mx-auto mb-4 opacity-20" size={40} />
            <h3 className="text-2xl font-bold italic mb-2">
              "You shouldn't have to make sacrifices when it comes to your health"
            </h3>
            <p className="font-semibold uppercase tracking-widest text-xs opacity-60">And that's why I built this brand</p>
          </div>

          {/* --- Feature Rows --- */}
          <div className="mt-24 space-y-24">
            
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="text-red-500" fill="currentColor" size={28} />
                  <h4 className="text-2xl font-bold">A Brand for People</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We are a brand for those people who are looking for the best out of what they have. 
                  For those who want to lead a Good Life!
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 rounded-full bg-white p-2 shadow-xl overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-full" alt="People" />
                </div>
              </div>
            </div>

            {/* Row 2 (Reversed) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="text-blue-500" size={28} />
                  <h4 className="text-2xl font-bold">Promote Healthy Lifestyle</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We promote living a lifestyle that's not too serious and we like to have a bit of fun. 
                  After all, life is about giving your best shot.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                 <div className="w-64 h-64 flex items-center justify-center">
                    {/* Simulated "Running" Graphic */}
                    <img src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-3xl rotate-3 shadow-lg" alt="Lifestyle" />
                 </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-green-600" size={28} />
                  <h4 className="text-2xl font-bold">Safety Assured Quality</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Our products are formulated in the USA and manufactured in India, 
                  making them High Quality, yet affordable for everyone.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative">
                   <img src="https://i.pinimg.com/1200x/5a/1b/dc/5a1bdc4a24ca086d5a13ada1fa35799a.jpg" className="w-64 h-auto rounded-lg shadow-2xl" alt="Herbal Quality" />
                   <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-full shadow-lg">
                      <ShieldCheck className="text-green-600" size={32} />
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- Footer / Extra Text --- */}
      <footer className="py-12 text-center text-sm opacity-50">
        <p>© 2024 Your Brand Name. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutUs;