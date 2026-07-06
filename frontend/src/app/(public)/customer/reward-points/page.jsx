"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { 
  Coins, 
  Trophy, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Sparkles, 
  Calendar, 
  Hash, 
  ChevronRight 
} from "lucide-react";
import { useRewardBalance, useRewardHistory } from "@/lib/queries/useRewards";
import AuthGuard from "@/components/common/AuthGuard";
import Link from "next/link";

// Animation configs
const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function RewardsPage() {
  const { data: balance, isLoading: balanceLoading } = useRewardBalance();
  const { data: history = [], isLoading: historyLoading } = useRewardHistory();

  // Skeleton Loader for premium feel
  if (balanceLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-[#2A4150] border-t-transparent rounded-full"
        />
        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Fetching Your Rewards...</p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="bg-white min-h-screen py-6 sm:py-8 md:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Section */}
          <motion.header
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2A4150] bg-[#2A4150]/5 px-3 py-1 rounded-full w-fit mb-3 uppercase tracking-wider">
                <Sparkles size={12} className="fill-[#2A4150]" /> Exclusive Club
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                My Rewards
              </h1>
              <p className="text-slate-500 text-sm sm:text-base mt-1 max-w-xl font-medium">
                Earn reward points on every purchase and redeem them instantly during checkout.
              </p>
            </div>
            
            <Link href="/">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-[#2A4150] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Shop & Earn <ChevronRight size={16} />
              </motion.button>
            </Link>
          </motion.header>

          {/* Cards Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-10"
          >
            {/* Available Balance Card */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
                <h2 className="text-4xl sm:text-5xl font-black text-[#2A4150] mt-2 tracking-tight">
                  {balance?.rewardPoints || 0}
                  <span className="text-sm font-bold text-slate-400 ml-1.5 tracking-normal">pts</span>
                </h2>
                <p className="text-[11px] text-green-600 font-bold mt-2 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md w-fit">
                  Ready to redeem
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl text-green-600 shadow-md shadow-green-100 shrink-0">
                <Coins size={28} className="animate-pulse" />
              </div>
            </motion.div>

            {/* Lifetime Earned Card */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Lifetime Earned</p>
                <h2 className="text-4xl sm:text-5xl font-black text-amber-500 mt-2 tracking-tight">
                  {balance?.lifetimePoints || 0}
                  <span className="text-sm font-bold text-amber-400 ml-1.5 tracking-normal">pts</span>
                </h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-2">
                  Total points accumulated
                </p>
              </div>
              <div className="bg-amber-100 p-4 rounded-2xl text-amber-600 shadow-md shadow-amber-100 shrink-0">
                <Trophy size={28} />
              </div>
            </motion.div>
          </motion.div>

          {/* History Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Transaction History</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Detailed log of your points activity</p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white border px-2.5 py-1 rounded-lg shadow-2xs">
                {history.length} Logs
              </span>
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Calendar size={20} />
                </div>
                <h3 className="text-slate-800 font-bold text-sm">No History Yet</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-[240px] mx-auto">
                  Your rewards ledger is empty. Start shopping to trigger your first entry!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {history.map((item, index) => {
                    const isEarned = item.type === "EARNED";
                    return (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 transition group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Indicator Icon */}
                          <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                            isEarned ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          }`}>
                            {isEarned ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate group-hover:text-slate-900 transition-colors">
                              {item.description}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-semibold">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </span>
                              
                              {item.order && (
                                <span className="flex items-center gap-0.5 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm text-[10px] font-mono">
                                  <Hash size={10} /> {item.order.id.slice(0, 8).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Points Counter */}
                        <div className={`font-black text-sm sm:text-base shrink-0 ml-4 border px-3 py-1 rounded-xl transition-all ${
                          isEarned 
                            ? "text-emerald-600 bg-emerald-50/30 border-emerald-100" 
                            : "text-rose-600 bg-rose-50/30 border-rose-100"
                        }`}>
                          {isEarned ? "+" : "-"}
                          {Math.abs(item.points)} <span className="text-[10px] font-bold uppercase tracking-wider">pts</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </AuthGuard>
  );
}