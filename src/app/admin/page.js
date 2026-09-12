"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_UID = "dd0b11eb-76c6-4afd-94b4-0d0845c85b5c";

export default function AdminRoot() {
  const router = useRouter();
  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminAuth");
      if (!raw) { router.replace("/admin/login"); return; }
      const auth = JSON.parse(raw);
      if (auth.id === ADMIN_UID) {
        router.replace("/admin/dashboard");
      } else {
        localStorage.removeItem("adminAuth");
        router.replace("/admin/login");
      }
    } catch {
      router.replace("/admin/login");
    }
  }, []);
  return null;
}
