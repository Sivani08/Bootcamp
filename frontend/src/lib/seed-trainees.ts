import type { Member, Trainee, Domain, Batch, TaskSubmission } from "./data";

export const INITIAL_27_TRAINEES_DATA = [
  { employee_id: "CI254", full_name: "AnanyaSree Sridharan", email: "AnanyaSree.Sridharan@agilisium.com", domain_code: "DCG", domain_name: "Domain Consulting Group" },
  { employee_id: "CI250", full_name: "ArakatavemulaLakshmi Kullayamma", email: "ArakatavemulaLakshmi.Kullayamma@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI267", full_name: "Aruna Kiruthija", email: "Aruna.Kiruthija@aglisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI255", full_name: "Jagan Saravanan", email: "Jagan.Saravanan@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI263", full_name: "Janarthanan Karuppusamy", email: "Janarthanan.Karuppasamy@agilisium.com", domain_code: "DCG", domain_name: "Domain Consulting Group" },
  { employee_id: "CI261", full_name: "Jayashree Sankar", email: "Jayashree.Sankar@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI269", full_name: "Jeevanantham Balamurugan", email: "jeevananthambalamurugan@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI264", full_name: "Jeyakrishnan Rajendran", email: "Jeyakrishnan.Rajendran@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI257", full_name: "Karthick Saravanan", email: "Karthick.Saravanan@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI268", full_name: "Karthik Thiyagarajan", email: "karthik.thiyagarajan@agilisium.com", domain_code: "DCG", domain_name: "Domain Consulting Group" },
  { employee_id: "CI258", full_name: "Kethireddy Sivani", email: "Kethireddy.Sivani@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI271", full_name: "Lakshan VijayaSekar", email: "Lakshan.VijayaSekar@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "11701", full_name: "Lingesh Thirumalai", email: "Lingesh.Thirumalai@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI252", full_name: "MittapalliBhanu Vardhanreddy", email: "MittapalliBhanu.Vardhanreddy@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI259", full_name: "Monaleesaa Karthikeyan", email: "Monaleesaa.Karthikeyan@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI253", full_name: "Nandimandalam Akanksha Sree", email: "NandimandalamAkanksha.Sree@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI265", full_name: "Nithish Balaji", email: "Nithish.Balaji@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI251", full_name: "PentelaAjay Kumar", email: "PentelaAjay.Kumar@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI270", full_name: "Priyatharshini kannan", email: "Priyatharshini.kannan@aglisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI278", full_name: "SANJAY", email: "sanjay@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI256", full_name: "SandhiyaSri Dhandapani", email: "SandhiyaSri.Dhandapani@agilisium.com", domain_code: "CT", domain_name: "Cognitive Tech" },
  { employee_id: "CI266", full_name: "Shandrakala Nagendran", email: "Shandrakala.Nagendran@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI260", full_name: "Sivakumar NandaKumar", email: "Sivakumar.NandaKumar@agilisium.com", domain_code: "DCG", domain_name: "Domain Consulting Group" },
  { employee_id: "CI262", full_name: "Srinithi Santhoshkumar", email: "Srinithi.Santhoshkumar@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI272", full_name: "Bhuvana", email: "bhuvana@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI273", full_name: "Shiva Prashanth", email: "shivaprashanth@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
  { employee_id: "CI274", full_name: "Yavvna Lakshmi", email: "yavvnalakshmi@agilisium.com", domain_code: "DE", domain_name: "Data Engineering" },
];

export function ensureInitialTrainees(
  fetchedMembers: Member[],
  fetchedTrainees: Trainee[],
  fetchedDomains: Domain[],
  fetchedBatches: Batch[],
): { members: Member[]; trainees: Trainee[]; domains: Domain[]; batches: Batch[] } {
  // Ensure Batch 12 exists with id "b12"
  const batchMap = new Map<string, Batch>();
  (fetchedBatches || []).forEach((b) => b && b.id && batchMap.set(b.id, b));

  const batch12Id = "b12";
  if (!batchMap.has(batch12Id) && !Array.from(batchMap.values()).some((b) => (b?.name || "").toLowerCase().includes("12"))) {
    batchMap.set(batch12Id, { id: batch12Id, bootcamp_id: "bc1", name: "Batch 12" });
  }

  const activeBatchId = Array.from(batchMap.values()).find((b) => (b?.name || "").toLowerCase().includes("12"))?.id || batch12Id;

  // Ensure 3 explicit domains exist with exact names & IDs
  const domainMap = new Map<string, Domain>();
  (fetchedDomains || []).forEach((d) => d && d.id && domainMap.set(d.id, d));

  const deDomainId = "d-de";
  const ctDomainId = "d-ct";
  const dcgDomainId = "d-dcg";

  if (!domainMap.has(deDomainId)) {
    domainMap.set(deDomainId, { id: deDomainId, batch_id: activeBatchId, name: "Data Engineering", color: "#10b981" });
  }
  if (!domainMap.has(ctDomainId)) {
    domainMap.set(ctDomainId, { id: ctDomainId, batch_id: activeBatchId, name: "Cognitive Tech", color: "#3b82f6" });
  }
  if (!domainMap.has(dcgDomainId)) {
    domainMap.set(dcgDomainId, { id: dcgDomainId, batch_id: activeBatchId, name: "Domain Consulting Group", color: "#a855f7" });
  }

  // Also map existing domain IDs if matching by name
  for (const d of fetchedDomains || []) {
    if (!d || !d.name) continue;
    const lower = d.name.toLowerCase();
    if (lower.includes("consulting") || lower.includes("dcg") || lower.includes("clinical research")) {
      domainMap.set(dcgDomainId, { ...d, name: "Domain Consulting Group" });
    } else if (lower.includes("cognitive") || lower.includes("ct")) {
      domainMap.set(ctDomainId, { ...d, name: "Cognitive Tech" });
    } else if (lower.includes("data engineering") || lower.includes("de")) {
      domainMap.set(deDomainId, { ...d, name: "Data Engineering" });
    }
  }

  const memberMap = new Map<string, Member>();
  fetchedMembers.forEach((m) => memberMap.set(m.id, m));

  // Explicit Mentors and Buddies from User Excel Data
  const EXCEL_MENTOR_BUDDY_MEMBERS: Member[] = [
    { id: "m-shirish", user_id: "u-shirish", full_name: "Shirish Tirumalaik kumaara Dev", email: "shirish.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-prabhu", user_id: "u-prabhu", full_name: "Prabhu senthilkumar", email: "prabhu.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-kesavan", user_id: "u-kesavan", full_name: "Kesavan Munusamy", email: "kesavan.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-akash", user_id: "u-akash", full_name: "Akash Ganesan", email: "akash.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-de-mentor", user_id: "u-de-mentor", full_name: "Akash Ganesan", email: "akash.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-narendra", user_id: "u-narendra", full_name: "Narendra Varma Keerthipati", email: "narendra.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-prathvi", user_id: "u-prathvi", full_name: "Prathvi Nacckeeran", email: "prathvi.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-sivasrika", user_id: "u-sivasrika", full_name: "Sivasrika Ponnusamy", email: "sivasrika.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-jareshiah", user_id: "u-jareshiah", full_name: "JareshiahSamuel Solomon", email: "jareshiah.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-geethalakshmi", user_id: "u-geethalakshmi", full_name: "Geethalakshmi Baskar", email: "geethalakshmi.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-maniselvam", user_id: "u-maniselvam", full_name: "Maniselvam Velmurugan", email: "maniselvam.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-aakash-k", user_id: "u-aakash-k", full_name: "Aakash Karthikeyan", email: "aakash.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-vishnupriya", user_id: "u-vishnupriya", full_name: "Vishnupriya Kandhasamy", email: "vishnupriya.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-nischint", user_id: "u-nischint", full_name: "Nischint Venkatesh", email: "nischint.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-farwesh", user_id: "u-farwesh", full_name: "Farwesh Kalesha", email: "farwesh.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
    { id: "m-daniel", user_id: "u-daniel", full_name: "Daniel Raj Kirubanandhan", email: "daniel.bm@agilisium.com", role: "mentor", title: "Mentor & Buddy Lead" },
  ];

  const adminMember: Member = {
    id: "a0000000-0000-4000-a000-000000000001",
    user_id: "a0000000-0000-4000-a000-000000000002",
    full_name: "Monisha",
    email: "monisha@gmail.com",
    role: "admin",
    title: "Program Director & Admin",
  };

  [adminMember, ...EXCEL_MENTOR_BUDDY_MEMBERS].forEach((m) => {
    if (!memberMap.has(m.id)) memberMap.set(m.id, m);
  });

  // Exact employee_id to Mentor & Buddy mapping based strictly on user Excel sheet
  const MENTOR_BY_EMPLOYEE_ID: Record<string, string> = {
    "CI254": "m-narendra",     // AnanyaSree Sridharan -> Narendra Varma Keerthipati
    "CI250": "m-geethalakshmi", // ArakatavemulaLakshmi Kullayamma -> Geethalakshmi Baskar
    "CI267": "m-aakash-k",      // Aruna Kiruthija -> Aakash Karthikeyan
    "CI255": "m-jareshiah",     // Jagan Saravanan -> JareshiahSamuel Solomon
    "CI263": "m-narendra",     // Janarthanan Karuppusamy -> Narendra Varma Keerthipati
    "CI261": "m-vishnupriya",   // Jayashree Sankar -> Vishnupriya Kandhasamy
    "CI269": "m-prathvi",      // Jeevanantham Balamurugan -> Prathvi Nacckeeran
    "CI264": "m-maniselvam",    // Jeyakrishnan Rajendran -> Maniselvam Velmurugan
    "CI257": "m-geethalakshmi", // Karthick Saravanan -> Geethalakshmi Baskar
    "CI268": "m-vishnupriya",   // Karthik Thiyagarajan -> Vishnupriya Kandhasamy
    "CI258": "m-akash",         // Kethireddy Sivani -> Akash Ganesan
    "CI271": "m-prabhu",        // Lakshan VijayaSekar -> Prabhu senthilkumar
    "11701": "m-prathvi",       // Lingesh Thirumalai -> Prathvi Nacckeeran
    "CI252": "m-jareshiah",     // MittapalliBhanu Vardhanreddy -> JareshiahSamuel Solomon
    "CI259": "m-maniselvam",    // Monaleesaa Karthikeyan -> Maniselvam Velmurugan
    "CI253": "m-aakash-k",      // Nandimandalam Akanksha Sree -> Aakash Karthikeyan
    "CI265": "m-sivasrika",     // Nithish Balaji -> Sivasrika Ponnusamy
    "CI251": "m-jareshiah",     // PentelaAjay Kumar -> JareshiahSamuel Solomon
    "CI270": "m-kesavan",       // Priyatharshini kannan -> Kesavan Munusamy
    "CI278": "m-farwesh",       // SANJAY -> Farwesh Kalesha
    "CI256": "m-kesavan",       // SandhiyaSri Dhandapani -> Kesavan Munusamy
    "CI266": "m-shirish",       // Shandrakala Nagendran -> Shirish Tirumalaik kumaara Dev
    "CI260": "m-shirish",       // Sivakumar NandaKumar -> Shirish Tirumalaik kumaara Dev
    "CI262": "m-nischint",      // Srinithi Santhoshkumar -> Nischint Venkatesh
    "CI272": "m-prabhu",        // Bhuvana -> Prabhu senthilkumar
    "CI273": "m-daniel",        // Shiva Prashanth -> Daniel Raj Kirubanandhan
    "CI274": "m-sivasrika",     // Yavvna Lakshmi -> Sivasrika Ponnusamy
  };

  const getMentorIdForTrainee = (empId: string, fullName: string): string => {
    if (MENTOR_BY_EMPLOYEE_ID[empId]) return MENTOR_BY_EMPLOYEE_ID[empId];
    const lower = fullName.toLowerCase();
    if (lower.includes("sandrakala") || lower.includes("sivakumar")) return "m-shirish";
    if (lower.includes("lakshan") || lower.includes("bhuvana")) return "m-prabhu";
    if (lower.includes("sandhiya") || lower.includes("priyatharshini")) return "m-kesavan";
    if (lower.includes("kethireddy") || lower.includes("sivani")) return "m-akash";
    if (lower.includes("janarthanan") || lower.includes("ananya")) return "m-narendra";
    if (lower.includes("jeevanantham") || lower.includes("lingesh")) return "m-prathvi";
    if (lower.includes("yavvna") || lower.includes("nithish")) return "m-sivasrika";
    if (lower.includes("ajay") || lower.includes("jagan")) return "m-jareshiah";
    if (lower.includes("karthick saravanan") || lower.includes("arakatavemula")) return "m-geethalakshmi";
    if (lower.includes("jeyakrishnan") || lower.includes("monaleesaa") || lower.includes("monalessa")) return "m-maniselvam";
    if (lower.includes("aruna") || lower.includes("akanksha") || lower.includes("akansha")) return "m-aakash-k";
    if (lower.includes("thiyagarajan") || lower.includes("jayashree")) return "m-vishnupriya";
    if (lower.includes("srinithi")) return "m-nischint";
    if (lower.includes("sanjay")) return "m-farwesh";
    if (lower.includes("shiva prashanth")) return "m-daniel";
    return "m-akash";
  };

  const traineeMap = new Map<string, Trainee>();
  fetchedTrainees.forEach((t) => traineeMap.set(t.id, t));

  INITIAL_27_TRAINEES_DATA.forEach((item, idx) => {
    const existingMember = (fetchedMembers || []).find(
      (m) =>
        m &&
        ((m as any).employee_id?.toLowerCase() === item.employee_id.toLowerCase() ||
          (m.email || "").toLowerCase() === item.email.toLowerCase()),
    );

    let memberId = existingMember?.id;
    if (!existingMember) {
      memberId = `m-seed-${item.employee_id.toLowerCase()}`;
      const seededMember: Member = {
        id: memberId,
        user_id: null,
        full_name: item.full_name,
        email: item.email,
        role: "trainee",
        title: `${item.domain_code} Trainee`,
        employee_id: item.employee_id,
        status: "active",
      } as any;
      memberMap.set(memberId, seededMember);
    } else {
      memberMap.set(existingMember.id, {
        ...existingMember,
        employee_id: (existingMember as any).employee_id || item.employee_id,
        title: `${item.domain_code} Trainee`,
      } as any);
    }

    let targetDomainId = deDomainId;
    if (item.domain_code === "CT") targetDomainId = ctDomainId;
    else if (item.domain_code === "DCG") targetDomainId = dcgDomainId;

    const assignedMentorId = getMentorIdForTrainee(item.employee_id, item.full_name);
    const assignedBuddyId = assignedMentorId; // Exact mentor & buddy pair

    const existingTrainee = fetchedTrainees.find((t) => t.member_id === memberId);

    if (!existingTrainee) {
      const traineeId = `t-seed-${item.employee_id.toLowerCase()}`;
      const seededTrainee: Trainee = {
        id: traineeId,
        member_id: memberId!,
        batch_id: activeBatchId,
        domain_id: targetDomainId,
        mentor_member_id: assignedMentorId,
        buddy_member_id: assignedBuddyId,
        learning_hours: 30 + (idx % 10),
        streak_days: 20 + (idx % 10),
        longest_streak: 25 + (idx % 10),
        last_active_at: new Date(Date.now() - idx * 3600000).toISOString(),
      };
      traineeMap.set(traineeId, seededTrainee);
    } else {
      traineeMap.set(existingTrainee.id, {
        ...existingTrainee,
        batch_id: activeBatchId,
        domain_id: targetDomainId,
        mentor_member_id: assignedMentorId,
        buddy_member_id: assignedBuddyId,
      });
    }
  });

  const SEED_COURSES: Course[] = [
    { id: "c-de-1", domain_id: deDomainId, title: "PySpark Data Engineering Pipeline & Architecture", description: "End-to-end data processing, Spark transformations, optimization and data lake integration. Udemy Link: https://agilisium.udemy.com/course/pyspark-data-engineering", order_index: 1, estimated_hours: 12 },
    { id: "c-de-2", domain_id: deDomainId, title: "Advanced SQL & Cloud Data Warehousing", description: "Complex joins, window functions, query optimization and snowflake warehousing architecture. Udemy Link: https://agilisium.udemy.com/course/advanced-sql-cloud", order_index: 2, estimated_hours: 10 },
    { id: "c-ct-1", domain_id: ctDomainId, title: "Cognitive Tech & Generative AI Systems", description: "AI/ML fundamentals, cognitive search, prompt engineering and LLM application design. Udemy Link: https://agilisium.udemy.com/course/cognitive-tech-ai", order_index: 1, estimated_hours: 12 },
    { id: "c-ct-2", domain_id: ctDomainId, title: "Python for AI/ML Frameworks & Automation", description: "Data science libraries, PyTorch basics, model evaluation and automated pipelines. Udemy Link: https://agilisium.udemy.com/course/python-ai-ml", order_index: 2, estimated_hours: 10 },
    { id: "c-dcg-1", domain_id: dcgDomainId, title: "Enterprise Domain Consulting & Analytics", description: "Business analysis, domain intelligence, stakeholder management and reporting dashboards. Udemy Link: https://agilisium.udemy.com/course/domain-consulting-analytics", order_index: 1, estimated_hours: 12 },
    { id: "c-dcg-2", domain_id: dcgDomainId, title: "Healthcare & Clinical Data Intelligence", description: "Clinical trial analytics, healthcare data standards (FHIR, HL7) and regulatory compliance. Udemy Link: https://agilisium.udemy.com/course/healthcare-clinical-data", order_index: 2, estimated_hours: 10 },
  ];

  return {
    members: Array.from(memberMap.values()),
    trainees: Array.from(traineeMap.values()),
    domains: Array.from(domainMap.values()),
    batches: Array.from(batchMap.values()),
    seedCourses: SEED_COURSES,
  };
}

export const SEED_MODULES: Module[] = [
  { id: "mod-de-1-1", course_id: "c-de-1", title: "Module 1: Introduction to PySpark & RDD Fundamentals", order_index: 1, duration_hours: 3 },
  { id: "mod-de-1-2", course_id: "c-de-1", title: "Module 2: DataFrame Transformations & Spark SQL Optimization", order_index: 2, duration_hours: 4 },
  { id: "mod-de-1-3", course_id: "c-de-1", title: "Module 3: Data Lake Integration & Delta Lake Storage", order_index: 3, duration_hours: 5 },
  { id: "mod-de-2-1", course_id: "c-de-2", title: "Module 1: Window Functions, CTEs & Complex Querying", order_index: 1, duration_hours: 3 },
  { id: "mod-de-2-2", course_id: "c-de-2", title: "Module 2: Query Performance Tuning & Indexing Strategies", order_index: 2, duration_hours: 3 },
  { id: "mod-de-2-3", course_id: "c-de-2", title: "Module 3: Snowflake Architecture & Cloud Data Pipelines", order_index: 3, duration_hours: 4 },
  { id: "mod-ct-1-1", course_id: "c-ct-1", title: "Module 1: Foundation of LLMs & Generative AI Systems", order_index: 1, duration_hours: 3 },
  { id: "mod-ct-1-2", course_id: "c-ct-1", title: "Module 2: Prompt Engineering, RAG & Vector Databases", order_index: 2, duration_hours: 4 },
  { id: "mod-ct-1-3", course_id: "c-ct-1", title: "Module 3: Agentic Workflows & Multi-Agent Frameworks", order_index: 3, duration_hours: 5 },
  { id: "mod-ct-2-1", course_id: "c-ct-2", title: "Module 1: NumPy, Pandas & Data Manipulation", order_index: 1, duration_hours: 3 },
  { id: "mod-ct-2-2", course_id: "c-ct-2", title: "Module 2: PyTorch & Scikit-Learn Model Training", order_index: 2, duration_hours: 3 },
  { id: "mod-ct-2-3", course_id: "c-ct-2", title: "Module 3: Model Evaluation, MLOps & Deployment", order_index: 3, duration_hours: 4 },
  { id: "mod-dcg-1-1", course_id: "c-dcg-1", title: "Module 1: Business Requirements & Domain Consulting", order_index: 1, duration_hours: 3 },
  { id: "mod-dcg-1-2", course_id: "c-dcg-1", title: "Module 2: Stakeholder Communication & Agile Delivery", order_index: 2, duration_hours: 4 },
  { id: "mod-dcg-1-3", course_id: "c-dcg-1", title: "Module 3: Executive Reporting & BI Dashboarding", order_index: 3, duration_hours: 5 },
  { id: "mod-dcg-2-1", course_id: "c-dcg-2", title: "Module 1: Healthcare Data Standards (FHIR, HL7, HIPAA)", order_index: 1, duration_hours: 3 },
  { id: "mod-dcg-2-2", course_id: "c-dcg-2", title: "Module 2: Clinical Trial Data Analytics & Efficacy Tracking", order_index: 2, duration_hours: 3 },
  { id: "mod-dcg-2-3", course_id: "c-dcg-2", title: "Module 3: Regulatory Compliance & Life Sciences Insights", order_index: 3, duration_hours: 4 },
];

export const INITIAL_SAMPLE_QUIZZES: Quiz[] = [
  { id: "q-1", title: "PySpark & Data Pipelines Assessment Quiz", topic: "Data Engineering", domain_id: "d-de", duration_min: 20, passing_score: 70 },
  { id: "q-2", title: "SQL & Relational Databases Fundamentals", topic: "SQL", domain_id: "d-de", duration_min: 15, passing_score: 75 },
  { id: "q-3", title: "Generative AI & LLM Architecture Quiz", topic: "Cognitive Tech", domain_id: "d-ct", duration_min: 20, passing_score: 70 },
  { id: "q-4", title: "Domain Consulting & Business Analytics Quiz", topic: "Consulting", domain_id: "d-dcg", duration_min: 15, passing_score: 75 },
];

export const INITIAL_SAMPLE_QUESTIONS: QuizQuestion[] = [
  { id: "qq-1-1", quiz_id: "q-1", prompt: "Which PySpark DataFrame method is used to eliminate duplicate rows based on specific columns?", options: ["dropDuplicates()", "distinct()", "remove_duplicates()", "filter_unique()"], correct_index: 0, marks: 10, order_index: 1 },
  { id: "qq-1-2", quiz_id: "q-1", prompt: "What is the primary benefit of Broadcast Join in Apache Spark?", options: ["It avoids large data shuffles over the network", "It increases memory usage on workers", "It converts DataFrames into RDDs", "It writes data directly to HDFS"], correct_index: 0, marks: 10, order_index: 2 },
  { id: "qq-2-1", quiz_id: "q-2", prompt: "Which SQL clause is used with aggregate functions to filter groups?", options: ["HAVING", "WHERE", "GROUP BY", "ORDER BY"], correct_index: 0, marks: 10, order_index: 1 },
  { id: "qq-2-2", quiz_id: "q-2", prompt: "What window function ranks rows without gaps in ranking values?", options: ["DENSE_RANK()", "RANK()", "ROW_NUMBER()", "NTILE()"], correct_index: 0, marks: 10, order_index: 2 },
  { id: "qq-3-1", quiz_id: "q-3", prompt: "What component in a RAG system stores vector embeddings of documents?", options: ["Vector Database", "Relational DB", "Redis Cache", "HDFS Cluster"], correct_index: 0, marks: 10, order_index: 1 },
  { id: "qq-3-2", quiz_id: "q-3", prompt: "Which technique adjusts model outputs without retraining weights?", options: ["Prompt Engineering", "Fine-tuning", "Pre-training", "Quantization"], correct_index: 0, marks: 10, order_index: 2 },
  { id: "qq-4-1", quiz_id: "q-4", prompt: "In healthcare analytics, what does FHIR stand for?", options: ["Fast Healthcare Interoperability Resources", "Federal Health Information Repository", "Financial Health Insurance Records", "Fundamental Health Integration Resource"], correct_index: 0, marks: 10, order_index: 1 },
];

export const INITIAL_SAMPLE_PROBLEMS: CodingProblem[] = [
  {
    id: "prob-1",
    title: "Reverse a String in Python",
    difficulty: "easy",
    topic: "Python",
    prompt: "Write code to print the reverse of the input string 'Agilisium'.",
    starter_code: "text = 'Agilisium'\nprint(text[::-1])",
    expected_output: "muisiligA",
    domain_id: "d-de",
  },
  {
    id: "prob-2",
    title: "Find Maximum Element in List",
    difficulty: "easy",
    topic: "Python",
    prompt: "Write code to find and print the maximum number in [12, 45, 78, 23, 89, 34].",
    starter_code: "numbers = [12, 45, 78, 23, 89, 34]\nprint(max(numbers))",
    expected_output: "89",
    domain_id: "d-de",
  },
  {
    id: "prob-3",
    title: "Word Frequency Counter",
    difficulty: "medium",
    topic: "Cognitive Tech",
    prompt: "Count and print the number of occurrences of the word 'data' in 'data engineering and data science'.",
    starter_code: "sentence = 'data engineering and data science'\nprint(sentence.split().count('data'))",
    expected_output: "2",
    domain_id: "d-ct",
  },
];

export const COMMON_14_DAYS_ASSESSMENTS: Task[] = [
  {
    id: "task-day-1",
    title: "Day 1: SQL LeetCode Assessment (7 Problems)",
    description: `Complete the following 7 SQL LeetCode problems:

1. Combine Two Tables: https://leetcode.com/problems/combine-two-tables/description/
2. Employee Bonus: https://leetcode.com/problems/employee-bonus/description/
3. Find Customer Referee: https://leetcode.com/problems/find-customer-referee/description/
4. Big Countries: https://leetcode.com/problems/big-countries/description/
5. Exchange Seats: https://leetcode.com/problems/exchange-seats/description/
6. Students and Examinations: https://leetcode.com/problems/students-and-examinations/description/
7. Group Sold Products By The Date: https://leetcode.com/problems/group-sold-products-by-the-date/description/`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 1).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-2",
    title: "Day 2: SQL LeetCode Assessment (3 Problems)",
    description: `Complete the following 3 SQL LeetCode problems:

1. The Latest Login in 2020: https://leetcode.com/problems/the-latest-login-in-2020/description/
2. Top Travellers: https://leetcode.com/problems/top-travellers/description/
3. Find Products with Valid Serial Numbers: https://leetcode.com/problems/find-products-with-valid-serial-numbers/description/`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-3",
    title: "Day 3: Top SQL 50 Assessment (7 Problems)",
    description: `Complete the following 7 Top SQL 50 LeetCode problems:

1. Recyclable and Low Fat Products: https://leetcode.com/problems/recyclable-and-low-fat-products/?envType=study-plan-v2&envId=top-sql-50
2. Article Views I: https://leetcode.com/problems/article-views-i/?envType=study-plan-v2&envId=top-sql-50
3. Replace Employee ID With The Unique Identifier: https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/?envType=study-plan-v2&envId=top-sql-50
4. Product Sales Analysis I: https://leetcode.com/problems/product-sales-analysis-i/?envType=study-plan-v2&envId=top-sql-50
5. Rising Temperature: https://leetcode.com/problems/rising-temperature/?envType=study-plan-v2&envId=top-sql-50
6. Average Selling Price: https://leetcode.com/problems/average-selling-price/?envType=study-plan-v2&envId=top-sql-50
7. Find Followers Count: https://leetcode.com/problems/find-followers-count/?envType=study-plan-v2&envId=top-sql-50`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-4",
    title: "Day 4: Advanced SQL Queries Assessment (3 Problems)",
    description: `Complete the following 3 Advanced SQL LeetCode problems:

1. Find Loyal Customers: https://leetcode.com/problems/find-loyal-customers/description/
2. Find Product Recommendation Pairs: https://leetcode.com/problems/find-product-recommendation-pairs/description/
3. Odd and Even Transactions: https://leetcode.com/problems/odd-and-even-transactions/description/`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-5",
    title: "Day 5: SQL & Python Essentials Assessment (5 Problems)",
    description: `Complete the following 5 SQL & Python problems:

1. Department Highest Salary: https://leetcode.com/problems/department-highest-salary/solutions/6626988/conquer-sql-top-earners-reveal-the-highe-wsd8/
2. Managers with at Least 5 Direct Reports: https://leetcode.com/problems/managers-with-at-least-5-direct-reports/description/
3. Product Price at a Given Date: https://leetcode.com/problems/product-price-at-a-given-date/description/?envType=study-plan-v2&envId=top-sql-50
4. Python If-Else: https://www.hackerrank.com/challenges/py-if-else/problem?isFullScreen=true
5. Python Loops: https://www.hackerrank.com/challenges/python-loops/problem?isFullScreen=true`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-6",
    title: "Day 6: Python & Algorithmic Logic Assessment (2 Problems)",
    description: `Complete the following 2 HackerRank Python problems:

1. Print Prime Numbers: https://www.hackerrank.com/challenges/print-prime-numbers/submissions
2. Find a string: https://www.hackerrank.com/challenges/find-a-string/problem?isFullScreen=true`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 6).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-7",
    title: "Day 7: SQL & Data Structures Assessment (5 Problems)",
    description: `Complete the following 5 SQL & Data Structures problems:

1. Binary Tree Nodes: https://www.hackerrank.com/challenges/binary-search-tree-1/problem
2. Symmetric Pairs: https://www.hackerrank.com/challenges/symmetric-pairs/problem
3. Find the Runner-Up Score!: https://www.hackerrank.com/challenges/find-second-maximum-number-in-a-list/problem?isFullScreen=true
4. Investments in 2016: https://leetcode.com/problems/investments-in-2016/description/
5. Text Wrap: https://www.hackerrank.com/challenges/text-wrap/problem?isFullScreen=true`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-8",
    title: "Day 8: Analytics & Python Lists Assessment (5 Problems)",
    description: `Complete the following 5 Analytics & Python problems:

1. Game Play Analysis IV: https://leetcode.com/problems/game-play-analysis-iv/description/
2. Department Top Three Salaries: https://leetcode.com/problems/department-top-three-salaries/description/
3. Consecutive Numbers: https://leetcode.com/problems/consecutive-numbers/description/
4. List Comprehensions: https://www.hackerrank.com/challenges/list-comprehensions/problem?isFullScreen=true
5. Finding the percentage: https://www.hackerrank.com/challenges/finding-the-percentage/problem?isFullScreen=true`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 8).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-9",
    title: "Day 9: Advanced Relational SQL Assessment (2 Problems)",
    description: `Complete the following 2 HackerRank SQL problems:

1. Occupations: https://www.hackerrank.com/challenges/occupations/problem?isFullScreen=true
2. The Report: https://www.hackerrank.com/challenges/the-report/problem?isFullScreen=true`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 9).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-10",
    title: "Day 10: Python & SQL Analytical Challenges (6 Problems)",
    description: `Complete the following 6 Python & SQL problems:

1. Palindrome Number: https://leetcode.com/problems/palindrome-number/description/?language=Python
2. Two Sum: https://leetcode.com/problems/two-sum/description/?language=Python
3. Top Competitors: https://www.hackerrank.com/challenges/full-score/problem?isFullScreen=true
4. Weather Observation Station 18: https://www.hackerrank.com/challenges/weather-observation-station-18/problem?isFullScreen=true
5. Weather Observation Station 20: https://www.hackerrank.com/challenges/weather-observation-station-20/problem?isFullScreen=true
6. Placements: https://www.hackerrank.com/challenges/placements/problem?isFullScreen=true`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 10).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-11",
    title: "Day 11: Python String & Data Manipulation Assessment (5 Problems)",
    description: `Complete the following 5 LeetCode Python problems:

1. Sales Person: https://leetcode.com/problems/sales-person/?language=Python
2. Find Users With High Token Usage: https://leetcode.com/problems/find-users-with-high-token-usage/submissions/2074473519/?language=Python
3. Valid Palindrome: https://leetcode.com/problems/valid-palindrome/?language=Python
4. Valid Anagram: https://leetcode.com/problems/valid-anagram/submissions/2074476987/?language=Python
5. Reverse Bits: https://leetcode.com/problems/reverse-bits/?language=Python`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 11).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-12",
    title: "Day 12: Advanced String & Aggregation Assessment (5 Problems)",
    description: `Complete the following 5 LeetCode Python & SQL problems:

1. Roman to Integer: https://leetcode.com/problems/roman-to-integer/submissions/2075663201/?language=Python
2. Remove Element: https://leetcode.com/problems/remove-element/submissions/2075692973/?language=Python
3. Reverse Vowels of a String: https://leetcode.com/problems/reverse-vowels-of-a-string/?language=Python
4. Confirmation Rate: https://leetcode.com/problems/confirmation-rate/submissions/2075699032/?language=Python
5. Monthly Transactions I: https://leetcode.com/problems/monthly-transactions-i/submissions/2075828778/?language=Python`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 12).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-13",
    title: "Day 13: Algorithmic & Market Analysis Assessment (5 Problems)",
    description: `Complete the following 5 LeetCode problems:

1. Count and Say: https://leetcode.com/problems/count-and-say/description/
2. Permutations: https://leetcode.com/problems/permutations/description/
3. Remove Duplicates from Sorted List: https://leetcode.com/problems/remove-duplicates-from-sorted-list/description/
4. Market Analysis I: https://leetcode.com/problems/market-analysis-i/description/
5. Find Product Recommendation Pairs: https://leetcode.com/problems/find-product-recommendation-pairs/description/`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 13).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-day-14",
    title: "Day 14: Final Analytics & Logic Assessment (3 Problems)",
    description: `Complete the following 3 LeetCode problems:

1. Product Sales Analysis III: https://leetcode.com/problems/product-sales-analysis-iii/description/
2. Analyze Subscription Conversion: https://leetcode.com/problems/analyze-subscription-conversion/description/
3. Fizz Buzz: https://leetcode.com/problems/fizz-buzz/description/`,
    kind: "assessment",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 14).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-sql-employee-mgmt",
    title: "Task 1: Employee Management System (Beginner)",
    description: `Objective: Design a simple Employee Management Database for a company.

Concepts Covered:
• CREATE DATABASE, CREATE TABLE, INSERT, SELECT, WHERE, ORDER BY, UPDATE, DELETE
• String Functions & Aggregate Functions

Table Schema (Employee):
• EmployeeID: INT
• FirstName: VARCHAR
• LastName: VARCHAR
• Department: VARCHAR (HR, IT, Finance, Marketing, Sales)
• Salary: DECIMAL
• JoiningDate: DATE
• City: VARCHAR

Requirements:
Part 1: Create Database & Employee Table
Part 2: Insert 25 Employee Records across HR, IT, Finance, Marketing, Sales
Part 3: Perform CRUD Operations:
  - Find all employees
  - Find employees from IT
  - Find employees earning above 60,000
  - Update salary
  - Delete resigned employee
Part 4: Use String Functions:
  - Full Name (Concat)
  - Uppercase department
  - Lowercase city
  - Length of employee name
  - First three letters of department
Part 5: Aggregate Functions:
  - Total employees
  - Highest salary
  - Lowest salary
  - Average salary
  - Total salary department-wise

Expected Outcome: DDL/DML mastery, CRUD, filtering, string manipulation, and aggregations.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "file",
    due_at: new Date(Date.now() + 86400000 * 15).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-sql-online-retail",
    title: "Task 2: Online Retail Store Database (Intermediate)",
    description: `Objective: Build a multi-table database for an online shopping application.

