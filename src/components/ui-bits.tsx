import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { statusLabel, type Status } from "@/lib/analytics";
import { CheckCircle2, AlertTriangle, TrendingDown, Clock } from "lucide-react";

export function Initials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = (status || "on_track").toLowerCase().replace("-", "_");
  const map: Record<string, { cls: string; Icon: any; label: string }> = {
    on_track: { cls: "bg-success/12 text-success border-success/25", Icon: CheckCircle2, label: "On Track" },
    completed: { cls: "bg-success/12 text-success border-success/25", Icon: CheckCircle2, label: "Completed" },
    reviewed: { cls: "bg-success/12 text-success border-success/25", Icon: CheckCircle2, label: "Reviewed" },
    accepted: { cls: "bg-success/12 text-success border-success/25", Icon: CheckCircle2, label: "Accepted" },
    at_risk: { cls: "bg-warning/15 text-warning-foreground border-warning/40", Icon: AlertTriangle, label: "At Risk" },
    in_progress: { cls: "bg-warning/15 text-warning-foreground border-warning/40", Icon: Clock, label: "In Progress" },
    submitted: { cls: "bg-primary/10 text-primary border-primary/30", Icon: Clock, label: "Submitted" },
    pending: { cls: "bg-warning/15 text-warning-foreground border-warning/40", Icon: Clock, label: "Pending" },
    behind: { cls: "bg-destructive/12 text-destructive border-destructive/25", Icon: TrendingDown, label: "Behind" },
    rejected: { cls: "bg-destructive/12 text-destructive border-destructive/25", Icon: TrendingDown, label: "Rejected" },
    not_started: { cls: "bg-muted text-muted-foreground border-border", Icon: Clock, label: "Not Started" },
  };

  const item = map[normalized] || {
    cls: "bg-muted text-muted-foreground border-border",
    Icon: CheckCircle2,
    label: status ? String(status).replace("_", " ") : "Normal",
  };

  const { cls, Icon, label } = item;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize", cls)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function Meter({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)} role="presentation">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string | undefined;
  tone?: "default" | "success" | "warning" | "danger" | "ai";
  icon?: ReactNode | undefined;
}) {
  const toneCls = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning-foreground",
    danger: "text-destructive",
    ai: "text-ai",
  }[tone];
  return (
    <div className="panel p-4 transition-shadow hover:shadow-elevated">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <p className={cn("stat-value mt-2", toneCls)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string | undefined;
  description?: string | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={cn("panel p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-base font-semibold">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string | undefined; action?: ReactNode | undefined }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
