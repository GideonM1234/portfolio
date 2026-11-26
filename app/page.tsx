"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { emptyProfile, formatMonth, formatRange, loadEducation, loadExperience, loadProfile, loadProjects } from "@/lib/data";
import { FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { FiArrowUpRight, FiBarChart2, FiCode, FiLayout, FiMaximize2, FiMoon, FiServer, FiSun, FiX } from "react-icons/fi";
import { socialLinks, type Education, type Experience, type Profile, type Project } from "@/lib/types";

const icons = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
};

const container = "mx-auto w-full max-w-[1120px] px-5 md:px-8";
const section = "scroll-mt-10 py-20 md:py-28";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-medium text-white transition-colors duration-150 hover:bg-accent/85";
const btnGhost =
  "inline-flex items-center gap-2 rounded-lg border border-line-strong px-5 py-3 font-medium transition-colors duration-150 hover:border-accent-ink hover:text-accent-ink";
const tag = "rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted";

function parseSkills(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const i = line.indexOf(":");
      const [name, list] = i >= 0 ? [line.slice(0, i), line.slice(i + 1)] : ["Skills", line];
      return { name: name.trim(), items: list.split(",").map((s) => s.trim()).filter(Boolean) };
    })
    .filter((g) => g.items.length > 0);
}

const focusIcons = [FiServer, FiLayout, FiBarChart2, FiCode];

function parseFocus(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const i = line.indexOf(":");
      return i >= 0 ? { title: line.slice(0, i).trim(), text: line.slice(i + 1).trim() } : { title: line.trim(), text: "" };
    })
    .filter((f) => f.title);
}

function yearsSince(start: string) {
  const [y, m] = start.split("-").map(Number);
  if (!y) return 0;
  const now = new Date();
  return Math.floor((now.getFullYear() * 12 + now.getMonth() - (y * 12 + (m || 1) - 1)) / 12);
}