Relationships: Customer -> Orders -> OrderDetails -> Products

Concepts Covered:
• Primary Key, Foreign Key Constraints
• Joins (INNER, LEFT) & Subqueries
• GROUP BY, HAVING Clause & Database Views

Tables & Schema:
• Customers: CustomerID, CustomerName, Email, City (Insert 20 customers)
• Products: ProductID, ProductName, Category, Price (Insert 30 products)
• Orders: OrderID, CustomerID, OrderDate (Insert 50 orders)
• OrderDetails: OrderID, ProductID, Quantity

Requirements & Queries:
Part 1: Table Creation with Primary & Foreign Keys
Part 2: Insert Data (20 customers, 30 products, 50 orders, order details)
Part 3: Joins:
  - Customer with purchased products
  - Total amount per customer
  - Product purchased by each customer
Part 4: GROUP BY:
  - Sales by category
  - Orders by city
  - Customer count by city
Part 5: HAVING:
  - Departments/categories with sales greater than ₹50,000
Part 6: Subqueries:
  - Most expensive product
  - Customers who purchased the most expensive product
  - Customers who placed more than average orders
Part 7: Views:
  - Create Customer_Order_Summary (Customer Name, Total Orders, Total Amount)

Expected Outcome: Relational database design, FK relationships, Joins, Grouping, HAVING filters, Subqueries, and Views.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "file",
    due_at: new Date(Date.now() + 86400000 * 16).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-sql-banking-system",
    title: "Task 3: Banking Transaction System (Advanced Fresher)",
    description: `Objective: Develop a Banking Database supporting transactions, stored procedures, functions, triggers, and auditing.

Concepts Covered:
• Transactions (BEGIN, COMMIT, ROLLBACK)
• Stored Procedures & User Defined Functions
• Triggers & Transaction Auditing
• Database Views & Large Dataset Reporting

Database Structure & Schema:
• Customers: CustomerID, CustomerName, Phone (Insert 100 customers)
• Accounts: AccountID, CustomerID, Balance (Insert 200 accounts)
• Transactions: TransactionID, AccountID, Amount, TransactionType, TransactionDate (Insert 1000 transactions)
• TransactionAudit: AuditID, TransactionID, Action, ActionDate

Requirements:
Part 1: Data Insertion (100 customers, 200 accounts, 1000 transactions)
Part 2: Transactions:
  - Transfer ₹10,000 from Account A to Account B using BEGIN / COMMIT.
  - Rollback if sender balance becomes negative.
Part 3: Stored Procedure:
  - Create DepositMoney(AccountID, Amount) procedure to update balance & insert transaction record.
Part 4: User Defined Function:
  - Create GetAccountBalance(AccountID) function returning current balance.
Part 5: Trigger:
  - Automatically insert an audit record into TransactionAudit whenever a transaction is inserted.
Part 6: Views:
  - Create CustomerAccountSummary view (Customer Name, Account Number, Current Balance, Total Transactions).
Part 7: Large Data Reporting Queries:
  - Top 10 customers by balance
  - Top 10 accounts with maximum transactions
  - Daily transaction amount
  - Monthly deposits & Monthly withdrawals

Expected Outcome: Enterprise SQL mastery in ACID transactions, SPs, UDFs, Triggers, Views, and large dataset analytics.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "file",
    due_at: new Date(Date.now() + 86400000 * 17).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-python-practical-programming-task1",
    title: "Task 4: Python Task 1 - Practical Programming (14072026_python.zip)",
    description: `Objective: Complete Python Task 1 Practical Programming, Data Structures, OOP, and Data Analysis challenges.

