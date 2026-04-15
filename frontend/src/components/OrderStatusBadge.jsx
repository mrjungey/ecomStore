const colors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderStatusBadge({ status }) {
  const style = colors[status] || "bg-gray-100 text-gray-800";
  return (
    <span className={"inline-block px-2 py-0.5 rounded text-xs font-medium capitalize " + style}>
      {status}
    </span>
  );
}
