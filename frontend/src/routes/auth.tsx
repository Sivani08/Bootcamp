import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth, type Role, type MemberRow } from "@/lib/auth";
import { traineeLogin } from "@/lib/trainee-auth.functions";
import { Activity, UserCheck, Shield } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — BootMind Learning Intelligence" },
      { name: "description", content: "Sign in to BootMind to manage bootcamps, mentor trainees and track learning intelligence." },
      { property: "og:title", content: "Sign in — BootMind" },
      { title: "Sign in — BootMind Learning Intelligence" },
      { name: "description", content: "Sign in to BootMind to manage bootcamps, mentor trainees and track learning intelligence." },
      { property: "og:title", content: "Sign in — BootMind" },
      { property: "og:description", content: "Turning Learner Progress into Meaningful Insights" },
    ],
  }),
  component: AuthPage,
});

type StaffRole = Exclude<Role, "trainee">;

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const PRESET_STAFF_MEMBERS = [
  { id: "m-akash", full_name: "Akash Ganesan", email: "akash.bm@agilisium.com", trainees: "Kethireddy Sivani" },
  { id: "m-shirish", full_name: "Shirish Tirumalaik kumaara Dev", email: "shirish.bm@agilisium.com", trainees: "Sandrakala, Sivakumar" },
  { id: "m-prabhu", full_name: "Prabhu senthilkumar", email: "prabhu.bm@agilisium.com", trainees: "Lakshan, Bhuvana" },
  { id: "m-kesavan", full_name: "Kesavan Munusamy", email: "kesavan.bm@agilisium.com", trainees: "Sandhiya sri, Priyatharshini" },
  { id: "m-narendra", full_name: "Narendra Varma Keerthipati", email: "narendra.bm@agilisium.com", trainees: "Janarthanan, Ananya sree" },
  { id: "m-prathvi", full_name: "Prathvi Nacckeeran", email: "prathvi.bm@agilisium.com", trainees: "Jeevanantham, Lingesh" },
  { id: "m-sivasrika", full_name: "Sivasrika Ponnusamy", email: "sivasrika.bm@agilisium.com", trainees: "Nithish, Yavvna Lakshmi" },
  { id: "m-jareshiah", full_name: "JareshiahSamuel Solomon", email: "jareshiah.bm@agilisium.com", trainees: "Ajay, Jagan, Bhanu" },
  { id: "m-geethalakshmi", full_name: "Geethalakshmi Baskar", email: "geethalakshmi.bm@agilisium.com", trainees: "Lakshmi, Karthick Saravanan" },
  { id: "m-maniselvam", full_name: "Maniselvam Velmurugan", email: "maniselvam.bm@agilisium.com", trainees: "JeyaKrishnan, Monalessa" },
  { id: "m-aakash-k", full_name: "Aakash Karthikeyan", email: "aakash.bm@agilisium.com", trainees: "Aruna Krithija, Akansha" },
  { id: "m-vishnupriya", full_name: "Vishnupriya Kandhasamy", email: "vishnupriya.bm@agilisium.com", trainees: "Karthik Thiyagarajan, Jayashree" },
  { id: "m-nischint", full_name: "Nischint Venkatesh", email: "nischint.bm@agilisium.com", trainees: "Srinithi" },
  { id: "m-farwesh", full_name: "Farwesh Kalesha", email: "farwesh.bm@agilisium.com", trainees: "Sanjay" },
  { id: "m-daniel", full_name: "Daniel Raj Kirubanandhan", email: "daniel.bm@agilisium.com", trainees: "Shiva Prashanth" },
];