Download Problem Resource Archive:
• File Archive: 14072026_python.zip
• Download Link: https://msvlforagileiss-my.sharepoint.com/:u:/g/personal/monisha_ramasamy_agilisium_com/IQDDC9YZNBlpRrlNcg7bzZw7AWeMpnUdDU74UB8KUUJ0eng?e=L6zfnR

Concepts Covered:
• Python Data Types & Control Flow
• Functions, Modules, and Lambdas
• Object-Oriented Programming (OOP Classes & Inheritance)
• File Handling & JSON Processing
• Data Manipulation & Analysis

Requirements:
Part 1: Unzip 14072026_python.zip and solve all module script exercises.
Part 2: Implement Python classes for data management and exception handling.
Part 3: Process dataset files and generate analytical summary metrics.
Part 4: Upload your completed Python repository or solution zip to SharePoint.

Expected Outcome: Practical mastery in Python programming, file processing, OOP design, and dataset manipulation.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "file",
    due_at: new Date(Date.now() + 86400000 * 18).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-python-exercise-task2",
    title: "Task 5: Python Task 2 - Exercise Module 2 (Python exercise 15072026.rtf)",
    description: `Objective: Complete Python Task 2 hands-on programming problems from Python exercise 15072026.rtf.

Download Exercise Specification Document:
• Document File: Python exercise 15072026.rtf
• Document Link: https://msvlforagileiss-my.sharepoint.com/:w:/g/personal/monisha_ramasamy_agilisium_com/IQAK8mVR0O9bSqINhJUXPOYFAboh4NUhz4rZn-nRBFZwmGU?e=lsfr4h

Concepts Covered:
• Python Data Structures & Collections
• List & Dictionary Comprehensions
• String Manipulation & Pattern Matching
• Function Logic & Scoping

Requirements:
Part 1: Open Python exercise 15072026.rtf and navigate to Task 2 section.
Part 2: Solve all Task 2 exercises using Python data structures and list comprehensions.
Part 3: Format code according to PEP 8 standards with function documentation.
Part 4: Upload your completed Python solutions (.py) to your SharePoint repository.

Expected Outcome: Intermediate mastery in Python data structures, list comprehensions, and functional programming.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "file",
    due_at: new Date(Date.now() + 86400000 * 19).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-python-exercise-task3",
    title: "Task 6: Python Task 3 - Exercise Module 3 (Python exercise 15072026.rtf)",
    description: `Objective: Complete Python Task 3 hands-on programming problems from Python exercise 15072026.rtf.

