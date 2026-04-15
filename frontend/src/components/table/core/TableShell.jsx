import React from 'react'

export default function TableShell({ children, pagination, className = "" }) {
  return (
    <div className={`w-full overflow-visible rounded-xl border border-slate-200 bg-white scrollbar-hidden ${className}`}>
      <div className="overflow-visible">
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          {children}
        </table>
      </div>
      
      {/* Pagination Container */}
      {pagination && (
        <div className="border-t border-slate-200 bg-slate-50/30">
          {pagination}
        </div>
      )}
    </div>
  )
}