# 🏗️ RIS Portfolio — Riyaz Ibrahim Shaikh

> **Live Civil Engineering Portfolio with Full CMS, Neon PostgreSQL Backend & Netlify Serverless Functions**

![Navy Gold Portfolio Banner](https://img.shields.io/badge/Design-Navy%20%2B%20Gold-c9a84c?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.3-646cff?style=for-the-badge&logo=vite)
![Netlify](https://img.shields.io/badge/Netlify-Deployed-00c7b7?style=for-the-badge&logo=netlify)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00e699?style=for-the-badge&logo=postgresql)

---

## 📌 Project Overview

A production-grade, fully dynamic **professional portfolio website** built for **Riyaz Ibrahim Shaikh**, a Senior Civil Engineer and Project Manager with 15+ years of experience across Saudi Arabia and India — working on landmark projects for Saudi Aramco, GACA (King Abdul Aziz International Airport), KAUST, and more.

The portfolio is purpose-built for the **Gulf construction market** — designed to instantly communicate credibility to contractors, consultants, and procurement teams in KSA, UAE, and across the GCC. It is not a static brochure. Every piece of content — text, images, projects, certifications, gallery photos — is **live-editable directly from the website** by the client, without touching a single line of code.

---

## 🌐 Live Demo

🔗 **[riyaz-portfolio.netlify.app](https://riyaz-portfolio.netlify.app)**

---

## ✨ Features

### 🎨 Frontend & Design
- **Navy + Gold Gulf aesthetic** — crafted specifically for the Middle East construction industry where visual authority and professional gravitas matter
- **Bold typographic hero** with animated stats overlay (years of experience, projects, KSA tenure)
- **Fully responsive** — works on desktop, tablet, and mobile
- **Smooth scroll navigation** with active section detection via Intersection Observer
- **Lightbox gallery** with previous/next navigation for project photos and site images
- **CSS animations** — fade-up entry, pulse effects on CTAs, hover transitions on all cards
- **Custom Google Fonts** (Playfair Display + Lato) for a refined editorial feel
- **No UI framework** — 100% hand-crafted styles for full design control

### 📄 Portfolio Sections
| Section | What It Shows |
|---|---|
| **Hero** | Name, title, tagline, live stat counters, PM Training badge |
| **About** | Portrait photo, bio, contact details, Aramco ID, BNCMC Valuer status |
| **Work Experience** | 7 roles across 24 years in 2-column card grid |
| **Notable Projects** | 8 landmark projects with photos, client, tags, descriptions |
| **Education & Certifications** | Degrees, trade certs, training certificates |
| **Courses & Software** | 10 technical courses, software proficiency badges |
| **Project Gallery** | Uploadable photo gallery with captions, lightbox viewer |
| **Codes & Standards** | ARAMCO, ASTM, ACI, IBC/UBC, BS, SEC-EOA — signals Gulf compliance |
| **Contact** | Phone, email, Skype, driving license info, message form |

### 🔐 Admin Edit Mode (CMS)
The standout feature of this project. See the full breakdown [below](#-admin-edit-mode--built-in-cms).

### 🗄️ Backend & Database
- **Netlify Serverless Functions** — three dedicated API endpoints, no Express server needed
- **Neon PostgreSQL** — serverless, auto-scaling database provisioned directly via Netlify integration
- **8 normalised database tables** with `sort_order` support on every collection
- All SQL uses **parameterised queries** — no raw string interpolation, no SQL injection risk
- Table names are **whitelisted server-side** to prevent injection via the API payload
- Parallel `Promise.all()` queries on the read endpoint for maximum performance

---

## 🔐 Admin Edit Mode — Built-in CMS

This is the feature that makes this portfolio genuinely useful to the client long-term. Rather than asking a developer to update the website every time something changes, **Riyaz can manage his own portfolio** from any browser, anywhere in the world.

### How It Works

A **🔒 Admin Edit** button sits in the bottom-right corner of the live site at all times. Clicking it prompts for a password. The password is **never stored in the frontend code** — it lives exclusively in a Netlify environment variable and is verified server-side on every request.

Once authenticated:

#### ✏️ Inline Text Editing
Every piece of text on the site becomes **click-to-edit**. A small pencil icon (✎) appears on hover. Clicking opens an inline input or textarea — the user edits the text and clicks Save. The change is immediately written to the PostgreSQL database and the UI refreshes.

This covers:
- Hero name, title, tagline
- Professional bio
- Every experience entry (role, company, location, year, description)
- Every project (title, client, category, description)
- Every education and certification entry
- Every course name and detail
- Hero stat counters (the numbers)

#### 🖼️ Image Uploading
- **Project cards** — hover over any project image to reveal an upload button. Select a photo from your device, it uploads as base64 and saves to the database instantly.
- **Gallery section** — dedicated upload button adds new photos with optional captions. The gallery supports unlimited photos with lightbox viewing.
- **Portrait photo** — the About section has a dedicated portrait slot. Click to upload, updates live.

#### ➕ Adding New Records
While in edit mode, every section shows a dashed **"+ Add"** card at the end:
- Add a new job to the experience timeline
- Add a new project with all its details
- Add a new qualification or certification
- Add a new course
- Add a new gallery image with caption
- Add a new code/standard badge

Each opens a clean modal form. Fill in the fields, click Save — the record is inserted into the database and appears on the page immediately.

#### 🗑️ Deleting Records
Every card in edit mode shows a red trash icon. One click → confirmation prompt → deleted from the database permanently.

#### 🔒 Security Model
- Password verified via `POST /api/auth` — **server-side only**, never exposed in client bundle
- Every mutation (`/api/update`) checks the `x-admin-password` header on the server
- A 400ms artificial delay on failed login attempts slows brute-force attacks
- Constant-time string comparison prevents timing-based password attacks
- Admin password stored exclusively in **Netlify environment variables**

#### 💡 Why This Matters for the Client
A civil engineer's portfolio needs to stay current. Projects complete, new ones begin. Certifications get renewed. Contact details change. Without an edit feature, a portfolio becomes stale within months and the client depends on a developer for every small change — which is expensive and slow. This CMS gives Riyaz **full autonomy** over his professional presence, from any device, with no technical knowledge required.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI component framework |
| **Vite** | 5.3 | Build tool and dev server |
| **Playfair Display + Lato** | Google Fonts | Typography — editorial serif + clean sans |
| **Vanilla CSS-in-JS** | — | All styles inline / global style tag, no external CSS library |
| **Intersection Observer API** | Native | Scroll-spy for active nav link |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Netlify Functions** | Node 18 ESM | Serverless API — no server to manage or pay for |
| **@neondatabase/serverless** | 0.9.3 | Neon PostgreSQL driver optimised for serverless/edge |
| **Neon PostgreSQL** | — | Serverless, auto-scaling relational database |

### Infrastructure & DevOps
| Service | Purpose |
|---|---|
| **Netlify** | Hosting, CI/CD, serverless functions, env var management |
| **Neon** | Serverless PostgreSQL — provisioned via Netlify integration |
| **GitHub** | Source control and auto-deploy trigger |
| **Netlify Environment Variables** | Secure storage for `DATABASE_URL` and `ADMIN_PASSWORD` |

### Dev Tools
| Tool | Purpose |
|---|---|
| **VS Code** | Editor |
| **Git** | Version control |
| **dotenv** | Local `.env` loading for dev environment |

---

## 🗃️ Database Schema

8 normalised PostgreSQL tables:

```
personal_info    key-value store for all personal/contact fields
stats            hero section stat counters (value + label)
experience       work history with sort_order
projects         portfolio projects with tags (TEXT[]) and image_url
education        degrees and certifications
courses          software and training courses
gallery          photo gallery with captions
standards        engineering codes & standards badges
```

All collection tables include a `sort_order INT` column and `created_at TIMESTAMPTZ` for auditing. The `standards` table uses `name` as its unique key (not a numeric id) since standards are identified by their name.

---

## 📁 Project Structure

```
riyaz-portfolio/
├── src/
│   ├── main.jsx                    React entry point
│   └── App.jsx                     Full portfolio — UI, state, API calls, edit mode
├── netlify/
│   └── functions/
│       ├── portfolio.js            GET  /api/portfolio  — public, parallel queries
│       ├── auth.js                 POST /api/auth       — password verification
│       └── update.js               POST /api/update     — all authenticated mutations
├── db/
│   ├── schema.sql                  DDL — create all 8 tables
│   ├── seed.sql                    Pure SQL seed — paste directly into Neon SQL Editor
│   └── seed.js                     Node seed script (for local use with .env)
├── index.html                      Vite entry HTML
├── vite.config.js                  Vite config — port 3000, auto open
├── netlify.toml                    Build config, function dir, redirects, SPA fallback
├── package.json                    Dependencies and scripts
├── .env.example                    Safe-to-commit env variable template
├── .gitignore                      Excludes .env, node_modules, dist
└── START-HERE.md                   Plain-English setup guide (no jargon)
```

---

## 🚧 Problems Encountered & How They Were Fixed

### 1. `npm run dev` gave "localhost not found"
**Problem:** The initial `package.json` had `netlify dev` as the dev command, which requires the Netlify CLI to be installed globally. Running it without the CLI caused the server to silently fail and the browser to show a blank "not found" page.

**Fix:** Changed `npm run dev` to run plain `vite` directly — no CLI dependency needed for local development. Netlify CLI is only needed if you want to test serverless functions locally, which is optional.

---

### 2. Netlify created `NETLIFY_DATABASE_URL` but code expected `DATABASE_URL`
**Problem:** When the Neon integration is provisioned through Netlify (rather than manually), Netlify names the injected environment variable `NETLIFY_DATABASE_URL` — not the standard `DATABASE_URL` that the functions were written to use. This caused all API calls to return 500 errors on the live site.

**Fix:** Updated all three Netlify functions to use `process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL` — so the code works whether the variable comes from Netlify's auto-provisioning or a manually set env var. The guard check was also corrected to `!NETLIFY_DATABASE_URL && !DATABASE_URL` (AND, not OR) so it only errors when neither is present.

---

### 3. Deleting a Code/Standard always returned "id required for delete"
**Problem:** The `standards` table doesn't have a numeric `id` used for deletion — it uses `name` as its unique identifier. The delete handler in `update.js` had a blanket `if (!id) return error` check at the top of the delete block, which ran before the code even checked which table was being targeted. So standards deletion was always rejected.

**Fix:** Restructured the delete block to check the table name first. If `table === "standards"`, it validates `data.name` and deletes by name. For all other tables, it validates and uses `id`. The guard logic now matches the actual data model of each table.

---

### 4. Git push rejected — `src refspec main does not match any`
**Problem:** Git initialised the local repo with a branch named `master` (older Git default), but GitHub expected `main`. The push failed because the remote had no `master` branch to push to.

**Fix:** One command — `git branch -M main` — renames the local branch to `main`, after which `git push -u origin main` succeeds.

---

### 5. Portrait photo had no display slot in the UI
**Problem:** The `personal_info` table had a `photoUrl` key and the seed data included it, but the About section in the frontend never actually rendered it — there was no `<img>` tag or upload trigger for the portrait.

**Fix:** Added a dedicated portrait slot to the About section left column — a `3:4` aspect ratio container that shows a placeholder in view mode and a click-to-upload label in edit mode. The upload converts the image to base64 and saves it via `savePersonal("photoUrl")`, exactly like other personal fields.

---

## 🔑 Environment Variables

| Variable | Where Set | Description |
|---|---|---|
| `NETLIFY_DATABASE_URL` | Auto-set by Netlify/Neon integration | PostgreSQL connection string |
| `DATABASE_URL` | Manual fallback (local `.env`) | Same — used when running locally |
| `ADMIN_PASSWORD` | Netlify Environment Variables | Password for edit mode — never in code |

> ⚠️ **Never commit `.env`** — it is listed in `.gitignore`. Set production secrets exclusively through the Netlify dashboard.

---

## 🚀 Local Development Setup

```bash
# 1. Clone
git clone https://github.com/zebwoy/RIS_Portfolio.git
cd RIS_Portfolio

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env
# Fill in DATABASE_URL and ADMIN_PASSWORD in .env

# 4. Seed the database (optional — uses fallback data if skipped)
node db/seed.js

# 5. Start dev server
npm run dev
# Opens automatically at http://localhost:3000
```

---

## 📦 Deployment

This project auto-deploys to Netlify on every `git push` to `main`.

Manual deploy:
```bash
npm run build      # outputs to /dist
# Push to GitHub — Netlify picks it up automatically
```

Environment variables are managed under **Netlify → Site Settings → Environment Variables**. Never in code.

---

## 👤 About the Client

**Riyaz Ibrahim Shaikh** is a Senior Civil & Structural Engineer based in India with 14 years of experience working across Saudi Arabia on major Gulf infrastructure. His project portfolio includes:

- King Abdul Aziz International Airport, Jeddah (GACA)
- Khursaniyah Gas Plant — Saudi Aramco
- KAUST Housing Expansion — Al Bawani
- Rabigh Development Project — Saudi Aramco
- Hospital Projects — NESMA & Partners
- Makkah Hotel Project

Certified in Project Management training (Eng. Wissam Osta, PMI ID: 2052385). Registered BNCMC Valuer. Holds valid Saudi and Indian driving licenses.

---

## 📄 License

This project was custom-built for Riyaz Ibrahim Shaikh. The codebase is shared publicly for portfolio and demonstration purposes. Please do not reuse the client's personal data or CV content.

---

*Built with React, Vite, Netlify Functions, and Neon PostgreSQL.*
