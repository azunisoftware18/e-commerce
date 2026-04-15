import React from 'react'

export default function TableLoader({ rows = 5 }) {
  return (
    <tbody>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-50">
          <td colSpan="100%" className="px-6 py-5">
            <div className="h-4 bg-slate-100 rounded w-full" />
          </td>
        </tr>
      ))}
    </tbody>
  )
}