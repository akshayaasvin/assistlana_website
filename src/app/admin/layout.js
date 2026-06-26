"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AUTHORIZED_UID = "dd0b11eb-76c6-4afd-94b4-0d0845c85b5c";

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "denied"

  useEffect(() => {
    if (pathname === "/admin/login") { setStatus("ok"); return; }

    const stored = localStorage.getItem("admin_user");
    if (!stored) { router.replace("/"); return; }

    try {
      const admin = JSON.parse(stored);
      if (admin.uid !== AUTHORIZED_UID) {
        localStorage.removeItem("admin_user");
        setStatus("denied");
        router.replace("/");
        return;
      }
      setStatus("ok");
    } catch {
      router.replace("/");
    }
  }, [pathname]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-[#64748B] text-sm">Verifying access...</div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="text-red-500 font-bold text-lg mb-2">Unauthorized Access</div>
          <div className="text-[#64748B] text-sm">You do not have permission to view this page.</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
