// context/CartAnimationContext.js
"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CartAnimationContext = createContext();

export function CartAnimationProvider({ children }) {
  const [animations, setAnimations] = useState([]);
  const cartIconRef = useRef(null);

  const setCartIconRef = useCallback((ref) => {
    cartIconRef.current = ref;
  }, []);

  const triggerFlyToCart = useCallback((startPosition, productImage) => {
    // Get cart icon position
    let endPosition = { x: window.innerWidth - 100, y: 30 };
    
    if (cartIconRef.current) {
      const rect = cartIconRef.current.getBoundingClientRect();
      endPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    const id = Date.now() + Math.random();
    setAnimations((prev) => [
      ...prev,
      { id, startPosition, endPosition, productImage },
    ]);

    // Remove animation after it completes
    setTimeout(() => {
      setAnimations((prev) => prev.filter((anim) => anim.id !== id));
    }, 1000);
  }, []);

  return (
    <CartAnimationContext.Provider value={{ animations, triggerFlyToCart, setCartIconRef }}>
      {children}
      {/* Render flying items */}
      <AnimatePresence>
        {animations.map((anim) => (
          <motion.div
            key={anim.id}
            initial={{
              position: "fixed",
              left: anim.startPosition.x - 24,
              top: anim.startPosition.y - 24,
              opacity: 1,
              scale: 1,
              zIndex: 9999,
            }}
            animate={{
              left: anim.endPosition.x - 24,
              top: anim.endPosition.y - 24,
              opacity: 0,
              scale: 0.3,
              transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed z-[9999]"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-2xl border-2 border-[#2A4150]">
              <motion.img
                src={anim.productImage}
                alt=""
                className="w-full h-full object-cover"
                animate={{ rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error("useCartAnimation must be used within CartAnimationProvider");
  }
  return context;
}