"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { adminEmail, auth, db, firebaseConfigured } from "@/lib/firebase";
import { cvEducation, cvExperience, cvProjects, experienceOrder } from "@/lib/cv";
import { emptyProfile, loadEducation, loadExperience, loadProfile, loadProjects } from "@/lib/data";
import { socialLinks, type Education, type Experience, type Profile, type Project } from "@/lib/types";

type Tab = "profile" | "projects" | "experience" | "education" | "backup";

// Everything the site shows lives in these Firestore places; the backup copies all of them.
const collections = ["projects", "experience", "education"] as const;

const input = "w-full rounded-md border border-line bg-surface px-3 py-2 focus:border-accent";
const button = "rounded-md bg-accent px-4 py-2 font-medium text-white hover:brightness-110 disabled:opacity-50";
const ghost = "rounded-md border border-line px-4 py-2 hover:border-accent";

export default function Admin() {
  // Without Firebase there is no one to wait for, so start signed out instead of "checking".
  const [user, setUser] = useState<User | null | undefined>(auth ? undefined : null);
  const [tab, setTab] = useState<Tab>("projects");

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!firebaseConfigured) {
    return (
      <Shell>
        <p>
          Firebase isn&apos;t configured yet. Copy <b>.env.local.example</b> to <b>.env.local</b>, fill in your
          Firebase values, and restart the dev server.
        </p>
      </Shell>
    );
  }
  if (user === undefined) {
    return (
      <Shell>
        <p className="text-muted">Checking sign-in…</p>
      </Shell>
    );
  }

  const allowed = user && user.email?.toLowerCase() === adminEmail;
  if (!user || !allowed) {
    return (
      <Shell>
        {user && (
          <p className="mb-4 text-red-300">
            {user.email} isn&apos;t allowed to edit this site. Sign in with the admin account.
          </p>
        )}
        <button className={button} onClick={() => signInWithPopup(auth!, new GoogleAuthProvider())}>
          Sign in with Google
        </button>
        {user && (
          <button className={`${ghost} ml-3`} onClick={() => signOut(auth!)}>
            Sign out
          </button>
        )}
      </Shell>
    );
  }

  return (
    <Shell wide>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["projects", "experience", "education", "profile", "backup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-2 capitalize ${
                tab === t ? "bg-surface text-ink ring-1 ring-accent" : "text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <Link className="hover:text-ink" href="/">
            View site
          </Link>
          <button className="hover:text-ink" onClick={() => signOut(auth!)}>
            Sign out
          </button>
        </div>
      </div>
      {tab === "profile" && <ProfileForm />}
      {tab === "projects" && <ProjectsAdmin />}
      {tab === "experience" && <ExperienceAdmin />}
      {tab === "education" && <EducationAdmin />}
      {tab === "backup" && <BackupAdmin />}
    </Shell>
  );
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className={`mx-auto px-6 py-12 ${wide ? "max-w-4xl" : "max-w-xl"}`}>
      <h1 className="font-display mb-8 text-3xl font-semibold">Site admin</h1>
      {children}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

function useSaveState() {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const run = async (fn: () => Promise<void>) => {
    setState("saving");
    try {
      await fn();
      setState("saved");
    } catch (e) {
      console.error(e);
      setState("error");
    }
  };
  const label = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Couldn't save. Check you're signed in and the rules are deployed.",
  }[state];
  return { run, label, saving: state === "saving" };
}

// Firebase Storage needs a paid plan, so screenshots are shrunk and kept in the Firestore document itself.
async function imageToDataUrl(file: File, maxSide = 1600) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

/* ---------- Profile ---------- */

function ProfileForm() {
  const [p, setP] = useState<Profile>(emptyProfile);
  const s = useSaveState();
  useEffect(() => {
    loadProfile().then(setP);
  }, []);
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setP({ ...p, [k]: e.target.value });

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        s.run(() => setDoc(doc(db!, "profile", "main"), p));
      }}
    >
      <Field label="Name">
        <input className={input} value={p.name} onChange={set("name")} />
      </Field>
      <Field label="Title">
        <input className={input} value={p.title} onChange={set("title")} />
      </Field>
      <Field label="Based in">
        <input className={input} value={p.location ?? ""} onChange={set("location")} />
      </Field>
      <div />
      <div className="md:col-span-2">
        <Field label="Headline">
          <input className={input} value={p.headline} onChange={set("headline")} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Line under the headline">
          <textarea rows={2} className={input} value={p.intro ?? ""} onChange={set("intro")} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="About me">
          <textarea rows={6} className={input} value={p.about} onChange={set("about")} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Skills (one group per line, e.g. Databases: PostgreSQL, MySQL)">
          <textarea rows={4} className={input} value={p.skills} onChange={set("skills")} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="What I work on (one area per line, e.g. Backend systems: what you do there)">
          <textarea rows={4} className={input} value={p.focus ?? ""} onChange={set("focus")} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Your picture">
          <input
            type="file"
            accept="image/*"
            className={input}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) s.run(async () => setP({ ...p, photoUrl: await imageToDataUrl(f, 1000) }));
            }}
          />
        </Field>
        {p.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoUrl} alt="Your picture preview" className="mt-3 max-h-48 rounded-md border border-line" />
        )}
      </div>
      <Field label="Email">
        <input className={input} value={p.email} onChange={set("email")} />
      </Field>
      {socialLinks.map((l) => (
        <Field key={l.key} label={`${l.label} URL`}>
          <input className={input} value={p[l.key]} onChange={set(l.key)} />
        </Field>
      ))}
      <Field label="CV link (e.g. /cv.pdf or a Google Drive link)">
        <input className={input} value={p.cvUrl} onChange={set("cvUrl")} />
      </Field>
      <div className="flex items-center gap-4 md:col-span-2">
        <button className={button} disabled={s.saving}>
          Save profile
        </button>
        <span className="text-sm text-muted">{s.label}</span>
      </div>
    </form>
  );
}

