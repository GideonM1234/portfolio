export type Profile = {
  name: string;
  title: string;
  location: string;
  headline: string;
  intro: string; // one or two lines under the headline
  about: string;
  photoUrl: string;
  skills: string; // one group per line, "Group: skill, skill"
  focus: string; // one area per line, "Area: what you do there"
  email: string;
  github: string;
  linkedin: string;
  instagram: string;
  whatsapp: string;
  cvUrl: string;
};

export const socialLinks = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "whatsapp", label: "WhatsApp" },
] as const satisfies readonly { key: keyof Profile; label: string }[];

export type Project = {
  id: string;
  title: string;
  company: string; // who it was built at or for, empty for personal projects
  summary: string;
  description: string;
  tech: string[];
  liveUrl: string;
  repoUrl: string;
  imageUrl: string;
  order: number;
};

export type Education = {
  id: string;
  qualification: string; // e.g. "Advanced Diploma in Software Engineering"
  school: string;
  location: string;
  end: string; // month finished, e.g. "2025-10"
  note: string; // focus or coursework, one short line
  order: number;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string; // e.g. "2023-03"
  end: string; // empty = present
  summary: string;
  order: number;
};
