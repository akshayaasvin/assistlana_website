export default function StatusBadge({ status }) {
  const styles = {
    Active:        "bg-green-100 text-green-800",
    Inactive:      "bg-red-100 text-red-800",
    Pending:       "bg-yellow-100 text-yellow-800",
    Enterprise:    "bg-purple-100 text-purple-800",
    Growth:        "bg-blue-100 text-blue-800",
    Starter:       "bg-gray-100 text-gray-800",
    "HR Manager":  "bg-blue-100 text-blue-800",
    "HR Viewer":   "bg-slate-100 text-slate-800",
    "Super Admin": "bg-purple-100 text-purple-800",
    "Org Admin":   "bg-indigo-100 text-indigo-800",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}