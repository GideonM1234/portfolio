# Gideon Michael portfolio

Personal site for Gideon Michael (GM), software engineer in Lagos, Nigeria.

Built with Next.js as a static export and hosted on Firebase Hosting. There is no backend code: the profile, projects, work experience and education live in Firestore and load in the browser, and everything is edited from `/admin` after signing in with Google.

## How it fits together

| Part | Where |
| --- | --- |
| Public page | `app/page.tsx` |
| Admin (edit content, backups) | `app/admin/page.tsx`, only the account in `NEXT_PUBLIC_ADMIN_EMAIL` can sign in and write |
| Reading Firestore, defaults | `lib/data.ts` |
| One-click imports from the CV | `lib/cv.ts` |
| SEO: title, description, share card, robots, sitemap | `lib/site.ts`, `app/layout.tsx`, `app/opengraph-image.tsx`, `app/robots.ts`, `app/sitemap.ts` |
| Colours, fonts, light and dark themes | `app/globals.css` |
| Who can read and write | `firestore.rules` (anyone reads, only the admin email writes) |

Pictures (profile photo, project screenshots) are resized in the browser and stored inside the Firestore documents, so the project runs on Firebase's free Spark plan without Cloud Storage. The CV is a link: put the PDF in `public/cv.pdf` and set the CV link to `/cv.pdf`, or use a Google Drive link.

## Set up on a new machine

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in the Firebase web app values (Firebase console > Project settings > Your apps).
3. Deploy the database rules once, and again whenever `firestore.rules` changes:
   ```
   npm i -g firebase-tools
   firebase login
   firebase use gideon-portfolio-84595
   firebase deploy --only firestore:rules
   ```

## Work on it

```
npm run dev
```

Site at http://localhost:3000, admin at http://localhost:3000/admin.

If a style change doesn't show up while the dev server is running (it happens with projects inside OneDrive), stop it with Ctrl+C and start it again.

## Publish

```
npm run build
firebase deploy --only hosting
```

The site goes to https://gideon-portfolio-84595.web.app.

### Using your own domain

1. Firebase console > Hosting > Add custom domain, and follow the DNS steps.
2. Firebase console > Authentication > Settings > Authorized domains: add the domain, or Google sign-in on `/admin` won't work there.
3. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the new address, then build and deploy again so the SEO tags, sitemap and share card use it.

After the first deploy, add the site in Google Search Console and submit `/sitemap.xml`.

## Backups

Admin > Backup > **Download backup** saves the profile, projects, experience and education (pictures included) to a JSON file. **Restore from a backup** puts that content back. Download one before big edits.

Keep `/admin` open in only one tab while editing: saving the profile replaces the whole profile with what that tab's form holds.
