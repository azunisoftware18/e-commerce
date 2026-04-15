import React from "react";

export default function Loader({ 
  fullScreen = false, 
  text = "Loading ", 
}) {
  // Container logic: fullScreen ke liye fixed position aur solid white background
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[150] flex flex-col items-center justify-center bg-white animate-in fade-in duration-300"
    : "flex flex-col items-center justify-center min-h-[60vh] w-full bg-white gap-3";

  return (
    <div className={containerClasses}>
      {/* Circle Spinner with your Theme Color */}
      <div 
        className="w-10 h-10 border-4 border-[#2A4150] border-t-transparent rounded-full animate-spin"
        style={{ borderTopColor: 'transparent' }}
      ></div>

      {/* Pulsing Text */}
      {text && (
        <p className="text-slate-500 font-medium animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
}