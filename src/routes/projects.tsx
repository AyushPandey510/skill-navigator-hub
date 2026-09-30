import { createFileRoute } from "@tanstack/react-router";
import { Project, setState, useAppState } from "@/lib/store";
import { PageHeader, Pill, Section } from "@/components/ui-kit";
import { Rocket, ExternalLink, Github, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects · 90-Day Tracker" }, { name: "description", content: "Private project shipping tracker." }] }),
  component: ProjectsPage,
});

const blankProject = (): Project => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
  name: "New project",
  stack: "",
  status: "In progress",
  priority: "P1",
  liveUrl: "",
  githubUrl: "",
  action: "",
});

function linkFor(url?: string) {
  const clean = url?.trim();
  if (!clean) return "";
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

function statusTone(status?: string) {
  const text = status?.toLowerCase() ?? "";
  if (text.includes("live") || text.includes("done") || text.includes("shipped")) return "success";
  if (text.includes("blocked") || text.includes("not")) return "danger";
  return "warning";
}

function ProjectsPage() {
  const s = useAppState();

  const addProject = () => {
    setState((st) => ({ ...st, projects: [blankProject(), ...st.projects] }));
    toast.success("Project added");
  };

  const updateProject = (id: string, patch: Partial<Project>) => {
    setState((st) => ({
      ...st,
      projects: st.projects.map((project) => (project.id === id ? { ...project, ...patch } : project)),
    }));
  };

  const deleteProject = (id: string) => {
    setState((st) => ({ ...st, projects: st.projects.filter((project) => project.id !== id) }));
    toast.success("Project removed");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Add your own projects. Saved privately on this device."
        icon={<Rocket className="w-7 h-7" />}
        actions={
          <button onClick={addProject} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow">
            <Plus className="w-4 h-4" /> Add project
          </button>
        }
      />

      {s.projects.length === 0 ? (
        <Section title="No projects yet">
          <div className="text-sm text-muted-foreground mb-4">Start with your portfolio, capstone, open-source work, freelance projects, or anything you want to ship.</div>
          <button onClick={addProject} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Plus className="w-4 h-4" /> Create first project
          </button>
        </Section>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {s.projects.map((project) => {
            const liveUrl = linkFor(project.liveUrl);
            const githubUrl = linkFor(project.githubUrl);

            return (
              <Section
                key={project.id}
                title={project.name || "Untitled project"}
                action={<Pill tone={statusTone(project.status)}>{project.status || "In progress"}</Pill>}
              >
                <div className="space-y-3">
                  <label className="block">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1">Project name</div>
                    <input
                      value={project.name}
                      onChange={(e) => updateProject(project.id, { name: e.target.value })}
                      placeholder="Portfolio API"
                      className="w-full bg-input rounded-lg px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1">Stack</div>
                    <input
                      value={project.stack ?? ""}
                      onChange={(e) => updateProject(project.id, { stack: e.target.value })}
                      placeholder="React + FastAPI + PostgreSQL"
                      className="w-full bg-input rounded-lg px-3 py-2 text-sm"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Priority</div>
                      <select
                        value={project.priority ?? "P1"}
                        onChange={(e) => updateProject(project.id, { priority: e.target.value })}
                        className="w-full bg-input rounded-lg px-3 py-2 text-sm"
                      >
                        <option>P1</option>
                        <option>P2</option>
                        <option>P3</option>
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Status</div>
                      <select
                        value={project.status ?? "In progress"}
                        onChange={(e) => updateProject(project.id, { status: e.target.value })}
                        className="w-full bg-input rounded-lg px-3 py-2 text-sm"
                      >
                        <option>Not started</option>
                        <option>In progress</option>
                        <option>Blocked</option>
                        <option>Live</option>
                        <option>Shipped</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1">Next action</div>
                    <textarea
                      value={project.action ?? ""}
                      onChange={(e) => updateProject(project.id, { action: e.target.value })}
                      placeholder="Deploy, write README, record demo, add screenshots..."
                      className="w-full bg-input rounded-lg px-3 py-2 text-sm min-h-20 resize-y"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Live URL</div>
                      <input
                        value={project.liveUrl ?? ""}
                        onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-input rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">GitHub URL</div>
                      <input
                        value={project.githubUrl ?? ""}
                        onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })}
                        placeholder="github.com/you/repo"
                        className="w-full bg-input rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex gap-3">
                      {liveUrl && <a href={liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="w-3 h-3" /> Live</a>}
                      {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Github className="w-3 h-3" /> GitHub</a>}
                    </div>
                    <button onClick={() => deleteProject(project.id)} className="inline-flex items-center gap-1 text-destructive hover:underline">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </Section>
            );
          })}
        </div>
      )}
    </div>
  );
}
