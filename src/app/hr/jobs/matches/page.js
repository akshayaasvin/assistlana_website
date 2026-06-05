import { Suspense } from "react";
import JobMatchesClient from "./JobMatchesClient";

export default function JobMatches() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobMatchesClient />
    </Suspense>
  );
}