"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const ADMIN_UID = "67f399fc-0ce3-4589-b1b4-ef7de2541cda";

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    // Login page is always accessible
    if (pathname === "/admin/login") { setStatus("ok"); return; }

    try {
      const raw = localStorage.getItem("adminAuth");
      if (!raw) { router.replace("/admin/login"); return; }
      const auth = JSON.parse(raw);
      if (auth.id !== ADMIN_UID) {
        localStorage.removeItem("adminAuth");
        router.replace("/admin/login");
        return;
      }
      setStatus("ok");
    } catch {
      localStorage.removeItem("adminAuth");
      router.replace("/admin/login");
    }
  }, [pathname]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1D3A]">
        <div className="text-[#0EA5C9] text-sm animate-pulse">Verifying access...</div>
      </div>
    );
  }

  return <>{children}</>;
}