Download Exercise Specification Document:
• Document File: Python exercise 15072026.rtf
• Document Link: https://msvlforagileiss-my.sharepoint.com/:w:/g/personal/monisha_ramasamy_agilisium_com/IQAK8mVR0O9bSqINhJUXPOYFAboh4NUhz4rZn-nRBFZwmGU?e=lsfr4h

Concepts Covered:
• Object-Oriented Programming (OOP) Classes & Inheritance
• File Handling & Input/Output Streams
• Exception Handling & Custom Validation
• Comprehensive Data Processing Scripts

Requirements:
Part 1: Open Python exercise 15072026.rtf and navigate to Task 3 section.
Part 2: Implement OOP class hierarchies, file stream handlers, and custom exception classes.
Part 3: Write automated test cases or sample execution scripts to verify functionality.
Part 4: Upload your completed Python solutions (.py) to your SharePoint repository.

Expected Outcome: Advanced mastery in Python Object-Oriented Programming, File I/O, exception handling, and modular script development.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: null,
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "file",
    due_at: new Date(Date.now() + 86400000 * 20).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-pyspark-big-data",
    title: "Task 7: PySpark Big Data Processing Task (PYSPARK (1).txt)",
    description: `Objective: Complete PySpark DataFrame transformations, RDD operations, Spark SQL queries, and distributed big data pipeline assignments.

Assigned Target Domains:
• Data Engineering (DE)
• Domain Consulting Group (DCG)
• (Excluded for Cognitive Tech - CT)

Download Task Specification:
• File: PYSPARK (1).txt
• Link: https://msvlforagileiss-my.sharepoint.com/:t:/g/personal/monisha_ramasamy_agilisium_com/IQDA48ecIvMgSrpQMzehKo4lAZ7yPq6FovBsm_qWZZKr3UA?e=s12vBa

Concepts Covered:
• PySpark SparkSession & DataFrame API
• Distributed Transformations (filter, select, groupBy, agg, join)
• Spark SQL Queries & Temporary Views
• Data Ingestion (CSV, Parquet, JSON) & Output Serialization
• Window Functions & Large Scale Data Aggregations

Requirements:
Part 1: Download PYSPARK (1).txt and set up local PySpark / Databricks environment.
Part 2: Implement DataFrame transformations, joins, and aggregations as specified.
Part 3: Run Spark SQL queries on registered temporary views.
Part 4: Save PySpark scripts (.py or .ipynb) and upload repository link to SharePoint.

Expected Outcome: Proficiency in PySpark distributed data processing, Spark SQL, and enterprise big data pipelines.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: "d-de,d-dcg",
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "file",
    due_at: new Date(Date.now() + 86400000 * 21).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-python-fastapi-ct",
    title: "Task 8: FastAPI Backend & Web API Task (Python_FastAPI_Task.txt)",
    description: `Objective: Develop RESTful Web APIs, Pydantic data schemas, asynchronous endpoint handlers, and Swagger API documentation using FastAPI.

