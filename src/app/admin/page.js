"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ADMIN_UID = "67f399fc-0ce3-4589-b1b4-ef7de2541cda";

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