export default function Home() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<Project | null>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const navHidden = useHideOnScrollDown();

  useEffect(() => {
    Promise.all([loadProfile(), loadProjects(), loadExperience(), loadEducation()])
      .then(([p, pr, ex, ed]) => {
        setProfile(p);
        setProjects(pr);
        setExperience(ex);
        setEducation(ed);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const socials = socialLinks.filter((l) => profile[l.key]);
  const skills = parseSkills(profile.skills ?? "");
  const paragraphs = (profile.about ?? "").split(/\n\s*\n|\n/).map((s) => s.trim()).filter(Boolean);
  const current = experience.filter((e) => !e.end);
  const earliest = experience.map((e) => e.start).filter(Boolean).sort()[0];
  const years = earliest ? yearsSince(earliest) : 0;
  const facts = [
    profile.location && { label: "Location", value: profile.location },
    years > 0 && { label: "Experience", value: `${years}+ years building business software` },
    current.length > 0 && { label: "Currently", value: current.map((e) => `${e.role}, ${e.company}`).join("\n") },
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];
  const focus = parseFocus(profile.focus ?? "");
  const showAbout = paragraphs.length > 0 || skills.length > 0 || focus.length > 0 || education.length > 0;

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-line bg-bg transition-transform duration-300 ease-out focus-within:translate-y-0 motion-reduce:transition-none ${
          navHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className={`${container} flex h-16 items-center justify-between gap-4`}>
          <a href="#top" aria-label={`${profile.name}, back to top`} className="font-display text-2xl font-bold tracking-tight">
            <Wordmark name={profile.name} />
          </a>
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            {[
              showAbout && ["About", "#about"],
              ["Projects", "#projects"],
              ["Experience", "#experience"],
              ["Contact", "#contact"],
            ]
              .filter((x): x is string[] => Boolean(x))
              .map(([label, href], i) => (
                <a
                  key={href}
                  href={href}
                  className={`rounded-md px-2.5 py-1.5 text-muted transition-colors duration-150 hover:text-ink ${i === 0 || href === "#experience" ? "hidden sm:inline-block" : ""}`}
                >
                  {label}
                </a>
              ))}
            <ThemeSwitch />
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className={`${container} grid items-center gap-12 pt-12 pb-20 md:grid-cols-12 md:gap-10 md:pt-24 md:pb-28`}>
          <div className="md:col-span-7">
            {/* The name line is the page's h1 so searches for the name find it; the tagline keeps the big type. */}
            <h1 className="rise font-mono text-sm font-normal text-muted">
              {profile.name} / {profile.title}
              {profile.location && ` / ${profile.location}`}
            </h1>
            <p className="rise display mt-6 text-balance" style={{ animationDelay: "60ms" }}>
              {profile.headline}
            </p>
            {profile.intro && (
              <p className="rise mt-6 max-w-[52ch] text-lg text-muted" style={{ animationDelay: "120ms" }}>
                {profile.intro}
              </p>
            )}
            <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
              <a href="#projects" className={btnPrimary}>
                View projects
              </a>
              {profile.cvUrl && (
                <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                  Download CV
                </a>
              )}
            </div>
          </div>

          {/* Phones: photo first, as a centred circle inside an accent ring with a small gap.
              Desktop: the tall rounded portrait beside the text. */}
          <div className="rise order-first md:order-none md:col-span-5" style={{ animationDelay: "240ms" }}>
            <div className="mx-auto w-44 rounded-full border-2 border-accent-ink p-1.5 sm:w-52 md:mr-0 md:ml-auto md:w-full md:max-w-[340px] md:rounded-[18px] md:border md:border-line md:p-0">
              <div className="overflow-hidden rounded-full bg-surface md:rounded-[17px]">
                {profile.photoUrl ? (
                  <button
                    type="button"
                    onClick={() => setZoom({ src: profile.photoUrl, alt: `Portrait of ${profile.name}` })}
                    aria-label="View photo full size"
                    className="group relative block w-full cursor-zoom-in"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.photoUrl}
                      alt={`Portrait of ${profile.name}`}
                      className="aspect-square w-full object-cover object-[50%_20%] md:aspect-[4/5] md:object-top"
                    />
                    <span className="hidden md:block">
                      <ZoomHint />
                    </span>
                  </button>
                ) : (
                  <div className="blueprint grid aspect-square w-full place-items-center md:aspect-[4/5]">
                    <span className="font-display text-5xl font-bold tracking-tight md:text-8xl">
                      <Wordmark name={profile.name} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* About: a sticky side column (title + facts) beside the story, focus areas and stack. */}
        {showAbout && (
          <section id="about" className={`${section} border-t border-line`}>
            <div className={`${container} grid gap-12 md:grid-cols-12 md:gap-10`}>
              <div className="md:col-span-4">
                <div className="md:sticky md:top-10">
                  <SectionTitle>About me</SectionTitle>
                  <dl className="mt-10 border-t border-line">
                    {facts.map((f) => (
                      <div key={f.label} className="border-b border-line py-4">
                        <dt className="font-mono text-xs text-muted">{f.label}</dt>
                        <dd className="mt-1 whitespace-pre-line [overflow-wrap:anywhere]">
                          {f.href ? (
                            <a href={f.href} className="text-accent-ink hover:underline">
                              {f.value}
                            </a>
                          ) : (
                            f.value
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {profile.cvUrl && (
                    <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className={`${btnGhost} mt-8`}>
                      Download CV
                    </a>
                  )}
                </div>
              </div>

              <div className="md:col-span-8 md:pl-6">
                {paragraphs[0] && (
                  <p className="max-w-[30ch] font-display text-2xl font-medium leading-snug tracking-tight md:text-[2rem]">
                    {paragraphs[0]}
                  </p>
                )}
                {paragraphs.slice(1).map((para) => (
                  <p key={para} className="mt-6 max-w-[64ch] text-muted">
                    {para}
                  </p>
                ))}

                {focus.length > 0 && (
                  <div className="mt-16">
                    <h3 className="font-display text-2xl font-semibold tracking-tight">What I work on</h3>
                    <ul className="mt-6 border-t border-line">
                      {focus.map((f, i) => {
                        const Icon = focusIcons[i % focusIcons.length];
                        return (
                          <li key={f.title} className="grid grid-cols-[2.75rem_1fr] gap-5 border-b border-line py-6">
                            <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-accent-ink">
                              <Icon aria-hidden className="size-5" />
                            </span>
                            <div>
                              <p className="font-display text-lg font-semibold">{f.title}</p>
                              {f.text && <p className="mt-1 max-w-[60ch] text-muted">{f.text}</p>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {education.length > 0 && (
                  <div className="mt-16">
                    <h3 className="font-display text-2xl font-semibold tracking-tight">Education</h3>
                    <ol className="mt-6 border-t border-line">
                      {education.map((ed) => (
                        <li key={ed.id} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
                          <p className="pt-0.5 font-mono text-sm text-muted">{formatMonth(ed.end)}</p>
                          <div>
                            <p className="font-display text-lg font-semibold">{ed.qualification}</p>
                            <p className="mt-0.5 text-muted">{[ed.school, ed.location].filter(Boolean).join(", ")}</p>
                            {ed.note && <p className="mt-3 max-w-[60ch] text-[0.95rem] text-muted">{ed.note}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="mt-16">
                    <h3 className="font-display text-2xl font-semibold tracking-tight">Stack</h3>
                    <dl className="mt-6 border-t border-line">
                      {skills.map((g) => (
                        <div key={g.name} className="grid gap-3 border-b border-line py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
                          <dt className="font-medium">{g.name}</dt>
                          <dd>
                            <ul className="flex flex-wrap gap-1.5">
                              {g.items.map((s) => (
                                <li key={s} className={tag}>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        <section id="projects" className={`${section} border-t border-line`}>
          <div className={container}>
            <SectionTitle>Projects</SectionTitle>
            {loaded && projects.length === 0 && <p className="mt-8 text-muted">No projects yet. Add one from the admin page.</p>}
            {projects.length > 0 && (
              <ul className="mt-12 grid gap-6 md:grid-cols-2">
                {projects.map((p) => (
                  <li key={p.id}>
                    <ProjectCard p={p} onOpen={() => setOpen(p)} onZoom={setZoom} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className={`${section} border-t border-line`}>
          <div className={container}>
            <SectionTitle>Work experience</SectionTitle>
            {loaded && experience.length === 0 && <p className="mt-8 text-muted">No experience yet. Add a role from the admin page.</p>}
            <ol className="mt-12 border-t border-line">
              {experience.map((e) => (
                <li key={e.id} className="grid gap-3 border-b border-line py-10 md:grid-cols-[13rem_1fr] md:gap-10">
                  <div className="font-mono text-sm text-muted">
                    <p>{formatRange(e.start, e.end)}</p>
                    {!e.end && <p className="mt-1 text-accent-ink">Current</p>}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">{e.role}</h3>
                    <p className="mt-1 text-muted">{[e.company, e.location].filter(Boolean).join(", ")}</p>
                    <Points text={e.summary} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className={`${section} border-t border-line`}>
          <div className={container}>
            <div className="rounded-2xl border border-line bg-surface px-6 py-14 md:px-14 md:py-20">
              <h2 className="display max-w-[16ch] text-balance">Have something to build? Let&apos;s talk.</h2>
              <a
                href={`mailto:${profile.email}`}
                className="mt-8 inline-block font-display text-xl font-medium text-accent-ink underline decoration-1 underline-offset-[6px] [overflow-wrap:anywhere] hover:decoration-2 md:text-3xl"
              >
                {profile.email}
              </a>
              {socials.length > 0 && (
                <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-8">
                  {socials.map((l) => {
                    const Icon = icons[l.key];
                    return (
                      <li key={l.key}>
                        <a
                          href={profile[l.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 text-muted transition-colors duration-150 hover:text-ink"
                        >
                          <Icon aria-hidden className="size-[18px]" />
                          {l.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>

      {open && <ProjectDialog p={open} onClose={() => setOpen(null)} onZoom={setZoom} />}
      {zoom && <Lightbox {...zoom} onClose={() => setZoom(null)} />}

      <footer className="border-t border-line">
        <div className={`${container} flex flex-wrap justify-between gap-2 py-8 font-mono text-xs text-muted`}>
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <a href="#top" className="hover:text-ink">
            Back to top
          </a>
        </div>
      </footer>
    </>
  );
}

// The header slides away while scrolling down and comes back as soon as the visitor scrolls up.
// Near the top of the page it always shows. Small jitters are ignored so it doesn't flicker.
function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 80) setHidden(false);
        else if (y > last + 6) setHidden(true);
        else if (y < last - 6) setHidden(false);
        if (Math.abs(y - last) > 6) last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return hidden;
}

// Section headline with an accent underline that draws in the first time it scrolls into view.
function SectionTitle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <h2 ref={ref} className="group display text-balance">
      {children}
      <span
        aria-hidden
        className={`mt-4 block h-[3px] w-14 origin-left rounded-sm bg-accent-ink transition-[transform,width] duration-700 ease-out group-hover:w-[5.5rem] motion-reduce:scale-x-100 motion-reduce:transition-none ${
          seen ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </h2>
  );
}

function currentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "dark");
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? FiSun : FiMoon;
  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("theme", next);
        } catch {}
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="ml-1 grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}

// "GM": the first initial in ink, the second in the accent.
function Wordmark({ name }: { name: string }) {
  const mark = monogram(name);
  return (
    <>
      <span>{mark[0]}</span>
      <span className="text-accent-ink">{mark.slice(1)}</span>
    </>
  );
}

// One line reads as a sentence; several lines read as a list of things done.
function Points({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (lines.length < 2) return <p className="mt-4 max-w-[66ch] text-muted">{lines[0]}</p>;
  return (
    <ul className="mt-5 max-w-[66ch] space-y-3">
      {lines.map((l) => (
        <li key={l} className="relative pl-5 leading-relaxed text-muted">
          <span aria-hidden className="absolute left-0 top-[0.7em] h-px w-2.5 bg-accent-ink" />
          {l}
        </li>
      ))}
    </ul>
  );
}

function monogram(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts.map((w) => w[0]).join("").slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function host(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// The screenshot, or the grid cover with the project's initials until there is one.
function ProjectPreview({ p, zoom }: { p: Project; zoom?: boolean }) {
  return p.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.imageUrl}
      alt={`Screenshot of ${p.title}`}
      className={`size-full object-cover object-top ${zoom ? "transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" : ""}`}
    />
  ) : (
    <div className="blueprint flex size-full flex-col justify-between p-6">
      <span className="font-mono text-xs text-muted">{host(p.liveUrl) || "private project"}</span>
      <span aria-hidden className="font-display text-6xl font-bold tracking-tight md:text-7xl">
        <Wordmark name={p.title} />
      </span>
    </div>
  );
}

function ProjectLinks({ p }: { p: Project }) {
  return (
    <>
      {p.liveUrl && (
        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent-ink hover:underline">
          Visit live site
          <FiArrowUpRight aria-hidden className="size-4" />
        </a>
      )}
      {p.repoUrl && (
        <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
          View code
          <FiArrowUpRight aria-hidden className="size-4" />
        </a>
      )}
    </>
  );
}

// The whole card opens the details dialog: the title button stretches over the card,
// and the outside links sit above it so they still work on their own.
function ProjectCard({
  p,
  onOpen,
  onZoom,
}: {
  p: Project;
  onOpen: () => void;
  onZoom: (img: { src: string; alt: string }) => void;
}) {
  const shown = p.tech?.slice(0, 4) ?? [];
  const hidden = (p.tech?.length ?? 0) - shown.length;
  return (
    <article
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-200 hover:border-line-strong has-[button:focus-visible]:border-accent-ink"
    >
      {/* Mouse glow: follows the pointer, mouse only (hover variants are hover-capable devices only). */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(440px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--accent-ink) 16%, transparent), transparent 65%)",
        }}
      />
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
        <ProjectPreview p={p} zoom />
        {p.imageUrl && (
          // Sits above the card-wide details button, so it opens just the image.
          <button
            type="button"
            onClick={() => onZoom({ src: p.imageUrl, alt: `Screenshot of ${p.title}` })}
            aria-label={`View ${p.title} screenshot full size`}
            title="View full size"
            className="absolute bottom-3 right-3 z-20 grid size-9 cursor-zoom-in place-items-center rounded-lg border border-line bg-surface/90 text-ink transition-opacity duration-150 hover:border-line-strong focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <FiMaximize2 aria-hidden className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-8">
        {p.company && <p className="font-mono text-xs text-muted">{p.company}</p>}
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          <button
            type="button"
            onClick={onOpen}
            aria-haspopup="dialog"
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {p.title}
          </button>
        </h3>
        <p className="mt-3 line-clamp-2 text-muted">{p.summary}</p>
        {shown.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {shown.map((t) => (
              <li key={t} className={tag}>
                {t}
              </li>
            ))}
            {hidden > 0 && <li className={tag}>+{hidden}</li>}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-6 pt-7 text-sm font-medium">
          <span aria-hidden className="text-ink underline decoration-line-strong underline-offset-4 group-hover:decoration-accent-ink">
            View details
          </span>
          <span className="relative z-10 flex flex-wrap gap-6">
            <ProjectLinks p={p} />
          </span>
        </div>
      </div>
    </article>
  );
}

function ZoomHint() {
  return (
    <span
      aria-hidden
      className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-lg border border-line bg-surface/90 text-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <FiMaximize2 className="size-4" />
    </span>
  );
}

// Full-size view of one image. A dialog of its own, so it can open on top of the project dialog.
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={alt}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      className="lightbox m-auto max-h-none max-w-none overflow-visible bg-transparent p-0"
    >
      <div className="flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close image"
          className="grid size-10 place-items-center rounded-lg border border-white/15 bg-black/50 text-white transition-colors duration-150 hover:bg-black/70"
        >
          <FiX aria-hidden className="size-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-h-[85vh] max-w-[92vw] rounded-xl border border-white/10 object-contain" />
      </div>
    </dialog>
  );
}

function ProjectDialog({ p, onClose, onZoom }: { p: Project; onClose: () => void; onZoom: (img: { src: string; alt: string }) => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  // showModal gives us the focus trap, Esc to close and the backdrop for free.
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="project-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close(); // a click on the backdrop
      }}
      className="details m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-ink"
    >
      <div className={`relative overflow-hidden border-b border-line ${p.imageUrl ? "aspect-[16/9]" : "aspect-[16/6]"}`}>
        {p.imageUrl ? (
          <button
            type="button"
            onClick={() => onZoom({ src: p.imageUrl, alt: `Screenshot of ${p.title}` })}
            aria-label="View screenshot full size"
            className="group relative block size-full cursor-zoom-in"
          >
            <ProjectPreview p={p} />
            <ZoomHint />
          </button>
        ) : (
          <ProjectPreview p={p} />
        )}
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close project details"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg border border-line bg-surface/90 text-muted transition-colors duration-150 hover:text-ink"
        >
          <FiX aria-hidden className="size-5" />
        </button>
      </div>

      <div className="p-6 md:p-10">
        {p.company && <p className="font-mono text-xs text-muted">Built at {p.company}</p>}
        <h2 id="project-title" className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {p.title}
        </h2>
        <p className="mt-4 max-w-[64ch] text-lg">{p.summary}</p>

        {p.description && (
          <div className="mt-8 border-t border-line pt-8">
            <h3 className="font-mono text-xs text-muted">What it does</h3>
            <Points text={p.description} />
          </div>
        )}

        {p.tech?.length > 0 && (
          <div className="mt-8 border-t border-line pt-8">
            <h3 className="font-mono text-xs text-muted">Built with</h3>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {p.tech.map((t) => (
                <li key={t} className={tag}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(p.liveUrl || p.repoUrl) && (
          <div className="mt-8 flex flex-wrap gap-6 border-t border-line pt-8 font-medium">
            <ProjectLinks p={p} />
          </div>
        )}
      </div>
    </dialog>
  );
}