Assigned Target Domain:
• Cognitive Tech (CT ONLY)
• (Excluded for Data Engineering - DE & Domain Consulting Group - DCG)

Download Task Specification:
• File: Python_FastAPI_Task.txt
• Link: https://msvlforagileiss-my.sharepoint.com/:t:/g/personal/monisha_ramasamy_agilisium_com/IQABOGiCyZUcRpoqAPurNSH5AYDlXfL6A2uszBGnem7rc6g?e=QVE81N

Concepts Covered:
• FastAPI Framework & Uvicorn ASGI Server
• Path Parameters, Query Parameters & Request Bodies
• Pydantic Models & Data Validation
• Async / Await Endpoints & Middleware
• OpenAPI / Swagger Automated Interactive API Documentation

Requirements:
Part 1: Download Python_FastAPI_Task.txt and configure your FastAPI virtual environment.
Part 2: Implement RESTful CRUD endpoints for resources using Pydantic request models.
Part 3: Add error handling using HTTPException and status code response models.
Part 4: Test endpoints via Swagger UI (/docs) and upload your code repository to SharePoint.

Expected Outcome: Enterprise mastery in Python FastAPI asynchronous microservices, REST APIs, and automated OpenAPI documentation.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: "d-ct",
    batch_id: "b12",
    trainee_id: null,
    priority: "high",
    submission_type: "file",
    due_at: new Date(Date.now() + 86400000 * 22).toISOString(),
    created_by_member_id: "admin-member",
  },
  {
    id: "task-priyatharshini-buddy-connect",
    title: "🤝 Buddy Connect Repository — Priyatharshini kannan",
    description: `Buddy Connect meeting repository and session logs for Priyatharshini kannan.

SharePoint Buddy Connect Folder:
• Folder Link: https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAmjtYFgIvXSZtx2_IxExjrAbU__bDdPpvZXOAFi1BZUlY?e=5Zs0Dc

Objectives:
• 1-on-1 Buddy Guidance & Mentorship Syncs
• Code reviews, technical doubt resolution & weekly feedback scorecards.`,
    kind: "task",
    course_id: null,
    module_id: null,
    domain_id: "d-ct",
    batch_id: "b12",
    trainee_id: "t-seed-ci270",
    priority: "high",
    submission_type: "url",
    due_at: new Date(Date.now() + 86400000 * 25).toISOString(),
    created_by_member_id: "admin-member",
  },
];

