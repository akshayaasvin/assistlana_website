export default function Button({ children, onClick, type = "button", variant = "primary", fullWidth = false, disabled = false }) {

  const base = "px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150 flex items-center gap-2 justify-center cursor-pointer border-0";

  const variants = {
    primary:   "bg-[#1253A4] text-white hover:bg-[#0d47a1]",
    secondary: "bg-[#F1F5F9] text-[#1E293B] hover:bg-[#E2E8F0]",
    danger:    "bg-[#EF4444] text-white hover:bg-[#DC2626]",
    success:   "bg-[#10B981] text-white hover:bg-[#059669]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}