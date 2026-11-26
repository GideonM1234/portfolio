import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Education, Experience, Profile, Project } from "./types";

export const emptyProfile: Profile = {
  name: "Gideon Michael",
  title: "Software Engineer",
  location: "Lagos, Nigeria",
  headline: "I build software that businesses run on.",
  intro:
    "Custom web platforms and operational tools that turn complex workflows into smooth software, built end to end with Django, React and PostgreSQL.",
  about: "",
  // Until Firestore loads, show the build-time copy of the saved photo (also what crawlers see).
  photoUrl: "/profile-photo.jpg",
  skills: [
    "Languages & Frameworks: Python, Django, Django REST Framework, JavaScript, TypeScript, React, Next.js, SQL, C",
    "Data Science & Machine Learning: Pandas, NumPy, Data preprocessing, Machine learning, Statistics",
    "Databases & Tools: PostgreSQL, MySQL, AWS, Git, GitHub, Jupyter, VS Code",
  ].join("\n"),
  focus: [
    "Backend systems: Django and Django REST Framework APIs, PostgreSQL data models, and the business rules behind HR, payroll and approvals.",
    "Frontend apps: Responsive React and Next.js interfaces that make complex workflows quick to learn and easy to use.",
    "Data and teaching: Data analysis and machine learning with Pandas and NumPy, and two years teaching developers at Aptech.",
  ].join("\n"),
  email: "uduaghangideon@gmail.com",
  github: "",
  linkedin: "",
  instagram: "",
  whatsapp: "",
  cvUrl: "",
};

export async function loadProfile(): Promise<Profile> {
  if (!db) return emptyProfile;
  const snap = await getDoc(doc(db, "profile", "main"));
  return snap.exists() ? { ...emptyProfile, ...(snap.data() as Partial<Profile>) } : emptyProfile;
}

async function loadList<T extends { id: string; order: number }>(name: string): Promise<T[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, name));
  return snap.docs
    .map((d) => ({ order: 0, ...d.data(), id: d.id }) as T)
    .sort((a, b) => a.order - b.order);
}

export const loadProjects = () => loadList<Project>("projects");
export const loadExperience = () => loadList<Experience>("experience");
export const loadEducation = () => loadList<Education>("education");

// "2025-10" -> "Oct 2025"; a bare year stays a year.
export function formatMonth(v: string) {
  const [y, m] = v.split("-");
  if (!y) return "";
  const d = new Date(Number(y), m ? Number(m) - 1 : 0);
  return d.toLocaleDateString("en-GB", m ? { month: "short", year: "numeric" } : { year: "numeric" });
}

export function formatRange(start: string, end: string) {
  return `${formatMonth(start)} to ${end ? formatMonth(end) : "present"}`;
}