export const SHAREPOINT_ASSESSMENT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgCjoWQOR_DHSY--m8s2IlyyASLcEunxma4U7rgry_Los8w?e=Yity72";

export const MONALISA_TRAINEE_ID = "t-seed-ci259";

export const MONALISA_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-monalisa-${task.id}`,
  task_id: task.id,
  trainee_id: MONALISA_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${SHAREPOINT_ASSESSMENT_LINK}`,
    file: {
      name: `Monaleesaa_Karthikeyan_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: SHAREPOINT_ASSESSMENT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const SANDHIYA_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgC4Q9HRKSPHTbA0Mw8DDxgJATaEwMMSoV8u2w1JolwCaGw?e=Bf0WpW";

export const SANDHIYA_TRAINEE_ID = "t-seed-ci256";

export const SANDHIYA_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-sandhiya-${task.id}`,
  task_id: task.id,
  trainee_id: SANDHIYA_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${SANDHIYA_SHAREPOINT_LINK}`,
    file: {
      name: `SandhiyaSri_Dhandapani_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: SANDHIYA_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const SRINITHI_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgBRckZaPovRRZViBvCppcXIAcH2dwoeAc4CwGMiCCsqGvM?e=fTUwiq";

export const SRINITHI_TRAINEE_ID = "t-seed-ci262";

export const SRINITHI_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-srinithi-${task.id}`,
  task_id: task.id,
  trainee_id: SRINITHI_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${SRINITHI_SHAREPOINT_LINK}`,
    file: {
      name: `Srinithi_Santhoshkumar_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: SRINITHI_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const ANANYA_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAgjU-FNQHwTIxfAWFYUmT6AYcV1ZhZHX3Ip5nrZpzITOk?e=GGa7ve";

export const ANANYA_TRAINEE_ID = "t-seed-ci254";

export const ANANYA_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-ananya-${task.id}`,
  task_id: task.id,
  trainee_id: ANANYA_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${ANANYA_SHAREPOINT_LINK}`,
    file: {
      name: `AnanyaSree_Sridharan_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: ANANYA_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const JAYASHREE_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgCa7lNUBc6tTpOFrNor4aWbAX3r-XazkGluX1pJVIKytVc?e=KDvlck";

export const JAYASHREE_TRAINEE_ID = "t-seed-ci261";

export const JAYASHREE_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-jayashree-${task.id}`,
  task_id: task.id,
  trainee_id: JAYASHREE_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${JAYASHREE_SHAREPOINT_LINK}`,
    file: {
      name: `Jayashree_Sankar_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: JAYASHREE_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const PRIYATHARSHINI_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDBYMmtl7ijQ4Q-81Rp953dAVDqr9KF___o1olklqSP_f8?e=3Xc1Ku";
export const PRIYATHARSHINI_BUDDY_CONNECT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAmjtYFgIvXSZtx2_IxExjrAbU__bDdPpvZXOAFi1BZUlY?e=5Zs0Dc";

export const PRIYATHARSHINI_TRAINEE_ID = "t-seed-ci270";

export const PRIYATHARSHINI_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = [
  ...COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
    id: `sub-priyatharshini-${task.id}`,
    task_id: task.id,
    trainee_id: PRIYATHARSHINI_TRAINEE_ID,
    status: "submitted",
    content: JSON.stringify({
      text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${PRIYATHARSHINI_SHAREPOINT_LINK} | Buddy Connect: ${PRIYATHARSHINI_BUDDY_CONNECT_LINK}`,
      file: {
        name: `Priyatharshini_kannan_Day_${idx + 1}_Assessment_SharePoint.url`,
        url: PRIYATHARSHINI_SHAREPOINT_LINK,
        size: 4096,
      },
    }),
    score: 100,
    submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
    updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  })),
  {
    id: "sub-priyatharshini-buddy-connect",
    task_id: "task-priyatharshini-buddy-connect",
    trainee_id: PRIYATHARSHINI_TRAINEE_ID,
    status: "submitted",
    content: JSON.stringify({
      text: `Buddy Connect session notes and materials uploaded to SharePoint: ${PRIYATHARSHINI_BUDDY_CONNECT_LINK}`,
      file: {
        name: "Priyatharshini_kannan_Buddy_Connect_SharePoint.url",
        url: PRIYATHARSHINI_BUDDY_CONNECT_LINK,
        size: 4096,
      },
    }),
    score: 100,
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const BHUVANA_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgBzMvnxN_6STrgxFNeL2ApiAdon4Wdz_e-zempQNaXBKjs?e=jtiDq1";

export const BHUVANA_TRAINEE_ID = "t-seed-ci272";

export const BHUVANA_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-bhuvana-${task.id}`,
  task_id: task.id,
  trainee_id: BHUVANA_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${BHUVANA_SHAREPOINT_LINK}`,
    file: {
      name: `Bhuvana_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: BHUVANA_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const LINGESH_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDMwsd6F0ADS74-xTh9wUBJASqih8oowynjbO2GVXdY9Lo?e=QWcJGa";

export const LINGESH_TRAINEE_ID = "t-seed-11701";

export const LINGESH_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-lingesh-${task.id}`,
  task_id: task.id,
  trainee_id: LINGESH_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${LINGESH_SHAREPOINT_LINK}`,
    file: {
      name: `Lingesh_Thirumalai_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: LINGESH_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const LAKSHAN_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAgApIy22k5Q42EU0ffdw3MARCsEfHG-U2yyOWZ0xhG5xM?e=dx4dKL";

export const LAKSHAN_TRAINEE_ID = "t-seed-ci271";

export const LAKSHAN_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-lakshan-${task.id}`,
  task_id: task.id,
  trainee_id: LAKSHAN_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${LAKSHAN_SHAREPOINT_LINK}`,
    file: {
      name: `Lakshan_VijayaSekar_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: LAKSHAN_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const YAVVNA_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDzLU9yCjYlTpgw8uekX-MBAQHEb0eiJujBX21Lu-H0w1Y?e=NlvRBN";

export const YAVVNA_TRAINEE_ID = "t-seed-ci274";

export const YAVVNA_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-yavvna-${task.id}`,
  task_id: task.id,
  trainee_id: YAVVNA_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${YAVVNA_SHAREPOINT_LINK}`,
    file: {
      name: `Yavvna_Lakshmi_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: YAVVNA_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const ARUNA_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgCKm1A9fMv9S7PEJSpSQx-5AdccbfLYHqCTuBJ3iPSIr-c?e=Ah3bPp";

export const ARUNA_TRAINEE_ID = "t-seed-ci267";

export const ARUNA_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-aruna-${task.id}`,
  task_id: task.id,
  trainee_id: ARUNA_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${ARUNA_SHAREPOINT_LINK}`,
    file: {
      name: `Aruna_Kiruthija_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: ARUNA_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const SHANDRAKALA_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAF77kHWjZKS5cVW8R-oD0sAZFYzLR7z-Hf21u7T1DZTKc?e=Db5YnQ";

export const SHANDRAKALA_TRAINEE_ID = "t-seed-ci266";

export const SHANDRAKALA_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-shandrakala-${task.id}`,
  task_id: task.id,
  trainee_id: SHANDRAKALA_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${SHANDRAKALA_SHAREPOINT_LINK}`,
    file: {
      name: `Shandrakala_Nagendran_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: SHANDRAKALA_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const JAGAN_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAaT_psNpznT6juLF3n1FajAUnhgZAiEFGvkzTZWxlzWIw?e=zjh4xf";

export const JAGAN_TRAINEE_ID = "t-seed-ci255";

export const JAGAN_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-jagan-${task.id}`,
  task_id: task.id,
  trainee_id: JAGAN_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${JAGAN_SHAREPOINT_LINK}`,
    file: {
      name: `Jagan_Saravanan_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: JAGAN_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const JEYAKRISHNAN_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDZu8LwX3mERoSXimXqeXq5AaEYB9vZ6fsnUWg9JPHAxbQ?e=ejpsLh";

export const JEYAKRISHNAN_TRAINEE_ID = "t-seed-ci264";

export const JEYAKRISHNAN_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-jeyakrishnan-${task.id}`,
  task_id: task.id,
  trainee_id: JEYAKRISHNAN_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${JEYAKRISHNAN_SHAREPOINT_LINK}`,
    file: {
      name: `Jeyakrishnan_Rajendran_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: JEYAKRISHNAN_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const SIVAKUMAR_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDGqktcGFUdQaLZrvD4SnGcAUzOkY8ZD7q9oO8vp5CwKCY?e=cBolXR";

export const SIVAKUMAR_TRAINEE_ID = "t-seed-ci260";

export const SIVAKUMAR_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-sivakumar-${task.id}`,
  task_id: task.id,
  trainee_id: SIVAKUMAR_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${SIVAKUMAR_SHAREPOINT_LINK}`,
    file: {
      name: `Sivakumar_NandaKumar_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: SIVAKUMAR_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const KARTHICK_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgBcXGo35tNXRaTT1iQoThinAUQkHxm88V46HpD2k5HPKX4?e=Fen8aj";

export const KARTHICK_TRAINEE_ID = "t-seed-ci257";

export const KARTHICK_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-karthick-${task.id}`,
  task_id: task.id,
  trainee_id: KARTHICK_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${KARTHICK_SHAREPOINT_LINK}`,
    file: {
      name: `Karthick_Saravanan_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: KARTHICK_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const KARTHIK_THIYAGARAJAN_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDivOWiFYOiT4rjV9HPuIMbASQI5eOMXQlx2KwxYBhfLXU?e=Q64Jro";

export const KARTHIK_THIYAGARAJAN_TRAINEE_ID = "t-seed-ci268";

export const KARTHIK_THIYAGARAJAN_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-karthik-thiyagarajan-${task.id}`,
  task_id: task.id,
  trainee_id: KARTHIK_THIYAGARAJAN_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${KARTHIK_THIYAGARAJAN_SHAREPOINT_LINK}`,
    file: {
      name: `Karthik_Thiyagarajan_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: KARTHIK_THIYAGARAJAN_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const NITHISH_BALAJI_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgBE8T0DZAruSJw7DtS0VklgAWdiAV667td1VLBkDOKvTjA?e=KJHaSf";

export const NITHISH_BALAJI_TRAINEE_ID = "t-seed-ci265";

export const NITHISH_BALAJI_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-nithish-balaji-${task.id}`,
  task_id: task.id,
  trainee_id: NITHISH_BALAJI_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${NITHISH_BALAJI_SHAREPOINT_LINK}`,
    file: {
      name: `Nithish_Balaji_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: NITHISH_BALAJI_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const LAKSHMI_KULLAYAMMA_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDDEiGBPr66QpLFtr8D9Ag3AU6SIIeZaWCejF4sJfapDYU?e=6dHcWz";

export const LAKSHMI_KULLAYAMMA_TRAINEE_ID = "t-seed-ci250";

export const LAKSHMI_KULLAYAMMA_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-lakshmi-kullayamma-${task.id}`,
  task_id: task.id,
  trainee_id: LAKSHMI_KULLAYAMMA_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${LAKSHMI_KULLAYAMMA_SHAREPOINT_LINK}`,
    file: {
      name: `ArakatavemulaLakshmi_Kullayamma_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: LAKSHMI_KULLAYAMMA_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const AKANKSHA_SREE_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgD7IFBe75w2RZhmLvsKveHjAUS3zuFJWuvcSFZ42ngAR9Q?e=g3sKZu";

export const AKANKSHA_SREE_TRAINEE_ID = "t-seed-ci253";

export const AKANKSHA_SREE_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-akanksha-sree-${task.id}`,
  task_id: task.id,
  trainee_id: AKANKSHA_SREE_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${AKANKSHA_SREE_SHAREPOINT_LINK}`,
    file: {
      name: `Nandimandalam_Akanksha_Sree_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: AKANKSHA_SREE_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const AJAY_KUMAR_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDzPfCD74Z4TqAaIbR6P4r3AcSEdybUoo2xNfVSdkUmzpQ?e=wODqrn";

export const AJAY_KUMAR_TRAINEE_ID = "t-seed-ci251";

export const AJAY_KUMAR_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-ajay-kumar-${task.id}`,
  task_id: task.id,
  trainee_id: AJAY_KUMAR_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${AJAY_KUMAR_SHAREPOINT_LINK}`,
    file: {
      name: `PentelaAjay_Kumar_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: AJAY_KUMAR_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const BHANU_VARDHANREDDY_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAZK8MPMq_7QrrJ0M-uHeusAT1t7_ITBWgyIF-KmRuyPFA?e=kpa2bd";

export const BHANU_VARDHANREDDY_TRAINEE_ID = "t-seed-ci252";

export const BHANU_VARDHANREDDY_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-bhanu-vardhanreddy-${task.id}`,
  task_id: task.id,
  trainee_id: BHANU_VARDHANREDDY_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${BHANU_VARDHANREDDY_SHAREPOINT_LINK}`,
    file: {
      name: `MittapalliBhanu_Vardhanreddy_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: BHANU_VARDHANREDDY_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const SANJAY_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDgbK0PHHNHSpevXrhPaVP2Ac76eWpqo_si3PCd_A9H9xk?e=uOcAeO";

export const SANJAY_TRAINEE_ID = "t-seed-ci278";

export const SANJAY_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-sanjay-${task.id}`,
  task_id: task.id,
  trainee_id: SANJAY_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${SANJAY_SHAREPOINT_LINK}`,
    file: {
      name: `Sanjay_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: SANJAY_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const JANARTHANAN_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAXTdi80d9tR4IC33rjSGnAAVnmZiRezJwfy8t0-dOsPu0?e=KcIzBa";

export const JANARTHANAN_TRAINEE_ID = "t-seed-ci263";

export const JANARTHANAN_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-janarthanan-${task.id}`,
  task_id: task.id,
  trainee_id: JANARTHANAN_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${JANARTHANAN_SHAREPOINT_LINK}`,
    file: {
      name: `Janarthanan_Karuppusamy_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: JANARTHANAN_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const SHIVA_PRASHANTH_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgDQF41hP4MZSZ-OY-zLTspyAYNFt8uP-wJjmT_Lg_GnCUA?e=KwK3kW";

export const SHIVA_PRASHANTH_TRAINEE_ID = "t-seed-ci273";

export const SHIVA_PRASHANTH_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-shiva-prashanth-${task.id}`,
  task_id: task.id,
  trainee_id: SHIVA_PRASHANTH_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${SHIVA_PRASHANTH_SHAREPOINT_LINK}`,
    file: {
      name: `Shiva_Prashanth_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: SHIVA_PRASHANTH_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const JEEVANANTHAM_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgB1XvhGb7maToxlWDzPH_RbAY7vjj5pvGCJb05JVY1-70A?e=iRs4OM";

export const JEEVANANTHAM_TRAINEE_ID = "t-seed-ci269";

export const JEEVANANTHAM_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-jeevanantham-${task.id}`,
  task_id: task.id,
  trainee_id: JEEVANANTHAM_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${JEEVANANTHAM_SHAREPOINT_LINK}`,
    file: {
      name: `Jeevanantham_Balamurugan_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: JEEVANANTHAM_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const SIVANI_SHAREPOINT_LINK = "https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgB1XvhGb7maToxlWDzPH_RbAY7vjj5pvGCJb05JVY1-70A?e=iRs4OM";

export const SIVANI_TRAINEE_ID = "t-seed-ci258";

export const SIVANI_ASSESSMENT_SUBMISSIONS: TaskSubmission[] = COMMON_14_DAYS_ASSESSMENTS.map((task, idx) => ({
  id: `sub-sivani-${task.id}`,
  task_id: task.id,
  trainee_id: SIVANI_TRAINEE_ID,
  status: "submitted",
  content: JSON.stringify({
    text: `Completed Assessment Day ${idx + 1} submission uploaded to SharePoint repository: ${SIVANI_SHAREPOINT_LINK}`,
    file: {
      name: `Kethireddy_Sivani_Day_${idx + 1}_Assessment_SharePoint.url`,
      url: SIVANI_SHAREPOINT_LINK,
      size: 4096,
    },
  }),
  score: 100,
  submitted_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
  updated_at: new Date(Date.now() - (14 - idx) * 86400000).toISOString(),
}));

export const PRIYATHARSHINI_BUDDY_REPORT_LINK = "https://msvlforagileiss.sharepoint.com/:w:/s/75_Days_Bootcamp_Batch_12/IQAA8Zb6Aj_-R6bOH-RRWzrBAejLT5mqYCLdssSnW6elht8?e=csxlGC";

export const INITIAL_SAMPLE_MEETINGS = [
  {
    id: "meeting-priyatharshini-buddy-1",
    trainee_id: "t-seed-ci270",
    with_member_id: "m-kesavan",
    kind: "buddy" as const,
    requested_for: new Date(Date.now() - 86400000).toISOString(),
    reason: "🤝 Buddy Connect & Session Report Sync",
    message: "Buddy Connect Report: https://msvlforagileiss.sharepoint.com/:w:/s/75_Days_Bootcamp_Batch_12/IQAA8Zb6Aj_-R6bOH-RRWzrBAejLT5mqYCLdssSnW6elht8?e=csxlGC | Buddy Connect Folder: https://msvlforagileiss.sharepoint.com/:f:/s/75_Days_Bootcamp_Batch_12/IgAmjtYFgIvXSZtx2_IxExjrAbU__bDdPpvZXOAFi1BZUlY?e=5Zs0Dc",
    response_note: "Buddy connect report reviewed & approved. Document: https://msvlforagileiss.sharepoint.com/:w:/s/75_Days_Bootcamp_Batch_12/IQAA8Zb6Aj_-R6bOH-RRWzrBAejLT5mqYCLdssSnW6elht8?e=csxlGC",
    status: "completed",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "meeting-priyatharshini-mentor-1",
    trainee_id: "t-seed-ci270",
    with_member_id: "m-kesavan",
    kind: "mentor" as const,
    requested_for: new Date(Date.now() - 172800000).toISOString(),
    reason: "1-on-1 Mentor Connect & Code Review",
    message: "1-on-1 mentor session covering Cognitive Tech & Python assignments.",
    response_note: "Completed technical review & code feedback.",
    status: "completed",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];
