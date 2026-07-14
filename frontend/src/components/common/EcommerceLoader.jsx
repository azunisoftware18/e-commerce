"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

export default function EcommerceLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [minimumTimeReached, setMinimumTimeReached] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Minimum 3 seconds timer ⬇️ YAHAN CHANGE KIYA
    const minimumTimer = setTimeout(() => {
      setMinimumTimeReached(true);
    }, 3000); // 5000 se badalkar 3000 (3 seconds)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return 85;
        return prev + Math.random() * 10;
      });
    }, 500);

    // Check if page is fully loaded
    const handlePageLoad = () => {
      setPageLoaded(true);
    };

    // If page already loaded
    if (document.readyState === "complete") {
      setTimeout(handlePageLoad, 1000);
    } else {
      window.addEventListener("load", handlePageLoad);
    }

    // Safety fallback - force hide after 6 seconds ⬇️ YAHAN CHANGE KIYA
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // 8000 se badalkar 6000 (6 seconds max)

    return () => {
      clearInterval(progressInterval);
      clearTimeout(minimumTimer);
      clearTimeout(fallbackTimer);
      window.removeEventListener("load", handlePageLoad);
    };
  }, []);

  // Check if both conditions are met
  useEffect(() => {
    if (minimumTimeReached && pageLoaded) {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  }, [minimumTimeReached, pageLoaded]);

  // Don't render anything if not loading
  if (!isLoading) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        >
          <div className="relative flex flex-col items-center gap-8">
            {/* Floating Shopping Bags */}
            <div className="relative w-32 h-32">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  <ShoppingCart className="w-20 h-20" style={{ color: "#2A4150" }} />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                    style={{ backgroundColor: "#2A4150" }}
                  />
                </div>
              </motion.div>

              {/* Orbiting dots */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                  className="absolute inset-0"
                  style={{
                    transformOrigin: "center",
                    transform: `rotate(${i * 120}deg)`,
                  }}
                >
                  <motion.div
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{
                      backgroundColor: "#2A4150",
                      position: "absolute",
                      top: "0%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Brand Name Animation */}
            <div className="text-center space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold"
                style={{ color: "#2A4150" }}
              >
                Herbsnglam
              </motion.h1>

              {/* Loading Progress Bar */}
              <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: "#2A4150" }}
                />
              </div>

              <motion.p
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-sm font-medium"
                style={{ color: "#2A4150", opacity: 0.7 }}
              >
                {!pageLoaded && progress < 50 
                  ? "Preparing your shopping experience..." 
                  : !pageLoaded && progress < 85
                  ? "Loading premium products..."
                  : minimumTimeReached && pageLoaded
                  ? "Welcome to Herbsnglam!"
                  : "Almost ready..."}
              </motion.p>
            </div>

            {/* Pulsing Product Cards */}
            {/* <div className="flex gap-4 mt-4">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: item * 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-16 h-20 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                >
                  <div 
                    className="w-full h-3/4 relative overflow-hidden"
                    style={{ backgroundColor: "#2A4150", opacity: 0.1 }}
                  >
                    <motion.div
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    />
                  </div>
                  <div 
                    className="w-full h-1/4"
                    style={{ backgroundColor: "#2A4150" }}
                  />
                </motion.div>
              ))}
            </div> */}
          </div>

          {/* Decorative background elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full filter blur-3xl"
            style={{ backgroundColor: "#2A4150" }}
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full filter blur-3xl"
            style={{ backgroundColor: "#2A4150" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}