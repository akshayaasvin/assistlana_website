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

export function downloadInternshipExcel(applications, filename = "Internship_Applications") {
  const rows = applications.map((a, i) => ({
    "S.No":           i + 1,
    "Name":           a.name,
    "Email":          a.email,
    "Phone":          a.phone || "",
    "College":        a.college || "",
    "Department":     a.department || "",
    "Year of Study":  a.year_of_study || "",
    "Role Applied":   a.role || "",
    "Message":        a.message || "",
    "Status":         a.status || "Pending",
    "Applied At":     a.applied_at ? new Date(a.applied_at).toLocaleDateString() : "",
    "Resume URL":     a.resume_url || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5  }, { wch: 20 }, { wch: 28 }, { wch: 15 }, { wch: 22 },
    { wch: 18 }, { wch: 14 }, { wch: 22 }, { wch: 35 }, { wch: 14 },
    { wch: 14 }, { wch: 40 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Internship Applications");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function downloadHRUsersExcel(hrUsers, filename = "HR_Users") {
  const rows = hrUsers.map((u, i) => ({
    "S.No":         i + 1,
    "Name":         u.name || "",
    "Email":        u.email || "",
    "Phone":        u.phone || "",
    "Company":      u.company || "",
    "Status":       u.status || "",
    "Registered At":u.registered_at ? new Date(u.registered_at).toLocaleDateString() : "",
    "Last Login":   u.last_login    ? new Date(u.last_login).toLocaleDateString()    : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 }, { wch: 20 }, { wch: 28 }, { wch: 15 }, { wch: 20 },
    { wch: 12 }, { wch: 16 }, { wch: 16 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HR Users");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function downloadCandidatesExcel2(candidates, filename = "Candidates") {
  const rows = candidates.map((c, i) => ({
    "S.No":         i + 1,
    "Name":         c.name || "",
    "Email":        c.email || "",
    "Phone":        c.phone || "",
    "College":      c.college || "",
    "Skills":       Array.isArray(c.skills) ? c.skills.join(", ") : (c.skills || ""),
    "ATS Score":    c.ats_score || 0,
    "Status":       c.status || "Pending",
    "Registered At":c.registered_at ? new Date(c.registered_at).toLocaleDateString() : "",
    "Last Login":   c.last_login    ? new Date(c.last_login).toLocaleDateString()    : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 }, { wch: 20 }, { wch: 28 }, { wch: 15 }, { wch: 22 },
    { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 16 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Candidates");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function downloadJobsExcel(jobs, filename = "Jobs") {
  const rows = jobs.map((j, i) => ({
    "S.No":        i + 1,
    "Title":       j.title || "",
    "Company":     j.company || "",
    "Location":    j.location || "",
    "Job Type":    j.job_type || "",
    "Work Mode":   j.work_mode || "",
    "Experience":  j.experience || "",
    "Salary":      j.salary || "",
    "Skills":      Array.isArray(j.skills) ? j.skills.join(", ") : (j.skills || ""),
    "Posted By":   j.posted_by || "",
    "Status":      j.status || "",
    "Posted At":   j.created_at ? new Date(j.created_at).toLocaleDateString() : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 }, { wch: 28 }, { wch: 20 }, { wch: 18 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 35 }, { wch: 22 },
    { wch: 12 }, { wch: 14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Jobs");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}