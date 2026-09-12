"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { Upload, FileText, CheckCircle, Bell, X, Download } from "lucide-react";

export default function HRUpload() {
  const router  = useRouter();
  const fileRef = useRef();

  const [user,         setUser]         = useState(null);
  const [hrId,         setHrId]         = useState(null);
  const [hrStatus,     setHrStatus]     = useState(null);
  const [uploadLimit,  setUploadLimit]  = useState(null);
  const [files,        setFiles]        = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [parsing,      setParsing]      = useState(false);
  const [parsedResults,setParsedResults]= useState([]);
  const [done,         setDone]         = useState(false);
  const [drag,         setDrag]         = useState(false);
  const [error,        setError]        = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setHrId(u.id);

    // Verify HR account status
    const query = u.hr_login_id
      ? supabase.from("hr_registry").select("status").eq("hr_login_id", u.hr_login_id).single()
      : supabase.from("hr_registry").select("status").eq("email", u.email).single();
    query
      .then(({ data }) => setHrStatus(data?.status || "pending"))
      .catch(() => setHrStatus("pending"));

    // Fetch initial upload limit
    if (u.id) {
      fetchLimit(u.id, 0);
    }
  }, []);

  const fetchLimit = async (id, fileCount) => {
    try {
      const res = await fetch("/api/hr/check-upload-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrId: id, fileCount }),
      });
      const data = await res.json();
      setUploadLimit(data);
    } catch (e) {
      console.error("Limit check failed:", e);
    }
  };

  const addFiles = (fileList) => {
    const MAX_MB = 10;
    const errors = [];
    const valid  = [];
    [...fileList].forEach(f => {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!["pdf","docx","doc"].includes(ext)) {
        errors.push(`${f.name}: unsupported format (PDF/DOCX only).`);
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        errors.push(`${f.name}: exceeds ${MAX_MB} MB limit.`);
        return;
      }
      valid.push(f);
    });
    if (errors.length > 0) setError(errors.join(" "));
    else setError("");
    if (valid.length > 0) {
      const newFiles = [...files, ...valid];
      setFiles(newFiles);
      setDone(false);
      setParsedResults([]);
      if (hrId) fetchLimit(hrId, newFiles.length);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (hrId) fetchLimit(hrId, newFiles.length);
  };

  const clearAll = () => {
    setFiles([]);
    setDone(false);
    setParsedResults([]);
    setError("");
    setFileStatuses({});
    if (hrId) fetchLimit(hrId, 0);
  };

  const setFileStatus = (filename, status, data = null) =>
    setFileStatuses(prev => ({ ...prev, [filename]: { status, data } }));

  const handleParse = async () => {
    if (files.length === 0) { setError("No files selected."); return; }

    // Final limit check before parsing
    const limitRes = await fetch("/api/hr/check-upload-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hrId, fileCount: files.length }),
    });
    const limitData = await limitRes.json();

    if (!limitData.allowed) {
      setError(limitData.message || "Upload limit reached.");
      setUploadLimit(limitData);
      return;
    }

    setError("");
    setParsing(true);
    setDone(false);
    setParsedResults([]);
    setFileStatuses({});

    const results = [];

    for (const file of files) {
      try {
        // Step 1: Try text extraction from file
        setFileStatus(file.name, "extracting");
        let detailsPayload = null;

        try {
          const fd      = new FormData();
          fd.append("file", file);
          const textRes  = await fetch("/api/extract-resume-text", { method: "POST", body: fd });
          const textData = await textRes.json();
          if (textData.text) {
            detailsPayload = { resumeText: textData.text };
          }
        } catch (_) {}

        // Fallback: send file as base64 directly to Gemini (works for image-based PDFs too)
        if (!detailsPayload) {
          const ab    = await file.arrayBuffer();
          const bytes = new Uint8Array(ab);
          let binary  = "";
          bytes.forEach(b => { binary += String.fromCharCode(b); });
          detailsPayload = {
            fileBase64: btoa(binary),
            mimeType:   file.type || "application/pdf",
          };
        }

        // Step 2: Gemini extracts structured details
        setFileStatus(file.name, "analyzing");
        const detailsRes = await fetch("/api/extract-resume-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detailsPayload),
        });
        const extracted = await detailsRes.json();

        if (extracted.error) {
          setFileStatus(file.name, "error", { error: extracted.error });
          continue;
        }

        // Step 3: Save to Supabase candidates table
        setFileStatus(file.name, "saving");
        const saveRes = await supabase.from("candidates").upsert({
          name:             extracted.full_name    || "Unknown",
          email:            extracted.email        || `noemail_${Date.now()}@upload.com`,
          phone:            extracted.phone        || null,
          location:         extracted.location     || null,
          skills:           extracted.skills       || null,
          experience_years: parseInt(extracted.experience_years) || 0,
          domain:           extracted.domain       || null,
          education_degree: extracted.education_degree || null,
          passout_year:     extracted.passout_year || null,
          current_company:  extracted.current_company || null,
          current_role:     extracted.current_role || null,
          summary:          extracted.summary      || null,
          linkedin_url:     extracted.linkedin_url || null,
          uploaded_by_hr:   hrId,
          ai_score:         0,
          registered_at:    new Date().toISOString(),
        }, { onConflict: "email" });

        if (saveRes.error) {
          console.error("Save error:", saveRes.error);
          setFileStatus(file.name, "error", { error: saveRes.error.message });
        } else {
          const candidate = {
            filename:         file.name,
            full_name:        extracted.full_name        || "Unknown",
            email:            extracted.email            || "",
            phone:            extracted.phone            || "",
            location:         extracted.location         || "",
            education_degree: extracted.education_degree || "",
            passout_year:     extracted.passout_year     || "",
            experience_years: extracted.experience_years || "0",
            current_company:  extracted.current_company  || "",
            current_role:     extracted.current_role     || "",
            domain:           extracted.domain           || "",
            skills:           extracted.skills           || "",
            linkedin_url:     extracted.linkedin_url     || "",
            summary:          extracted.summary          || "",
          };
          results.push(candidate);
          setFileStatus(file.name, "done", candidate);
        }
      } catch (err) {
        console.error("Parse error for", file.name, err);
        setFileStatus(file.name, "error", { error: err.message });
      }
    }

    setParsedResults(results);
    setParsing(false);
    setDone(true);

    // Increment daily upload count
    if (results.length > 0 && hrId) {
      await fetch("/api/hr/increment-upload-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrId, count: results.length }),
      });
      fetchLimit(hrId, 0);
    }
  };

  const downloadExcel = () => {
    const rows = parsedResults.map(c => ({
      "Name":               c.full_name,
      "Email":              c.email,
      "Phone":              c.phone            || "",
      "Location":           c.location         || "",
      "Education Degree":   c.education_degree || "",
      "Passout Year":       c.passout_year     || "",
      "Experience (Years)": parseInt(c.experience_years) || 0,
      "Current Company":    c.current_company  || "",
      "Current Role":       c.current_role     || "",
      "Skills":             c.skills           || "",
      "Domain":             c.domain           || "",
      "AI Score":           0,
      "LinkedIn":           c.linkedin_url     || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, `candidates_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.xlsx`);
  };

  // ── Loading / status gates ────────────────────────────────────────────────────
  if (!user || hrStatus === null) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-8 h-8 border-4 border-[#0EA5C9]/20 border-t-[#0EA5C9] rounded-full animate-spin"/>
    </div>
  );

  if (hrStatus === "pending") return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-[#1E293B] mb-2">Account Pending Approval</h2>
        <p className="text-slate-500 text-sm mb-2">Your account is pending admin approval.</p>
        <p className="text-slate-400 text-xs mb-6">Contact <a href="mailto:admin@assistlana.com" className="text-[#0EA5C9] underline">admin@assistlana.com</a> for help.</p>
        <button onClick={() => { localStorage.removeItem("hr_user"); router.push("/"); }}
          className="px-6 py-2.5 bg-[#F1F5F9] text-slate-600 rounded-xl text-sm font-semibold hover:bg-[#E2E8F0] transition-all">
          Logout
        </button>
      </div>
    </div>
  );

  if (hrStatus === "rejected") return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-[#1E293B] mb-2">Account Not Approved</h2>
        <p className="text-slate-500 text-sm mb-6">Your account was not approved. Contact <a href="mailto:admin@assistlana.com" className="text-[#0EA5C9] underline">admin@assistlana.com</a> for assistance.</p>
        <button onClick={() => { localStorage.removeItem("hr_user"); router.push("/"); }}
          className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all">
          Logout
        </button>
      </div>
    </div>
  );

  const errorCount    = files.filter(f => fileStatuses[f.name]?.status === "error").length;
  const limitOverflow = uploadLimit && !uploadLimit.allowed && uploadLimit.plan !== "premium";

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 pl-12 md:pl-0">
              <div className="text-base md:text-lg font-bold text-[#1E293B]">Upload Resumes</div>
              <div className="text-xs text-slate-400">AI-powered extraction with Google Gemini</div>
            </div>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl flex-shrink-0">
              <Bell size={16} className="text-slate-500"/>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* Upload Limit Banner */}
          {uploadLimit && (
            <div className={`rounded-xl px-4 py-3 mb-6 text-sm flex items-center flex-wrap gap-3 ${
              uploadLimit.plan === "premium"
                ? "bg-green-50 border border-green-200 text-green-700"
                : uploadLimit.remaining === 0
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-blue-50 border border-blue-200 text-blue-700"
            }`}>
              {uploadLimit.plan === "premium" ? (
                <>
                  <span>⭐</span>
                  <span className="font-semibold">Premium Plan — Unlimited Resume Uploads</span>
                </>
              ) : uploadLimit.remaining === 0 ? (
                <>
                  <span>⚠️</span>
                  <span className="font-semibold">Daily limit reached ({uploadLimit.limit}/{uploadLimit.limit}) | Resets at midnight</span>
                  <span className="ml-auto text-xs font-semibold">⭐ Contact admin to upgrade to Premium</span>
                </>
              ) : (
                <>
                  <span>📊</span>
                  <span className="font-semibold">Free Plan: {uploadLimit.used}/{uploadLimit.limit} used today</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min((uploadLimit.used / uploadLimit.limit) * 100, 100)}%` }}/>
                    </div>
                    <span className="text-xs font-semibold">{uploadLimit.remaining} remaining | Resets midnight</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
              ⚠️ <span className="flex-1">{error}</span>
              <button onClick={() => setError("")}><X size={14}/></button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

            {/* ── LEFT: Upload Zone + File List ── */}
            <div>

              {/* Drop Zone */}
              <div
                onDragOver={e  => { e.preventDefault(); if (!parsing) setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e      => { e.preventDefault(); setDrag(false); if (!parsing) addFiles(e.dataTransfer.files); }}
                onClick={() => !parsing && fileRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-6 md:p-10 text-center transition-all ${
                  parsing ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                } ${drag
                  ? "border-[#0EA5C9] bg-[#F0F9FF]"
                  : "border-[#E2E8F0] bg-white hover:border-[#0EA5C9] hover:bg-[#F0F9FF]"
                }`}>
                <input ref={fileRef} type="file" multiple accept=".pdf,.docx" className="hidden"
                  onChange={e => addFiles(e.target.files)} disabled={parsing}/>
                <div className="text-4xl md:text-5xl mb-3">📁</div>
                <div className="text-base font-bold text-[#1E293B] mb-1">Drop resumes here</div>
                <div className="text-sm text-slate-400 mb-4">PDF or DOCX · Multiple files supported</div>
                <div className="inline-flex items-center gap-2 bg-[#0EA5C9] text-white px-5 py-2 rounded-xl text-sm font-semibold">
                  <Upload size={15}/> Choose Files
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-[#1E293B]">
                      {files.length} file{files.length > 1 ? "s" : ""} selected
                    </div>
                    {!parsing && (
                      <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-semibold underline">
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Over-limit warning */}
                  {limitOverflow && uploadLimit?.message && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-3 py-2 mb-2 text-xs font-medium">
                      {uploadLimit.message}
                    </div>
                  )}

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {files.map((f, i) => {
                      const fs     = fileStatuses[f.name];
                      const status = fs?.status || "ready";
                      return (
                        <div key={i} className={`flex items-center gap-3 rounded-xl px-3 md:px-4 py-3 border transition-all ${
                          status === "done"      ? "bg-green-50  border-green-200"  :
                          status === "error"     ? "bg-red-50    border-red-200"    :
                          status === "saving"    ? "bg-blue-50   border-blue-200"   :
                          status === "analyzing" ? "bg-purple-50 border-purple-200" :
                          status === "extracting"? "bg-yellow-50 border-yellow-200" :
                          "bg-white border-[#E2E8F0]"
                        }`}>
                          <FileText size={18} className={
                            status === "done"  ? "text-green-500 flex-shrink-0" :
                            status === "error" ? "text-red-400   flex-shrink-0" :
                            "text-[#0EA5C9] flex-shrink-0"
                          }/>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#1E293B] truncate">{f.name}</div>
                            <div className="text-xs text-slate-400 truncate">
                              {(f.size / 1024).toFixed(0)} KB
                              {status === "extracting"  && <span className="ml-2 text-yellow-600 font-medium">⏳ Reading file...</span>}
                              {status === "analyzing"   && <span className="ml-2 text-purple-600 font-medium">🧠 Gemini analyzing...</span>}
                              {status === "saving"      && <span className="ml-2 text-blue-600   font-medium">💾 Saving to DB...</span>}
                              {status === "done" && fs?.data  && <span className="ml-2 text-green-600 font-bold">→ {fs.data.full_name}</span>}
                              {status === "error" && fs?.data && <span className="ml-2 text-red-500">{fs.data.error}</span>}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {status === "done"  && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">✅</span>}
                            {status === "error" && <span className="text-xs bg-red-100   text-red-600   px-2 py-1 rounded-full font-bold">❌</span>}
                            {["extracting","analyzing","saving"].includes(status) && (
                              <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"/>
                            )}
                            {status === "ready" && !parsing && (
                              <button onClick={() => removeFile(i)}
                                className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-500 rounded-full flex items-center justify-center transition-all">
                                <X size={12}/>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parse Button */}
              <button
                onClick={handleParse}
                disabled={parsing || files.length === 0 || limitOverflow}
                className="mt-4 w-full bg-[#1253A4] hover:bg-[#0d47a1] text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                {parsing
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Parsing with Gemini AI...</>
                  : `🚀 Parse ${files.length || 0} Resume${files.length !== 1 ? "s" : ""} with AI`
                }
              </button>

              {/* Excel Download — shown after successful parse */}
              {done && parsedResults.length > 0 && (
                <button onClick={downloadExcel}
                  className="mt-3 w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                  <Download size={16}/> Download Excel ({parsedResults.length} candidates)
                </button>
              )}

              {/* Navigate to candidates after done */}
              {done && parsedResults.length > 0 && (
                <button onClick={() => router.push("/hr/candidates")}
                  className="mt-2 w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-all">
                  View All Candidates →
                </button>
              )}
            </div>

            {/* ── RIGHT: Results or Pipeline Info ── */}
            <div>
              {parsedResults.length > 0 ? (
                <div>
                  <div className="font-bold text-[#1E293B] mb-4 flex items-center gap-2 text-sm md:text-base">
                    <CheckCircle size={18} className="text-green-500"/>
                    {parsedResults.length} candidate{parsedResults.length > 1 ? "s" : ""} saved to database
                    {errorCount > 0 && <span className="text-red-500 text-xs ml-1">({errorCount} failed)</span>}
                  </div>
                  <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                    {parsedResults.map((c, i) => (
                      <div key={i} className="bg-white border border-green-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F1F5F9]">
                          <span className="text-green-600">✅</span>
                          <span className="text-xs font-semibold text-slate-400 truncate flex-1">{c.filename}</span>
                          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">Saved</span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div><span className="mr-2">👤</span><span className="font-bold text-[#1E293B]">{c.full_name}</span></div>
                          {c.email && (
                            <div><span className="mr-2">📧</span><span className="text-slate-600 text-xs break-all">{c.email}</span></div>
                          )}
                          {c.phone && (
                            <div><span className="mr-2">📱</span><span className="text-slate-600">{c.phone}</span></div>
                          )}
                          {(c.education_degree || c.passout_year) && (
                            <div>
                              <span className="mr-2">🎓</span>
                              <span className="text-slate-600">{[c.education_degree, c.passout_year].filter(Boolean).join(" | ")}</span>
                            </div>
                          )}
                          {(c.experience_years || c.current_role || c.domain) && (
                            <div>
                              <span className="mr-2">💼</span>
                              <span className="text-slate-600">
                                {[
                                  parseInt(c.experience_years) > 0 ? `${c.experience_years} yrs` : "Fresher",
                                  c.current_role,
                                  c.domain,
                                ].filter(Boolean).join(" · ")}
                              </span>
                            </div>
                          )}
                          {c.skills && (
                            <div>
                              <span className="mr-2">🛠️</span>
                              <span className="text-slate-600 text-xs">
                                {c.skills.split(",").slice(0, 6).map(s => s.trim()).join(", ")}
                                {c.skills.split(",").length > 6 ? "..." : ""}
                              </span>
                            </div>
                          )}
                          {c.location && (
                            <div><span className="mr-2">📍</span><span className="text-slate-600">{c.location}</span></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Pipeline info when no results yet
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-1 text-sm md:text-base">🤖 AI Processing Pipeline</div>
                  <div className="text-xs text-slate-400 mb-5">Powered by Google Gemini 1.5 Flash</div>
                  <div className="space-y-3">
                    {[
                      ["📄", "Upload PDF or DOCX resume files"],
                      ["🔍", "Text extracted from document content"],
                      ["🧠", "Gemini AI reads and understands resume"],
                      ["⚡", "Extracts name, email, phone, skills, education"],
                      ["🎯", "Detects domain, role, experience, company"],
                      ["💾", "Saved instantly to Supabase database"],
                      ["📊", "Excel download with all extracted data"],
                    ].map(([icon, label], i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                        <span className="text-xl w-8 text-center">{icon}</span>
                        <span className="text-sm text-slate-600">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      ["Model",   "Gemini 1.5 Flash"],
                      ["Saved To","Supabase DB"],
                      ["Format",  "PDF · DOCX"],
                      ["Limit",   uploadLimit?.plan === "premium"
                        ? "Unlimited"
                        : uploadLimit?.remaining != null
                          ? `${uploadLimit.remaining} left today`
                          : "Loading..."],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                        <div className="text-sm font-bold text-[#1253A4]">{v}</div>
                        <div className="text-xs text-slate-400">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
