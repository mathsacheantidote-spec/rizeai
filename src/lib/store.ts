import { create } from "zustand";
import { persist } from "zustand/middleware";
import { JOB_ROLES, type JobRole, getRoadmap, type RoadmapPhase, clusterScoresFromQuiz, type SkillCluster, overallScore } from "./rize-data";

export interface UserProfile {
  name: string;
  email: string;
  college: string;
  program: string;
  year: string;
  targetRoleId: string;
}

export interface GeneratedResume {
  dataUrl: string; // base64 data URL of the PDF
  filename: string;
  atsScore: number;
  generatedAt: number; // epoch ms
  roleId: string;
}

interface RizeState {
  onboarded: boolean;
  profile: UserProfile | null;
  quizAnswers: Record<string, number>;
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  inProgressSteps: string[];
  resume: GeneratedResume | null;
  setProfile: (p: Partial<UserProfile>) => void;
  setQuizAnswer: (qid: string, score: number) => void;
  selectRole: (roleId: string) => void;
  finishOnboarding: () => void;
  toggleStep: (stepId: string) => void;
  startStep: (stepId: string) => void;
  saveResume: (r: GeneratedResume) => void;
  reset: () => void;

  // Derived
  getRole: () => JobRole | null;
  getClusters: () => SkillCluster[];
  getOverallScore: () => number;
}

const initialProfile: UserProfile = {
  name: "",
  email: "",
  college: "",
  program: "",
  year: "",
  targetRoleId: "swe",
};

export const useRize = create<RizeState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: null,
      quizAnswers: {},
      roadmap: getRoadmap("swe"),
      completedSteps: ["f1", "f2"],
      inProgressSteps: ["f3"],
      resume: null,

      setProfile: (p) =>
        set((s) => ({ profile: { ...(s.profile ?? initialProfile), ...p } })),

      setQuizAnswer: (qid, score) =>
        set((s) => ({ quizAnswers: { ...s.quizAnswers, [qid]: score } })),

      selectRole: (roleId) =>
        set((s) => ({
          profile: { ...(s.profile ?? initialProfile), targetRoleId: roleId },
          roadmap: getRoadmap(roleId),
        })),

      finishOnboarding: () => set({ onboarded: true }),

      toggleStep: (stepId) =>
        set((s) => {
          const isDone = s.completedSteps.includes(stepId);
          return {
            completedSteps: isDone
              ? s.completedSteps.filter((id) => id !== stepId)
              : [...s.completedSteps, stepId],
            inProgressSteps: s.inProgressSteps.filter((id) => id !== stepId),
          };
        }),

      startStep: (stepId) =>
        set((s) => ({
          inProgressSteps: s.inProgressSteps.includes(stepId)
            ? s.inProgressSteps
            : [...s.inProgressSteps, stepId],
        })),

      saveResume: (r) => set({ resume: r }),

      reset: () =>
        set({
          onboarded: false,
          profile: null,
          quizAnswers: {},
          roadmap: getRoadmap("swe"),
          completedSteps: [],
          inProgressSteps: [],
          resume: null,
        }),

      getRole: () => {
        const id = get().profile?.targetRoleId ?? "swe";
        return JOB_ROLES.find((r) => r.id === id) ?? JOB_ROLES[0];
      },

      getClusters: () => clusterScoresFromQuiz(get().quizAnswers),

      getOverallScore: () => {
        const clusters = clusterScoresFromQuiz(get().quizAnswers);
        const base = overallScore(clusters);
        // Boost for completed steps
        const boost = Math.min(25, get().completedSteps.length * 4);
        return Math.min(99, base + boost);
      },
    }),
    {
      name: "rize-store",
    }
  )
);
