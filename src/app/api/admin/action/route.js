import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const ADMIN_UID = "dd0b11eb-76c6-4afd-94b4-0d0845c85b5c";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, adminId } = body;

    if (adminId !== ADMIN_UID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { plan } = body; // used by update_hr_plan
    const sb = adminClient();
    let result = {};

    switch (action) {

      // ── HR actions ────────────────────────────────────────────
      case "approve_hr": {
        const { data: hr, error: fetchErr } = await sb
          .from("hr_registry").select("*").eq("id", id).single();
        if (fetchErr || !hr) throw new Error("HR record not found");

        // Generate unique ASLHR#### login ID
        const idChars = "0123456789";
        let hr_login_id;
        for (let attempt = 0; attempt < 20; attempt++) {
          const num = Array.from({ length: 4 }, () => idChars[Math.floor(Math.random() * 10)]).join("");
          hr_login_id = "ASLHR" + num;
          const { data: clash } = await sb
            .from("hr_registry").select("id").eq("hr_login_id", hr_login_id).maybeSingle();
          if (!clash) break;
        }

        // If HR already set their own password during registration, keep it.
        // Only generate a new password if no password is stored yet.
        let plainPassword = null;
        const updateData = { status: "approved", hr_login_id };

        if (!hr.password) {
          const pwChars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
          plainPassword = Array.from({ length: 8 }, () =>
            pwChars[Math.floor(Math.random() * pwChars.length)]
          ).join("");
          updateData.password = await bcrypt.hash(plainPassword, 10);
        }

        const { error } = await sb.from("hr_registry").update(updateData).eq("id", id);
        if (error) throw error;

        result = {
          message:     "HR approved",
          credentials: {
            hr_login_id,
            // null if HR self-set their password (admin doesn't need to share it)
            password:          plainPassword,
            self_set_password: !!hr.password,
            hr_name:           hr.name,
            company_name:      hr.company || "ASSISTLANA",
            email:             hr.email,
          },
        };
        break;
      }

      case "update_hr_plan": {
        if (!["free","premium"].includes(plan)) throw new Error("Invalid plan value");
        const { error } = await sb.from("hr_registry").update({ plan }).eq("id", id);
        if (error) throw error;
        result = { message: `HR plan updated to ${plan}` };
        break;
      }

      case "reject_hr": {
        const { error } = await sb.from("hr_registry").update({ status: "rejected" }).eq("id", id);
        if (error) throw error;
        result = { message: "HR rejected" };
        break;
      }

      case "delete_hr": {
        const { error } = await sb.from("hr_registry").delete().eq("id", id);
        if (error) throw error;
        result = { message: "HR deleted" };
        break;
      }

      // ── Candidate actions ──────────────────────────────────────
      case "delete_candidate": {
        // First get candidate email for cascade
        const { data: cand } = await sb.from("candidates").select("email").eq("id", id).single();
        if (cand?.email) {
          await sb.from("job_applications").delete().eq("candidate_email", cand.email);
          await sb.from("mock_interviews").delete().eq("candidate_email", cand.email);
          await sb.from("resume_suggestions").delete().eq("candidate_email", cand.email);
          await sb.from("internship_applications").delete().eq("email", cand.email);
        }
        const { error } = await sb.from("candidates").delete().eq("id", id);
        if (error) throw error;
        result = { message: "Candidate and related records deleted" };
        break;
      }

      // ── Job actions ────────────────────────────────────────────
      case "delete_job": {
        await sb.from("job_applications").delete().eq("job_id", id);
        const { error } = await sb.from("jobs").delete().eq("id", id);
        if (error) throw error;
        result = { message: "Job and applications deleted" };
        break;
      }

      // ── Internship application actions ─────────────────────────
      case "delete_internship": {
        const { error } = await sb.from("internship_applications").delete().eq("id", id);
        if (error) throw error;
        result = { message: "Internship application deleted" };
        break;
      }

      case "approve_internship": {
        const { error } = await sb.from("internship_applications").update({ status: "approved" }).eq("id", id);
        if (error) throw error;
        result = { message: "Internship approved" };
        break;
      }

      case "reject_internship": {
        const { error } = await sb.from("internship_applications").update({ status: "rejected" }).eq("id", id);
        if (error) throw error;
        result = { message: "Internship rejected" };
        break;
      }

      // ── Bulk deletes ───────────────────────────────────────────
      case "bulk_delete_old_jobs": {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await sb.from("jobs").delete().lt("created_at", cutoff);
        if (error) throw error;
        result = { message: "Old jobs deleted" };
        break;
      }

      case "bulk_delete_old_resumes": {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await sb.from("resume_suggestions").delete().lt("created_at", cutoff);
        if (error) throw error;
        result = { message: "Old resume suggestions deleted" };
        break;
      }

      case "bulk_delete_old_interviews": {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await sb.from("mock_interviews").delete().lt("created_at", cutoff);
        if (error) throw error;
        result = { message: "Old mock interviews deleted" };
        break;
      }

      case "bulk_delete_rejected_hr": {
        const { error } = await sb.from("hr_registry").delete().eq("status", "rejected");
        if (error) throw error;
        result = { message: "Rejected HR accounts deleted" };
        break;
      }

      case "bulk_delete_old_applications": {
        const cutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await sb.from("job_applications").delete().lt("applied_at", cutoff);
        if (error) throw error;
        result = { message: "Old job applications deleted" };
        break;
      }

      // ── Danger zone: clear all ─────────────────────────────────
      case "clear_mock_interviews": {
        const { error } = await sb.from("mock_interviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
        result = { message: "All mock interviews cleared" };
        break;
      }

      case "clear_resume_suggestions": {
        const { error } = await sb.from("resume_suggestions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
        result = { message: "All resume suggestions cleared" };
        break;
      }

      case "clear_job_applications": {
        await sb.from("job_applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await sb.from("internship_applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        result = { message: "All job and internship applications cleared" };
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Admin action error:", err);
    return NextResponse.json({ error: err.message || "Action failed" }, { status: 500 });
  }
}
