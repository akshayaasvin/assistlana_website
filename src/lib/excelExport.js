import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function downloadCandidatesExcel(candidates, filename = "Candidates_Report") {
  // Build rows
  const rows = candidates.map((c, i) => ({
    "S.No":           i + 1,
    "Candidate Name": c.name,
    "Email":          c.email,
    "Role Applied":   c.role,
    "AI Score":       c.score,
    "JD Match %":     c.jd_match + "%",
    "Skills":         Array.isArray(c.skills) ? c.skills.join(", ") : c.skills,
    "Experience (yrs)": c.exp,
    "Education":      c.edu,
    "Qualification":  c.qualification || c.edu,
    "Location":       c.location || "N/A",
    "Age":            c.age || "N/A",
    "Status":         c.status,
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 5  },  // S.No
    { wch: 20 },  // Name
    { wch: 28 },  // Email
    { wch: 25 },  // Role
    { wch: 10 },  // Score
    { wch: 10 },  // JD Match
    { wch: 35 },  // Skills
    { wch: 15 },  // Experience
    { wch: 15 },  // Education
    { wch: 15 },  // Qualification
    { wch: 14 },  // Location
    { wch: 8  },  // Age
    { wch: 14 },  // Status
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Candidates");

  // Write and download
  const excelBuffer = XLSX.write(wb, { bookType:"xlsx", type:"array" });
  const blob = new Blob([excelBuffer], { type:"application/octet-stream" });
  saveAs(blob, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function downloadSingleCandidate(candidate) {
  downloadCandidatesExcel([candidate], `${candidate.name.replace(" ","_")}_Profile`);
}