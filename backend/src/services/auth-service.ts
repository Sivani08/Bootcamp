import { createClient } from "@supabase/supabase-js";

const normalizeName = (v: string) =>
  v.trim().toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9 ]/g, "");

const internalEmail = (employeeId: string) =>
  `emp-${employeeId.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}@bootmind.internal`;

const randomPassword = () =>
  `Bm-${crypto.randomUUID()}-${crypto.randomUUID()}`;

const ACTUAL_TRAINEES: Record<string, { name: string; dept: string; email: string }> = {
  "ci254": { name: "AnanyaSree Sridharan", dept: "DCG", email: "AnanyaSree.Sridharan@agilisium.com" },
  "ci250": { name: "ArakatavemulaLakshmi Kullayamma", dept: "DE", email: "ArakatavemulaLakshmi.Kullayamma@agilisium.com" },
  "ci267": { name: "Aruna Kiruthija", dept: "CT", email: "Aruna.Kiruthija@aglisium.com" },
  "ci255": { name: "Jagan Saravanan", dept: "DE", email: "Jagan.Saravanan@agilisium.com" },
  "ci263": { name: "Janarthanan Karuppusamy", dept: "DCG", email: "Janarthanan.Karuppasamy@agilisium.com" },
  "ci261": { name: "Jayashree Sankar", dept: "DE", email: "Jayashree.Sankar@agilisium.com" },
  "ci269": { name: "Jeevanantham Balamurugan", dept: "CT", email: "jeevanantham.balamurugan@agilisium.com" },
  "ci264": { name: "Jeyakrishnan Rajendran", dept: "CT", email: "Jeyakrishnan.Rajendran@agilisium.com" },
  "ci257": { name: "Karthick Saravanan", dept: "DE", email: "Karthick.Saravanan@agilisium.com" },
  "ci268": { name: "Karthik Thiyagarajan", dept: "DCG", email: "karthik.thiyagarajan@agilisium.com" },
  "ci258": { name: "Kethireddy Sivani", dept: "DE", email: "Kethireddy.Sivani@agilisium.com" },
  "ci271": { name: "Lakshan VijayaSekar", dept: "CT", email: "Lakshan.VijayaSekar@agilisium.com" },
  "11701": { name: "Lingesh Thirumalai", dept: "CT", email: "Lingesh.Thirumalai@agilisium.com" },
  "ci252": { name: "MittapalliBhanu Vardhanreddy", dept: "DE", email: "MittapalliBhanu.Vardhanreddy@agilisium.com" },
  "ci259": { name: "Monaleesaa Karthikeyan", dept: "CT", email: "Monaleesaa.Karthikeyan@agilisium.com" },
  "ci253": { name: "Nandimandalam Akanksha Sree", dept: "CT", email: "NandimandalamAkanksha.Sree@agilisium.com" },
  "ci265": { name: "Nithish Balaji", dept: "CT", email: "Nithish.Balaji@agilisium.com" },
  "ci251": { name: "PentelaAjay Kumar", dept: "CT", email: "PentelaAjay.Kumar@agilisium.com" },
  "ci270": { name: "Priyatharshini kannan", dept: "CT", email: "Priyatharshini.kannan@aglisium.com" },
  "ci278": { name: "SANJAY", dept: "CT", email: "sanjay@agilisium.com" },
  "ci256": { name: "SandhiyaSri Dhandapani", dept: "CT", email: "SandhiyaSri.Dhandapani@agilisium.com" },
  "ci266": { name: "Shandrakala Nagendran", dept: "DE", email: "Shandrakala.Nagendran@agilisium.com" },
  "ci260": { name: "Sivakumar NandaKumar", dept: "DCG", email: "Sivakumar.NandaKumar@agilisium.com" },
  "ci262": { name: "Srinithi Santhoshkumar", dept: "DE", email: "Srinithi.Santhoshkumar@agilisium.com" },
  "ci272": { name: "Bhuvana", dept: "DE", email: "bhuvana@agilisium.com" },
  "ci273": { name: "Shiva Prashanth", dept: "DE", email: "shiva.prashanth@agilisium.com" },
  "ci274": { name: "Yavvna Lakshmi", dept: "DE", email: "yavvna.lakshmi@agilisium.com" }
};

export async function traineeLoginHandler(employee_id: string, employee_name: string) {
  const url = process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "placeholder-key";
  
  const admin = createClient(url, key, { auth: { persistSession: false } });

  const isNameMatch = (inputName: string, actualName: string) => {
    const norm1 = normalizeName(inputName);
    const norm2 = normalizeName(actualName);
    if (!norm1 || !norm2) return false;
    if (norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)) return true;
    const parts1 = norm1.split(" ").filter(Boolean);
    const parts2 = norm2.split(" ").filter(Boolean);
    return parts1.some((p) => parts2.includes(p));
  };

  const known = ACTUAL_TRAINEES[employee_id.toLowerCase()];

  let member: any = null;
  try {
    const { data: rows } = await admin
      .from("members")
      .select("id,user_id,full_name,employee_id,role,status")
      .ilike("employee_id", employee_id)
      .limit(2);
    member = (rows ?? []).find((r: any) => r.role === "trainee");
  } catch { /* graceful fallback */ }

  if (!member && known) {
    if (!isNameMatch(employee_name, known.name)) {
      return { ok: false, code: "name_mismatch" };
    }
    member = {
      id: `m-seed-${employee_id.toLowerCase()}`,
      user_id: null,
      full_name: known.name,
      email: known.email,
      status: "active",
      role: "trainee",
      title: `${known.dept} Trainee`,
      employee_id: employee_id.toUpperCase(),
    };
  }

  if (!member) return { ok: false, code: "not_found" };
  if (!isNameMatch(employee_name, member.full_name)) {
    return { ok: false, code: "name_mismatch" };
  }

  return {
    ok: true,
    access_token: `trainee_access_token_${Date.now()}`,
    refresh_token: `trainee_refresh_token_${Date.now()}`,
    member: {
      id: member.id,
      user_id: member.user_id || null,
      full_name: member.full_name,
      email: member.email || internalEmail(employee_id),
      role: "trainee",
      title: member.title || `${employee_id.toUpperCase()} Trainee`,
    },
  };
}
