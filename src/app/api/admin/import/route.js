import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_UID = "dd0b11eb-76c6-4afd-94b4-0d0845c85b5c";
const BATCH = 50;

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  try {
    const { type, rows, adminId } = await request.json();

    if (adminId !== ADMIN_UID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows to import" }, { status: 400 });
    }

    const sb = adminClient();
    let success = 0, skipped = 0;
    const failed = [];

    if (type === "candidates") {
      // Check existing emails
      const emails = rows.map(r => r.email).filter(Boolean);
      const { data: existing } = await sb.from("candidates").select("email").in("email", emails);
      const existingSet = new Set((existing || []).map(r => r.email));

      const toInsert = [];
      for (const row of rows) {
        if (!row.email || !row.name) { failed.push({ row: row.email || "?", reason: "Missing name or email" }); continue; }
        if (existingSet.has(row.email)) { skipped++; continue; }
        toInsert.push({
          name:     String(row.name || "").trim(),
          email:    String(row.email || "").trim().toLowerCase(),
          password: String(row.password || "Password@123"),
          phone:    String(row.phone || ""),
          college:  String(row.college || ""),
          status:   String(row.status || "Pending"),
          skills:   Array.isArray(row.skills) ? row.skills : String(row.skills || "").split(",").map(s => s.trim()).filter(Boolean),
          ai_score: Number(row.ai_score) || 0,
          ats_score:Number(row.ats_score) || 0,
          jd_match: Number(row.jd_match) || 0,
        });
      }

      for (let i = 0; i < toInsert.length; i += BATCH) {
        const { data, error } = await sb.from("candidates").insert(toInsert.slice(i, i + BATCH)).select("id");
        if (error) {
          failed.push({ row: `batch ${i / BATCH + 1}`, reason: error.message });
        } else {
          success += data?.length || 0;
        }
      }

    } else if (type === "hr") {
      const emails = rows.map(r => r.email).filter(Boolean);
      const { data: existing } = await sb.from("hr_registry").select("email").in("email", emails);
      const existingSet = new Set((existing || []).map(r => r.email));

      // Fetch all existing login IDs once so we can guarantee uniqueness in this batch
      const { data: existingIds } = await sb.from("hr_registry").select("hr_login_id");
      const usedIds = new Set((existingIds || []).map(r => r.hr_login_id).filter(Boolean));

      const pwChars  = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
      const genPassword = () => Array.from({ length: 8 }, () => pwChars[Math.floor(Math.random() * pwChars.length)]).join("");
      const genHrId = () => {
        let id;
        do { id = "ASLHR" + String(Math.floor(1000 + Math.random() * 9000)); } while (usedIds.has(id));
        usedIds.add(id);
        return id;
      };

      const toInsert = [];
      const credentials = [];
      for (const row of rows) {
        if (!row.email || !row.name) { failed.push({ row: row.email || "?", reason: "Missing name or email" }); continue; }
        if (existingSet.has(row.email)) { skipped++; continue; }
        const hr_login_id   = genHrId();
        const plain_password = genPassword();
        toInsert.push({
          name:         String(row.name || "").trim(),
          email:        String(row.email || "").trim().toLowerCase(),
          phone:        String(row.phone || ""),
          company:      String(row.company || "ASSISTLANA"),
          status:       "approved",
          hr_login_id,
          password:     plain_password,
        });
        credentials.push({
          name:         String(row.name || "").trim(),
          company:      String(row.company || "ASSISTLANA"),
          email:        String(row.email || "").trim().toLowerCase(),
          hr_login_id,
          plain_password,
        });
      }

      for (let i = 0; i < toInsert.length; i += BATCH) {
        const { data, error } = await sb.from("hr_registry").insert(toInsert.slice(i, i + BATCH)).select("id");
        if (error) {
          failed.push({ row: `batch ${i / BATCH + 1}`, reason: error.message });
        } else {
          success += data?.length || 0;
        }
      }

      return NextResponse.json({ success, skipped, failed: failed.length, details: failed, credentials });

    } else if (type === "jobs") {
      const toInsert = [];
      for (const row of rows) {
        if (!row.title) { failed.push({ row: row.title || "?", reason: "Missing title" }); continue; }
        toInsert.push({
          title:         String(row.title || "").trim(),
          company:       String(row.company || "ASSISTLANA"),
          location:      String(row.location || ""),
          job_type:      String(row.job_type || "Full-time"),
          work_mode:     String(row.work_mode || "On-site"),
          experience:    String(row.experience || ""),
          salary:        String(row.salary || ""),
          description:   String(row.description || ""),
          apply_type:    String(row.apply_type || "internal"),
          external_link: String(row.external_link || ""),
          status:        String(row.status || "Active"),
          skills_required: Array.isArray(row.skills_required)
            ? row.skills_required
            : String(row.skills_required || "").split(",").map(s => s.trim()).filter(Boolean),
          posted_by: adminId,
          hr_id:     adminId,
        });
      }

      for (let i = 0; i < toInsert.length; i += BATCH) {
        const { data, error } = await sb.from("jobs").insert(toInsert.slice(i, i + BATCH)).select("id");
        if (error) {
          failed.push({ row: `batch ${i / BATCH + 1}`, reason: error.message });
        } else {
          success += data?.length || 0;
        }
      }

    } else {
      return NextResponse.json({ error: `Unknown import type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ success, skipped, failed: failed.length, details: failed });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: err.message || "Import failed" }, { status: 500 });
  }
}
