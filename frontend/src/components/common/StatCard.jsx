import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trendValue,
  isUp,
  className = "",
}) {
  return (
    <div
      className={`bg-white p-6 rounded-xl border border-[#e0e0e0] shadow-sm flex flex-col gap-4 min-w-60 transition-all ${className}`}
    >
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
        <Icon size={22} />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">
          {title}
        </p>

        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[#2A4150]">{value}</h2>

          {trendValue && (
            <div
              className={`flex items-center gap-1 text-sm font-bold ${isUp ? "text-emerald-500" : "text-red-500"}`}
            >
              {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
