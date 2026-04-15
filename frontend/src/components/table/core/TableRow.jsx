import ActionMenu from "@/components/common/ActionMenu";

export default function TableRow({
  columns,
  row,
  actions = [],
  isLast = false,
}) {
  const safeActions = Array.isArray(actions) ? actions : [];

  return (
    <tr className="flex flex-col mb-4 border border-slate-200 rounded-lg md:table-row md:mb-0 md:border-0 md:border-b md:border-slate-200 hover:bg-[#e0e0e0] transition-colors group">
      {columns.map((col) => (
        <td
          key={col.accessor}
          className={`
            px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell
            text-sm font-medium text-slate-700 
            ${!isLast ? "border-b border-slate-50 md:border-b-0" : ""}
            ${col.cellClassName || ""}
          `}
        >
          {/* Label visible only on Mobile */}
          <span className="md:hidden text-xs font-semibold uppercase text-slate-400">
            {col.label}
          </span>
          
          <div className="text-right md:text-left">
            {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
          </div>
        </td>
      ))}

      {/* Action Menu Column */}
      {safeActions.length > 0 && (
  <td className="px-4 py-3 md:px-6 md:py-4 text-right md:table-cell bg-slate-50/30 md:bg-transparent">
    <div className="flex justify-between items-center md:justify-end">
      <span className="md:hidden text-xs font-semibold uppercase text-slate-400">
        Actions
      </span>
      <ActionMenu
        align="right"
        actions={safeActions.map((action) => ({
          ...action,
          onClick: () => action.onClick && action.onClick(row),
        }))}
      />
    </div>
  </td>
)}
    </tr>
  );
}