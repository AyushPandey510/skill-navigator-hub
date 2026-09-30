import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  total,
  icon,
  accent = "primary",
}: {
  label: string;
  value: number | string;
  total?: number;
  icon?: ReactNode;
  accent?: "primary" | "accent" | "success" | "warning";
}) {
  const pct = typeof value === "number" && total ? Math.min(100, Math.round((value / total) * 100)) : null;
  const fill =
    accent === "success"
      ? "gradient-success"
      : accent === "accent"
        ? "gradient-accent"
        : accent === "warning"
          ? "bg-warning"
          : "gradient-primary";

  return (
    <div className="glass p-3">
      <div className="mb-2 flex items-center justify-between border-b border-border pb-1">
        <span className="text-xs font-bold uppercase text-foreground">{label}</span>
        {icon && <span className="text-foreground" aria-hidden="true">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-foreground">
        {value}
        {total != null && <span className="text-sm font-normal text-muted-foreground"> / {total}</span>}
      </div>
      {pct != null && (
        <div className="mt-3 h-4 border-2 border-border bg-input shadow-[var(--bevel-sunken)]" aria-label={`${pct}% of goal`}>
          <div className={`h-full ${fill}`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {pct != null && <div className="mt-1 text-[11px] text-muted-foreground">{pct}% of goal</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-2 border-border bg-card p-2 shadow-[var(--bevel-raised)]">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          {icon && <span className="text-primary" aria-hidden="true">{icon}</span>}
          <span>{title}</span>
        </h1>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="glass">
      <div className="flex items-center justify-between gap-3 bg-primary px-2 py-1 text-primary-foreground">
        <h2 className="text-sm font-bold uppercase">{title}</h2>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "primary";
}) {
  const tones: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground border-border",
    success: "bg-success text-white border-success",
    warning: "bg-warning text-black border-warning",
    danger: "bg-destructive text-white border-destructive",
    info: "bg-info text-white border-info",
    primary: "bg-primary text-primary-foreground border-primary",
  };

  return <span className={`inline-flex border px-2 py-0.5 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}
