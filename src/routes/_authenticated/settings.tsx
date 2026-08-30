import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, Mail } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth, type Role } from "@/lib/auth";
import { useActions } from "@/lib/actions";
import { DataImport } from "@/components/data-import";
import { Initials, Kpi, PageHeader, Panel, SkeletonPage, EmptyState } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [
    { title: "Team & Settings — BootMind" },
    { name: "description", content: "Invite mentors and buddies, manage your profile and review team access in BootMind." },
    { property: "og:title", content: "Team & Settings — BootMind" },
    { property: "og:description", content: "Invite mentors and buddies, manage your profile and review team access in BootMind." },
  ] }),
  component: Page,
});

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { member, role } = useAuth();
  const { db, run } = useActions();
  const [invite, setInvite] = useState({ full_name: "", email: "", role: "mentor" as Role, title: "" });

  if (isLoading || !ws) return <SkeletonPage />;

  const team = ws.members.filter((m) => m.role !== "trainee");

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run("Invite created", () =>
      db.from("members").insert({
        full_name: invite.full_name, email: invite.email.toLowerCase().trim(), role: invite.role,
        title: invite.title || (invite.role === "mentor" ? "Mentor" : "Buddy"),
      }),
    );
    if (ok) setInvite({ full_name: "", email: "", role: "mentor", title: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "admin" ? "Team & settings" : "Settings & Profile"}
        subtitle={role === "admin" ? "Invite mentors and buddies, and manage team access." : "Manage your profile details and account preferences."}
      />

      {role === "admin" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="Team members" value={team.length} />
            <Kpi label="Mentors" value={team.filter((m) => m.role === "mentor").length} />
            <Kpi label="Pending invites" value={team.filter((m) => !m.user_id).length} tone="warning" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
            <Panel title="Invite a mentor or buddy" description="They sign up with this exact email and their seat is claimed automatically.">
              <form onSubmit={sendInvite} className="space-y-3">
                <label className="block text-sm font-medium">Full name
                  <input required value={invite.full_name} onChange={(e) => setInvite({ ...invite, full_name: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                </label>
                <label className="block text-sm font-medium">Work email
                  <input required type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                </label>
                <label className="block text-sm font-medium">Role
                  <select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as Role })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="mentor">Mentor</option><option value="buddy">Buddy</option><option value="admin">Admin</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">Title
                  <input value={invite.title} onChange={(e) => setInvite({ ...invite, title: e.target.value })} placeholder="Senior Data Engineer" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                </label>
                <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  <UserPlus className="size-4" /> Create invite
                </button>
              </form>
            </Panel>

            <Panel title="Team">
              {team.length === 0 ? (
                <EmptyState title="No team members yet" />
              ) : (
                <ul className="space-y-2">
                  {team.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                      <span className="flex items-center gap-3">
                        <Initials name={m.full_name} className="size-9" />
                        <span>
                          <span className="block text-sm font-medium">{m.full_name}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" />{m.email}</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-xs">
                        <span className="rounded-full border border-border px-2.5 py-1 capitalize">{m.role}</span>
                        <span className={`rounded-full px-2.5 py-1 ${m.user_id ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                          {m.user_id ? "Active" : "Invited"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <DataImport />
        </>
      )}

      <Panel title="My profile">
        <dl className="grid gap-3 sm:grid-cols-3">
          <div><dt className="text-xs text-muted-foreground">Name</dt><dd className="text-sm font-medium">{member?.full_name}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="text-sm font-medium">{member?.email}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Role</dt><dd className="text-sm font-medium capitalize">{member?.role}</dd></div>
        </dl>
      </Panel>
    </div>
  );
}
