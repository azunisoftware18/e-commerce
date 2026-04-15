import React from 'react'
import { Inbox } from 'lucide-react'

export default function TableEmpty({ message = "No records found" }) {
  return (
    <tbody>
      <tr>
        <td colSpan="100%" className="py-24 text-center">
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
            <Inbox size={48} strokeWidth={1} />
            <p className="text-sm font-medium">{message}</p>
          </div>
        </td>
      </tr>
    </tbody>
  )
}