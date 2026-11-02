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

  // Show only the loader until it has finished.
  if (!isLoaderDone) {
    return <EcommerceLoader />;
  }

  // Render the layout only after the loader has completed.
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
