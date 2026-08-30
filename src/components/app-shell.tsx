import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, BarChart3, CalendarClock, MessageSquareQuote,
  Lightbulb, Bell, Settings, Code2, GraduationCap, ListChecks, PanelLeftClose, PanelLeft,
  Search, Moon, Sun, LogOut, Activity, ChevronDown,
} from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { useWorkspace } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Initials } from "@/components/ui-bits";

interface NavItem { to: string; label: string; icon: typeof Users }

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/bootcamps", label: "Bootcamps & Batches", icon: GraduationCap },
    { to: "/trainees", label: "Trainees", icon: Users },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/tasks", label: "Tasks & Assessments", icon: ClipboardList },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/meetups", label: "Meetups", icon: CalendarClock },
    { to: "/feedback", label: "Feedback", icon: MessageSquareQuote },
    { to: "/ideas", label: "Ideas", icon: Lightbulb },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  mentor: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/trainees", label: "My Trainees", icon: Users },
    { to: "/courses", label: "Courses & Materials", icon: BookOpen },
    { to: "/tasks", label: "Tasks & Assessments", icon: ClipboardList },
    { to: "/meetups", label: "Meetups", icon: CalendarClock },
    { to: "/feedback", label: "Feedback", icon: MessageSquareQuote },
    { to: "/ideas", label: "Ideas", icon: Lightbulb },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  buddy: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/trainees", label: "My Trainees", icon: Users },
    { to: "/courses", label: "Courses & Materials", icon: BookOpen },
    { to: "/tasks", label: "Tasks & Assessments", icon: ClipboardList },
    { to: "/meetups", label: "Meetups", icon: CalendarClock },
    { to: "/feedback", label: "Feedback", icon: MessageSquareQuote },
    { to: "/ideas", label: "Ideas", icon: Lightbulb },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  trainee: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/courses", label: "My Courses", icon: BookOpen },
    { to: "/tasks", label: "Tasks", icon: ListChecks },
    { to: "/quizzes", label: "Quizzes", icon: ClipboardList },
    { to: "/progress", label: "My Progress", icon: Activity },
    { to: "/meetups", label: "Meetups", icon: CalendarClock },
    { to: "/ideas", label: "Idea Box", icon: Lightbulb },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
};

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <img src="/logo.png" alt="BootMind Logo" className="size-9 shrink-0 object-contain" />
      {!collapsed && (
        <span className="leading-tight overflow-hidden">
          <span className="block text-sm font-bold tracking-tight text-sidebar-accent-foreground">BootMind</span>
          <span className="block text-[9.5px] font-medium text-sidebar-foreground/70 truncate max-w-[150px]" title="Turning Learner Progress into Meaningful Insights">
            Turning Learner Progress into Meaningful Insights
          </span>
        </span>
      )}
    </div>
  );
}

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("bootmind-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("bootmind-theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { member, role, signOut } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { dark, toggle } = useTheme();
  const { data: ws } = useWorkspace();

  const items = role ? NAV[role] : [];
  const unread = useMemo(() => {
    if (!ws) return 0;
    const allowed = new Set(["task", "assessment", "course", "connect", "meetup"]);
    return ws.notifications.filter((n) => {
      if (!n || n.read) return false;
      const cat = (n.category || "task").toLowerCase();
      if (!allowed.has(cat) && !cat.includes("task") && !cat.includes("assess") && !cat.includes("course") && !cat.includes("connect") && !cat.includes("meetup")) {
        return false;
      }
      if (!n.member_id || n.member_id === "all" || n.member_id === "broadcast" || n.member_id === role) return true;
      if (member && n.member_id === member.id) return true;
      const myTrainee = ws.trainees.find((t) => t.member_id === member?.id);
      if (myTrainee && (n.member_id === myTrainee.id || n.member_id === myTrainee.member_id)) return true;
      if (role === "admin") return true;
      return false;
    }).length;
  }, [ws, member, role]);

  const results = useMemo(() => {
    if (!ws || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const out: { label: string; kind: string; to: string; params?: Record<string, string> }[] = [];
    for (const t of ws.trainees) {
      const name = ws.members.find((m) => m.id === t.member_id)?.full_name ?? "";
      if (name.toLowerCase().includes(q)) out.push({ label: name, kind: "Trainee", to: `/trainees/${t.id}` });
    }
    for (const c of ws.courses) if (c.title.toLowerCase().includes(q)) out.push({ label: c.title, kind: "Course", to: `/courses/${c.id}` });
    for (const t of ws.tasks) if (t.title.toLowerCase().includes(q)) out.push({ label: t.title, kind: "Task", to: "/tasks" });
    for (const qz of ws.quizzes) if (qz.title.toLowerCase().includes(q)) out.push({ label: qz.title, kind: "Quiz", to: `/quizzes/${qz.id}` });
    return out.slice(0, 8);
  }, [ws, query]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const nav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4" aria-label="Main">
      {items.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            title={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-all duration-200 md:sticky md:top-0 md:h-screen",
          collapsed && "md:w-[72px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <Logo collapsed={collapsed} />
        {nav}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mx-2 mb-3 hidden items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/40 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur">
          <button
            className="rounded-md p-2 hover:bg-muted md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <PanelLeft className="size-5" />
          </button>

          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trainees, courses, tasks…"
              aria-label="Global search"
              className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {results.length > 0 && (
              <ul className="panel absolute top-12 left-0 z-30 w-full overflow-hidden p-1">
                {results.map((r, i) => (
                  <li key={i}>
                    <button
                      className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        setQuery("");
                        void router.navigate({ to: r.to });
                      }}
                    >
                      <span className="truncate">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link to="/notifications" className="relative rounded-md p-2 hover:bg-muted" aria-label="Notifications">
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Link>

          <button onClick={toggle} className="rounded-md p-2 hover:bg-muted" aria-label="Toggle theme">
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Account menu for ${member?.full_name ?? "BootMind User"}`}
            >
              <Initials name={member?.full_name ?? "BootMind User"} className="size-8" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight">{member?.full_name}</span>
                <span className="block text-xs text-muted-foreground capitalize">{role}</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
            </button>
            {menuOpen && (
              <div className="panel absolute right-0 z-30 mt-2 w-48 p-1" role="menu">
                <Link to="/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setMenuOpen(false)}>
                  Profile & Settings
                </Link>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
                  onClick={async () => {
                    await signOut();
                    void router.navigate({ to: "/auth" });
                  }}
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
