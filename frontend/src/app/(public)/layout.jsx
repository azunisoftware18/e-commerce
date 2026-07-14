"use client";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import React, { useState, useEffect } from 'react';
import EcommerceLoader from '@/components/common/EcommerceLoader';

export default function PublicLayout({ children }) {
  const [isLoaderDone, setIsLoaderDone] = useState(false);

  useEffect(() => {
    // Fixed 3.5 seconds delay - no exceptions
    const timer = setTimeout(() => {
      setIsLoaderDone(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Jab tak loader complete nahi hota, sirf loader dikhao
  if (!isLoaderDone) {
    return <EcommerceLoader />;
  }

  // Loader complete hone ke baad hi layout render karo
  return (
    <div className="animate-fadeIn">
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </div>
  );
}