function AuthPage() {
  const router = useRouter();
  const { session, member, signInWithTokens } = useAuth();
  const [tab, setTab] = useState<"trainee" | "staff">("trainee");

  useEffect(() => {
    if (session && member) void router.navigate({ to: "/dashboard" });
  }, [session, member, router]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-10 lg:flex">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="BootMind Logo" className="size-10 object-contain" />
          <span className="text-base font-bold text-sidebar-accent-foreground">BootMind</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight text-sidebar-accent-foreground leading-tight">
            Turning Learner Progress into Meaningful Insights.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground">
            Dedicated workspace sign in for Admins, Mentors, Buddies and Trainees — courses, tasks, assessments, meetups and feedback notes.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/70">Enterprise bootcamp operations, measured end to end.</p>
      </div>

      <div className="flex flex-col items-center justify-center p-6">
        <div className="panel w-full max-w-md p-6">
          <div className="mb-5 lg:hidden">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="BootMind Logo" className="size-10 object-contain" />
              <span className="text-base font-bold">BootMind</span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight leading-tight">
              Turning Learner Progress into Meaningful Insights.
            </h1>
          </div>
          <div role="tablist" aria-label="Sign in type" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {(["trainee", "staff"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`h-9 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "trainee" ? "Trainee" : "Staff (Admin/Mentor/Buddy)"}
              </button>
            ))}
          </div>

          {tab === "trainee" ? (
            <TraineeForm onSession={signInWithTokens} onDone={() => router.navigate({ to: "/dashboard" })} />
          ) : (
            <StaffForm onDone={() => router.navigate({ to: "/dashboard" })} />
          )}
        </div>
      </div>
    </div>
  );
}

function TraineeForm({
  onSession,
  onDone,
}: {
  onSession: (t: { access_token: string; refresh_token: string }, m?: any) => Promise<void>;
  onDone: () => void;
}) {
  const login = traineeLogin;
  const [employeeId, setEmployeeId] = useState("CI258");
  const [employeeName, setEmployeeName] = useState("Kethireddy Sivani");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await login({ data: { employee_id: employeeId, employee_name: employeeName } });
      if (!res.ok) {
        const messages = {
          not_found: "We couldn't find that Employee ID. Please check with your trainer.",
          name_mismatch: "The employee name doesn't match that Employee ID.",
          inactive: "This trainee account is inactive. Please contact your trainer.",
          session_failed: "Sign in failed. Please try again in a moment.",
        } as const;
        toast.error(messages[res.code]);
        return;
      }
      await onSession({ access_token: res.access_token, refresh_token: res.refresh_token }, res.member);
      onDone();
    } catch (err) {
      console.error("[TraineeForm] login failed", err);
      toast.error("Sign in failed. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5">
      <h2 className="text-xl font-bold">Trainee sign in</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use the Employee ID and full name registered by your trainer. No password needed.
      </p>

      <div className="mt-5 space-y-3">
        <label className="block text-sm font-medium">
          Employee ID
          <input
            required
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g. CI258"
            autoComplete="username"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Employee name
          <input
            required
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g. Kethireddy Sivani"
            className={inputClass}
          />
        </label>
      </div>

      <button
        disabled={busy}
        className="mt-5 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? "Please wait…" : "Sign in to Trainee Workspace"}
      </button>
    </form>
  );
}

function StaffForm({ onDone }: { onDone: () => void }) {
  const { signInWithTokens, refresh } = useAuth();
  const [role, setRole] = useState<StaffRole>("mentor");
  const [selectedPresetId, setSelectedPresetId] = useState("m-akash");
  const [fullName, setFullName] = useState("Akash Ganesan");
  const [email, setEmail] = useState("akash.bm@agilisium.com");
  const [password, setPassword] = useState("123456");
  const [busy, setBusy] = useState(false);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === "admin") {
      setRole("admin");
      setFullName("Monisha");
      setEmail("monisha@gmail.com");
      return;
    }
    const found = PRESET_STAFF_MEMBERS.find((p) => p.id === presetId);
    if (found) {
      setFullName(found.full_name);
      setEmail(found.email);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let cleanName = fullName.trim();
      let cleanEmail = email.trim();

      if (!cleanName || !cleanEmail || !password) {
        toast.error("Please fill in your Full Name, Work Email, and Password.");
        setBusy(false);
        return;
      }

      let foundPreset = PRESET_STAFF_MEMBERS.find(
        (p) =>
          p.id === selectedPresetId ||
          p.email.toLowerCase() === cleanEmail.toLowerCase() ||
          p.full_name.toLowerCase().includes(cleanName.toLowerCase()) ||
          cleanName.toLowerCase().includes(p.full_name.toLowerCase())
      );

      let targetId = role === "admin" ? "a0000000-0000-4000-a000-000000000001" : foundPreset ? foundPreset.id : `m-${role}-${cleanEmail.toLowerCase().replace(/[^a-z0-9]/gi, "-")}`;
      let targetTitle = role === "admin" ? "Program Director & Admin" : "Mentor & Buddy Lead";

      const staffMember: MemberRow = {
        id: targetId,
        user_id: `u-${role}-${Date.now()}`,
        full_name: foundPreset ? foundPreset.full_name : cleanName,
        email: foundPreset ? foundPreset.email : cleanEmail,
        role,
        title: targetTitle,
      };

      await signInWithTokens({ access_token: `${role}_token_${Date.now()}`, refresh_token: `${role}_ref_token` }, staffMember);
      toast.success(`Signed in as ${staffMember.full_name} (${role.toUpperCase()} Workspace)`);
      await refresh();
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5">
      <h2 className="text-xl font-bold">Staff workspace sign in</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Select your Mentor / Buddy account to view assigned trainee data.
      </p>

      <fieldset className="mt-4 grid gap-2 sm:grid-cols-3">
        <legend className="sr-only">Role</legend>
        {[
          { value: "admin", label: "Admin", blurb: "All Cohort Trainees" },
          { value: "mentor", label: "Mentor", blurb: "Assigned Trainees Only" },
          { value: "buddy", label: "Buddy", blurb: "Assigned Trainees Only" },
        ].map((r) => (
          <button
            type="button"
            key={r.value}
            onClick={() => {
              setRole(r.value as StaffRole);
              if (r.value === "admin") {
                handleSelectPreset("admin");
              }
            }}
            aria-pressed={role === r.value}
            className={`rounded-lg border p-2.5 text-left text-xs transition-colors ${role === r.value ? "border-primary bg-accent font-bold" : "border-border hover:bg-muted"}`}
          >
            <span className="block font-bold">{r.label}</span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">{r.blurb}</span>
          </button>
        ))}
      </fieldset>

      {/* Quick Select Mentor/Buddy Dropdown */}
      {role !== "admin" && (
        <div className="mt-4 space-y-1.5">
          <label className="block text-xs font-bold text-foreground">
            Select Mentor / Buddy Account
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
          >
            {PRESET_STAFF_MEMBERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.trainees})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground italic">
            Assigned Trainees: <strong>{PRESET_STAFF_MEMBERS.find((p) => p.id === selectedPresetId)?.trainees}</strong>
          </p>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <label className="block text-sm font-medium">
          Full Name
          <input
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Work Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            required
            minLength={4}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </label>
      </div>

      <button
        disabled={busy}
        className="mt-5 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? "Please wait…" : `Sign in to ${role.toUpperCase()} Workspace`}
      </button>
    </form>
  );
}
