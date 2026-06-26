"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestDB() {
  const [candidates, setCandidates] = useState([]);
  const [status,     setStatus]     = useState("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*");

      if (error) {
        setStatus("❌ Error: " + error.message);
      } else {
        setCandidates(data);
        setStatus("✅ Connected! " + data.length + " candidates found.");
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding:40, fontFamily:"sans-serif" }}>
      <h1>Supabase Connection Test</h1>
      <p style={{ marginTop:16, fontSize:18 }}>{status}</p>
      {candidates.map((c,i) => (
        <div key={i} style={{ marginTop:12, padding:12, background:"#f0f4fa", borderRadius:8 }}>
          <strong>{c.name}</strong> · {c.location} · Score: {c.ai_score}
        </div>
      ))}
    </div>
  );
}