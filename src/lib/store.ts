import { useEffect, useState, useSyncExternalStore } from "react";
import tracker from "@/data/tracker.json";

export type DayLog = {
  studyHours?: number;
  lcCount?: number;
  jobsApplied?: number;
  callbacks?: number;
  commit?: boolean;
  mock?: boolean;
  energy?: number;
  status?: string;
  wins?: string;
  blockers?: string;
};

export type JobApp = {
  id: string;
  date: string;
  company: string;
  role: string;
  source: string;
  salary: string;
  status: "Applied" | "Pending" | "Callback" | "Interview" | "Offer" | "Rejected";
  followUp?: string;
  contact?: string;
  notes?: string;
};

export type WeekReview = {
  biggestWin?: string;
  toFix?: string;
  mood?: string;
};

export type Note = {
  id: string;
  date: string; // ISO
  title: string;
  body: string;
  mood?: string;
};

export type UserProfile = {
  name?: string;
  role?: string;
};

export type Project = {
  id: string;
  name: string;
  stack?: string;
  status?: string;
  priority?: string;
  liveUrl?: string;
  githubUrl?: string;
  action?: string;
};

export type AppState = {
  profile: UserProfile;
  dayLogs: Record<number, DayLog>;
  dsaStatus: Record<number, "todo" | "doing" | "done" | "revisit">;
  skillStatus: Record<number, "todo" | "doing" | "done">;
  projectStatus: Record<number, { liveUrl?: string; status?: string; done?: boolean }>;
  projects: Project[];
  jobs: JobApp[];
  weekReviews: Record<number, WeekReview>;
  notes: Note[];
};

const KEY = "skill_navigator_hub_v1";

const defaultState: AppState = {
  profile: {},
  dayLogs: {},
  dsaStatus: {},
  skillStatus: {},
  projectStatus: {},
  projects: [],
  jobs: [],
  weekReviews: {},
  notes: [],
};

let state: AppState = defaultState;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

let loaded = false;
function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    load();
    loaded = true;
  }
}

export function getState(): AppState {
  ensureLoaded();
  return state;
}
export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): AppState {
  // SSR safe: initial server snapshot uses defaultState
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      ensureLoaded();
      return state;
    },
    () => defaultState,
  );
  // Hydration sync — re-render once client loads from localStorage
  const [, setTick] = useState(0);
  useEffect(() => {
    ensureLoaded();
    setTick((t) => t + 1);
  }, []);
  return snapshot;
}

// Selectors / computed
export function useTracker() {
  return tracker as typeof tracker;
}

export function computeStats(s: AppState) {
  const lcDone = Object.values(s.dsaStatus).filter((v) => v === "done").length;
  const skillsDone = Object.values(s.skillStatus).filter((v) => v === "done").length;
  let studyHours = 0,
    jobsApplied = 0,
    callbacks = 0,
    commits = 0,
    daysLogged = 0,
    mocks = 0;
  Object.values(s.dayLogs).forEach((d) => {
    if (
      (d.studyHours ?? 0) > 0 ||
      (d.lcCount ?? 0) > 0 ||
      (d.jobsApplied ?? 0) > 0 ||
      d.wins ||
      d.commit
    )
      daysLogged++;
    studyHours += d.studyHours ?? 0;
    jobsApplied += d.jobsApplied ?? 0;
    callbacks += d.callbacks ?? 0;
    if (d.commit) commits++;
    if (d.mock) mocks++;
  });
  const jobsTotal = s.jobs.length;
  const jobsByStatus = s.jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});
  return {
    lcDone,
    skillsDone,
    studyHours,
    jobsApplied: Math.max(jobsApplied, jobsTotal),
    callbacks,
    commits,
    daysLogged,
    mocks,
    jobsByStatus,
  };
}

export const TARGETS = {
  leetcode: 168,
  jobs: 500,
  studyHours: 600,
  commits: 90,
  mocks: 36,
};

export function exportData(): string {
  return JSON.stringify(getState(), null, 2);
}
export function importData(json: string) {
  try {
    const parsed = JSON.parse(json);
    setState(() => ({ ...defaultState, ...parsed }));
    return true;
  } catch {
    return false;
  }
}
export function resetData() {
  setState(() => defaultState);
}