/* ---------- Projects ---------- */

const blankProject: Omit<Project, "id"> = {
  title: "",
  company: "",
  summary: "",
  description: "",
  tech: [],
  liveUrl: "",
  repoUrl: "",
  imageUrl: "",
  order: 0,
};

function ProjectsAdmin() {
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const importing = useSaveState();
  const refresh = useCallback(() => loadProjects().then(setItems), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (editing) {
    return (
      <ProjectForm
        initial={editing}
        onDone={() => {
          setEditing(null);
          refresh();
        }}
      />
    );
  }
  return (
    <>
      <button className={`${button} mb-6`} onClick={() => setEditing({ id: "", ...blankProject, order: items.length })}>
        Add project
      </button>
      {items.length === 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-muted">No projects yet. Add your first one, or bring in your prepared projects.</p>
          <button
            className={ghost}
            disabled={importing.saving}
            onClick={() =>
              importing.run(async () => {
                for (const p of cvProjects) await addDoc(collection(db!, "projects"), p);
                await refresh();
              })
            }
          >
            Add prepared projects
          </button>
          <span className="text-sm text-muted">{importing.label}</span>
        </div>
      )}
      <ul className="divide-y divide-line">
        {items.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-muted">
                Position {p.order + 1}
                {p.order === 0 && " (featured)"}
              </p>
            </div>
            <div className="flex gap-2">
              <button className={ghost} onClick={() => setEditing(p)}>
                Edit
              </button>
              <button
                className={ghost}
                onClick={async () => {
                  if (confirm(`Delete "${p.title}"? This can't be undone.`)) {
                    await deleteDoc(doc(db!, "projects", p.id));
                    refresh();
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function ProjectForm({ initial, onDone }: { initial: Project; onDone: () => void }) {
  const [p, setP] = useState(initial);
  const [tech, setTech] = useState(initial.tech.join(", "));
  const s = useSaveState();
  const set = (k: keyof Project) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setP({ ...p, [k]: k === "order" ? Number(e.target.value) - 1 : e.target.value });

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        s.run(async () => {
          const { id, ...data } = { ...p, tech: tech.split(",").map((t) => t.trim()).filter(Boolean) };
          if (id) await setDoc(doc(db!, "projects", id), data);
          else await addDoc(collection(db!, "projects"), data);
          onDone();
        });
      }}
    >
      <Field label="Title">
        <input required className={input} value={p.title} onChange={set("title")} />
      </Field>
      <Field label="Built at (company, leave empty if personal)">
        <input className={input} value={p.company ?? ""} onChange={set("company")} />
      </Field>
      <Field label="Position (1 is featured)">
        <input type="number" min={1} className={input} value={p.order + 1} onChange={set("order")} />
      </Field>
      <div className="md:col-span-2">
        <Field label="One-line summary">
          <input required className={input} value={p.summary} onChange={set("summary")} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Details">
          <textarea rows={5} className={input} value={p.description} onChange={set("description")} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Technologies (comma separated)">
          <input className={input} value={tech} onChange={(e) => setTech(e.target.value)} />
        </Field>
      </div>
      <Field label="Live URL">
        <input className={input} value={p.liveUrl} onChange={set("liveUrl")} />
      </Field>
      <Field label="Code URL">
        <input className={input} value={p.repoUrl} onChange={set("repoUrl")} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Screenshot">
          <input
            type="file"
            accept="image/*"
            className={input}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) s.run(async () => setP({ ...p, imageUrl: await imageToDataUrl(f) }));
            }}
          />
        </Field>
        {p.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt="Screenshot preview" className="mt-3 max-h-48 rounded-md border border-line" />
        )}
      </div>
      <div className="flex items-center gap-4 md:col-span-2">
        <button className={button} disabled={s.saving}>
          Save project
        </button>
        <button type="button" className={ghost} onClick={onDone}>
          Cancel
        </button>
        <span className="text-sm text-muted">{s.label}</span>
      </div>
    </form>
  );
}

