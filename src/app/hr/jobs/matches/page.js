import { Suspense } from "react";
import JobMatchesClient from "./JobMatchesClient";

export default function JobMatchesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FA]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1253A4] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <div className="text-slate-500">Loading...</div>
        </div>
      </div>
    }>
      <JobMatchesClient />
    </Suspense>
  );
}