// Facts about the site used by metadata, the share image, the sitemap and structured data.
// These are rendered at build time, so they can't come from Firestore like the page content does.

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://gideon-portfolio-84595.web.app").replace(/\/+$/, "");

export const site = {
  name: "Gideon Michael",
  initials: "GM",
  // Other names people may search for (the CV and the old portfolio use these).
  alternateNames: ["GM", "Gideon B. Michael", "Uduaghan Gideon Michael", "Gideon Uduaghan"],
  jobTitle: "Software Engineer",
  city: "Lagos",
  country: "NG",
  title: "Gideon Michael, Software Engineer in Lagos, Nigeria",
  description:
    "Gideon Michael is a software engineer in Lagos, Nigeria who builds custom web platforms and operational tools that turn complex workflows into smooth software.",
  email: "uduaghangideon@gmail.com",
  employer: "Gemz Software",
  sameAs: ["https://github.com/GideonM1234"],
  knowsAbout: ["Python", "Django", "Django REST Framework", "React", "Next.js", "TypeScript", "PostgreSQL", "Machine learning"],
};
