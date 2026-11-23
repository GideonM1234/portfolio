import type { Education, Experience, Project } from "./types";

// Projects for the one-click import on the admin Projects tab. The first one is featured.
export const cvProjects: Omit<Project, "id">[] = [
  {
    title: "Bizsoft HRM",
    company: "Gemz Software",
    summary: "A human resources management system that runs a company's leave, approvals, payroll and staff training in one place.",
    description: [
      "Leave requests follow approval chains based on each employee's department, and escalate to the managing director when needed.",
      "Payroll built from the accountant's own templates: payroll runs, payslips, bank payment schedules and automatic loan repayments.",
      "Approvers can raise a query on a request in a chat thread, which holds only that item until it's answered.",
      "A learning management system for staff training plans, with progress tracking and voting.",
      "Role-based access across 22 roles, with a switch between a manager's role pages and their own staff pages.",
      "Live for HydroDive, where staff use it day to day.",
    ].join("\n"),
    tech: ["Django", "Django REST Framework", "Next.js", "TypeScript", "PostgreSQL"],
    liveUrl: "https://hrms.hydrodive.com/",
    repoUrl: "",
    imageUrl: "",
    order: 0,
  },
  {
    title: "Travel Management Application",
    company: "",
    summary: "A travel management system for planning trips, handling bookings and tracking expenses automatically.",
    description: [
      "Designed the system's architecture as lead developer.",
      "Connected third-party booking and location APIs to keep booking data accurate and reliable.",
    ].join("\n"),
    tech: ["REST APIs"],
    liveUrl: "",
    repoUrl: "",
    imageUrl: "",
    order: 1,
  },
  {
    title: "Interactive Engine Application",
    company: "",
    summary: "A modular logic engine with live feedback and scoring.",
    description: [
      "Built the feedback and scoring logic to stay light and fast.",
      "Structured the code in clean, separate modules so it's easy to maintain and extend.",
    ].join("\n"),
    tech: [],
    liveUrl: "",
    repoUrl: "",
    imageUrl: "",
    order: 2,
  },
];

// Work history from the CV, for the one-click import on the admin Experience tab.
export const cvExperience: Omit<Experience, "id" | "order">[] = [
  {
    role: "Software Engineer",
    company: "Gemz Software",
    location: "",
    start: "2026-10",
    end: "",
    summary:
      "Building business software, including a human resources management system that covers leave, approvals, payroll and staff training.",
  },
  {
    role: "Technical Instructor",
    company: "Aptech Computer Education",
    location: "Lagos, Nigeria",
    start: "2024-10",
    end: "2026-09",
    summary: [
      "Taught Python, Django, data science and machine learning through a hands-on curriculum.",
      "Guided students through building REST APIs, designing databases with SQL and PostgreSQL, and analysing data with Pandas and NumPy.",
      "Reviewed student projects and code, and mentored new developers in modern engineering practice.",
    ].join("\n"),
  },
  {
    role: "Frontend Developer",
    company: "LifeProt Scientifics",
    location: "Lagos, Nigeria",
    start: "2024-12",
    end: "2026-09",
    summary: [
      "Designed and built an e-commerce app for selling machinery, equipment and tools, with secure payments and simple navigation.",
      "Led the front-end architecture of a responsive single-page app in React that works across browsers.",
      "Worked with the wider team to turn designs into features and connect them to the backend APIs.",
    ].join("\n"),
  },
  {
    role: "Software Developer",
    company: "ManrageAgency",
    location: "Remote, Philippines",
    start: "2022-03",
    end: "",
    summary: [
      "Build the core features of tools that help digital content creators manage their accounts and workflow.",
      "Connect the client apps to scalable backend APIs and authentication services.",
      "Improve performance, data delivery and queries for high-traffic client apps.",
    ].join("\n"),
  },
];

// Newest first: order comes from the start date, so it's never managed by hand.
export const experienceOrder = (start: string) => -Number(start.replace("-", ""));

// Education from the CV, for the one-click import on the admin Education tab.
export const cvEducation: Omit<Education, "id" | "order">[] = [
  {
    qualification: "Advanced Diploma in Software Engineering",
    school: "Aptech Computer Education",
    location: "Lagos, Nigeria",
    end: "2025-10",
    note: "Data structures and algorithms, object-oriented programming, database management, statistics and computer organisation.",
  },
  {
    qualification: "Nanodegree in Python & Backend Engineering",
    school: "Udemy",
    location: "Online",
    end: "2025-04",
    note: "Python, API development and documentation, database management, identity and access management, and server deployment.",
  },
];