/* ---------- Experience ---------- */

const blankExp: Omit<Experience, "id"> = {
  role: "",
  company: "",
  location: "",
  start: "",
  end: "",
  summary: "",
  order: 0,
};

function ExperienceAdmin() {
  const [items, setItems] = useState<Experience[]>([]);
  const [editing, setEditing] = useState<Experience | null>(null);
  const importing = useSaveState();
  const refresh = useCallback(() => loadExperience().then(setItems), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (editing) {
    return (
      <ExperienceForm
        initial={editing}
        onDone={() => {
          setEditing(null);
          refresh();
        }}
      />
    );
  }

  return (
    <>
      <button className={`${button} mb-6`} onClick={() => setEditing({ id: "", ...blankExp })}>
        Add role
      </button>
      {items.length === 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-muted">No roles yet. Add your first one, or bring in the roles from your CV.</p>
          <button
            className={ghost}
            disabled={importing.saving}
            onClick={() =>
              importing.run(async () => {
                for (const x of cvExperience) {
                  await addDoc(collection(db!, "experience"), { ...x, order: experienceOrder(x.start) });
                }
                await refresh();
              })
            }
          >
            Add roles from CV
          </button>
          <span className="text-sm text-muted">{importing.label}</span>
        </div>
      )}
      <ul className="divide-y divide-line">
        {items.map((x) => (
          <li key={x.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">
                {x.role}, {x.company}
              </p>
              <p className="text-sm text-muted">
                {x.start} to {x.end || "present"}
              </p>
            </div>
            <div className="flex gap-2">
              <button className={ghost} onClick={() => setEditing(x)}>
                Edit
              </button>
              <button
                className={ghost}
                onClick={async () => {
                  if (confirm(`Delete "${x.role}"? This can't be undone.`)) {
                    await deleteDoc(doc(db!, "experience", x.id));
                    refresh();
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function ExperienceForm({ initial, onDone }: { initial: Experience; onDone: () => void }) {
  const [x, setX] = useState(initial);
  const s = useSaveState();
  const set = (k: keyof Experience) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setX({ ...x, [k]: e.target.value });

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        s.run(async () => {
          const { id, ...data } = { ...x, order: experienceOrder(x.start) };
          if (id) await setDoc(doc(db!, "experience", id), data);
          else await addDoc(collection(db!, "experience"), data);
          onDone();
        });
      }}
    >
      <Field label="Role">
        <input required className={input} value={x.role} onChange={set("role")} />
      </Field>
      <Field label="Company">
        <input required className={input} value={x.company} onChange={set("company")} />
      </Field>
      <Field label="Location">
        <input className={input} value={x.location} onChange={set("location")} />
      </Field>
      <div />
      <Field label="Start month">
        <input required type="month" className={input} value={x.start} onChange={set("start")} />
      </Field>
      <Field label="End month (leave empty if current)">
        <input type="month" className={input} value={x.end} onChange={set("end")} />
      </Field>
      <div className="md:col-span-2">
        <Field label="What you did">
          <textarea rows={5} className={input} value={x.summary} onChange={set("summary")} />
        </Field>
      </div>
      <div className="flex items-center gap-4 md:col-span-2">
        <button className={button} disabled={s.saving}>
          Save role
        </button>
        <button type="button" className={ghost} onClick={onDone}>
          Cancel
        </button>
        <span className="text-sm text-muted">{s.label}</span>
      </div>
    </form>
  );
}

/* ---------- Education ---------- */

const blankEdu: Omit<Education, "id"> = {
  qualification: "",
  school: "",
  location: "",
  end: "",
  note: "",
  order: 0,
};

function EducationAdmin() {
  const [items, setItems] = useState<Education[]>([]);
  const [editing, setEditing] = useState<Education | null>(null);
  const importing = useSaveState();
  const refresh = useCallback(() => loadEducation().then(setItems), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  if (editing) {
    return (
      <EducationForm
        initial={editing}
        onDone={() => {
          setEditing(null);
          refresh();
        }}
      />
    );
  }

  return (
    <>
      <button className={`${button} mb-6`} onClick={() => setEditing({ id: "", ...blankEdu })}>
        Add education
      </button>
      {items.length === 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-muted">No education yet. Add one, or bring in the entries from your CV.</p>
          <button
            className={ghost}
            disabled={importing.saving}
            onClick={() =>
              importing.run(async () => {
                for (const x of cvEducation) {
                  await addDoc(collection(db!, "education"), { ...x, order: experienceOrder(x.end) });
                }
                await refresh();
              })
            }
          >
            Add education from CV
          </button>
          <span className="text-sm text-muted">{importing.label}</span>
        </div>
      )}
      <ul className="divide-y divide-line">
        {items.map((x) => (
          <li key={x.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">{x.qualification}</p>
              <p className="text-sm text-muted">
                {x.school}
                {x.end && `, ${x.end}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button className={ghost} onClick={() => setEditing(x)}>
                Edit
              </button>
              <button
                className={ghost}
                onClick={async () => {
                  if (confirm(`Delete "${x.qualification}"? This can't be undone.`)) {
                    await deleteDoc(doc(db!, "education", x.id));
                    refresh();
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function EducationForm({ initial, onDone }: { initial: Education; onDone: () => void }) {
  const [x, setX] = useState(initial);
  const s = useSaveState();
  const set = (k: keyof Education) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setX({ ...x, [k]: e.target.value });

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        s.run(async () => {
          // Newest first, by the month it was finished.
          const { id, ...data } = { ...x, order: experienceOrder(x.end) };
          if (id) await setDoc(doc(db!, "education", id), data);
          else await addDoc(collection(db!, "education"), data);
          onDone();
        });
      }}
    >
      <div className="md:col-span-2">
        <Field label="Qualification (e.g. Advanced Diploma in Software Engineering)">
          <input required className={input} value={x.qualification} onChange={set("qualification")} />
        </Field>
      </div>
      <Field label="School">
        <input required className={input} value={x.school} onChange={set("school")} />
      </Field>
      <Field label="Location">
        <input className={input} value={x.location} onChange={set("location")} />
      </Field>
      <Field label="Month finished">
        <input required type="month" className={input} value={x.end} onChange={set("end")} />
      </Field>
      <div />
      <div className="md:col-span-2">
        <Field label="Focus or coursework (one short line)">
          <textarea rows={2} className={input} value={x.note} onChange={set("note")} />
        </Field>
      </div>
      <div className="flex items-center gap-4 md:col-span-2">
        <button className={button} disabled={s.saving}>
          Save education
        </button>
        <button type="button" className={ghost} onClick={onDone}>
          Cancel
        </button>
        <span className="text-sm text-muted">{s.label}</span>
      </div>
    </form>
  );
}

/* ---------- Backup ---------- */

type Backup = {
  exportedAt: string;
  profile: Record<string, unknown> | null;
} & Record<(typeof collections)[number], { id: string; data: Record<string, unknown> }[]>;

function BackupAdmin() {
  const download = useSaveState();
  const restore = useSaveState();
  const [note, setNote] = useState("");

  return (
    <div className="grid max-w-2xl gap-10">
      <section>
        <h2 className="font-display text-xl font-semibold">Download a backup</h2>
        <p className="mt-2 text-muted">
          Saves your profile, projects, experience and education (pictures included) to one file on this computer. Do
          this before big edits.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button
            className={button}
            disabled={download.saving}
            onClick={() =>
              download.run(async () => {
                const profile = await getDoc(doc(db!, "profile", "main"));
                const backup = { exportedAt: new Date().toISOString(), profile: profile.exists() ? profile.data() : null } as Backup;
                for (const name of collections) {
                  const snap = await getDocs(collection(db!, name));
                  backup[name] = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
                }
                const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
                const a = document.createElement("a");
                a.href = url;
                a.download = `portfolio-backup-${backup.exportedAt.slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              })
            }
          >
            Download backup
          </button>
          <span className="text-sm text-muted">{download.label}</span>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Restore from a backup</h2>
        <p className="mt-2 text-muted">
          Puts back everything in a backup file. Entries in the file replace the ones with the same identity; anything you
          added after the backup is kept.
        </p>
        <input
          type="file"
          accept="application/json,.json"
          className={`${input} mt-4`}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            restore.run(async () => {
              const backup = JSON.parse(await f.text()) as Backup;
              if (!("profile" in backup) || !collections.every((n) => Array.isArray(backup[n]))) {
                throw new Error("This file isn't a portfolio backup.");
              }
              const counts = collections.map((n) => `${backup[n].length} ${n}`).join(", ");
              if (!confirm(`Restore the backup from ${backup.exportedAt.slice(0, 10)} (profile, ${counts})?`)) return;
              if (backup.profile) await setDoc(doc(db!, "profile", "main"), backup.profile);
              for (const name of collections) {
                for (const item of backup[name]) await setDoc(doc(db!, name, item.id), item.data);
              }
              setNote(`Restored the backup from ${backup.exportedAt.slice(0, 10)}.`);
            });
          }}
        />
        <p className="mt-2 text-sm text-muted">{restore.label === "Saved" ? note : restore.label}</p>
      </section>
    </div>
  );
}
