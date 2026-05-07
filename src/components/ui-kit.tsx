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
  const grad =
    accent === "success" ? "gradient-success"
    : accent === "accent" ? "gradient-accent"
    : accent === "warning" ? "bg-warning"
    : "gradient-primary";
  return (
    <div className="glass rounded-2xl p-5 shadow-soft hover:shadow-glow transition-all relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${grad} opacity-20 blur-2xl rounded-full`} />
      <div className="flex items-center justify-between mb-2 relative">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="text-3xl font-bold tracking-tight relative">
        {value}
        {total != null && <span className="text-base text-muted-foreground font-normal"> / {total}</span>}
      </div>
      {pct != null && (
        <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden relative">
          <div className={`h-full ${grad} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {pct != null && <div className="mt-1 text-[10px] text-muted-foreground">{pct}% of goal</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, icon, actions }: { title: string; subtitle?: string; icon?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          <span className="text-gradient">{title}</span>
        </h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info" | "primary" }) {
  const tones: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-success/20 text-success border border-success/30",
    warning: "bg-warning/20 text-warning border border-warning/30",
    danger: "bg-destructive/20 text-destructive border border-destructive/30",
    info: "bg-info/20 text-info border border-info/30",
    primary: "bg-primary/20 text-primary border border-primary/30",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${tones[tone]}`}>{children}</span>;
}
