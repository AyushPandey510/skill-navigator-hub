import { createFileRoute } from "@tanstack/react-router";
import { useAppState, setState, useTracker } from "@/lib/store";
import { PageHeader, Pill, Section } from "@/components/ui-kit";
import { Rocket, ExternalLink, Github } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects · 90-Day Tracker" }, { name: "description", content: "Project shipping tracker." }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const t = useTracker();
  const s = useAppState();
  const update = (i: number, patch: any) =>
    setState(st => ({ ...st, projectStatus: { ...st.projectStatus, [i]: { ...st.projectStatus[i], ...patch } } }));

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" subtitle="No live URL = doesn't exist to recruiters · Ship it." icon={<Rocket className="w-7 h-7" />} />

      <div className="grid md:grid-cols-2 gap-4">
        {t.projects.map((p: any, i: number) => {
          const st = s.projectStatus[i] || {};
          const liveUrl = st.liveUrl ?? "";
          const status = st.status ?? p.status;
          return (
            <Section key={i} title={p.name} action={
              <Pill tone={status?.includes("🔴") ? "danger" : status?.includes("🟢") ? "success" : "warning"}>{status}</Pill>
            }>
              <div className="text-xs text-muted-foreground mb-2">{p.stack}</div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Pill tone={p.priority?.includes("P1") ? "danger" : "info"}>{p.priority}</Pill>
              </div>
              <div className="text-sm mb-3 text-foreground/90"><span className="text-muted-foreground">Action: </span>{p.action}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="block"><div className="text-[10px] uppercase text-muted-foreground mb-1">Live URL</div>
                  <input value={liveUrl} onChange={(e) => update(i, { liveUrl: e.target.value })} onBlur={() => liveUrl && toast.success("Saved")} placeholder="https://..." className="w-full bg-input rounded-lg px-2 py-1.5" /></label>
                <label className="block"><div className="text-[10px] uppercase text-muted-foreground mb-1">Status</div>
                  <select value={status} onChange={(e) => update(i, { status: e.target.value })} className="w-full bg-input rounded-lg px-2 py-1.5">
                    <option>🔴 Not deployed</option><option>🟡 In progress</option><option>🟢 Live</option>
                  </select></label>
              </div>
              <div className="flex gap-3 mt-3 text-xs">
                {liveUrl && <a href={liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="w-3 h-3" /> Live</a>}
                {p.githubUrl && <a href={`https://${p.githubUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Github className="w-3 h-3" /> GitHub</a>}
              </div>
            </Section>
          );
        })}
      </div>
    </div>
  );
}
