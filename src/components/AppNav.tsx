import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, Code2, Briefcase, BarChart3, Map, Rocket, NotebookPen } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/daily", label: "Daily Log", icon: Calendar },
  { to: "/dsa", label: "DSA / LeetCode", icon: Code2 },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/weekly", label: "Weekly Review", icon: BarChart3 },
  { to: "/skills", label: "Skill Roadmap", icon: Map },
  { to: "/projects", label: "Projects", icon: Rocket },
  { to: "/notes", label: "Daily Notes", icon: NotebookPen },
] as const;

export function AppNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary shadow-glow grid place-items-center font-bold text-primary-foreground">A</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Ayush · 90-Day Tracker</div>
            <div className="text-[10px] text-muted-foreground">Python Backend & ML Engineer</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 ml-auto flex-wrap">
          {navItems.map((it) => {
            const Active = path === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  Active
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
