import TableRow from "./TableRow";

export default function TableBody({ data = [], columns = [], actions = [] }) {
  return (
    <tbody>
      {data.map((item, index) => (
        <TableRow
          key={index}
          row={item}
          columns={columns}
          actions={actions}
          isLast={index === data.length - 1}
        />
      ))}
    </tbody>
  );
}