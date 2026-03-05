/**
 * db/seed.js
 * Seeds the Neon database with Riyaz's initial portfolio data.
 *
 * Usage (run once after creating the schema):
 *   node db/seed.js
 *
 * Requires .env with DATABASE_URL set.
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config(); // load .env

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL not found in .env");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱  Seeding Riyaz portfolio database…\n");

  // ── personal_info ─────────────────────────────────────────────
  const personal = {
    name:        "Riyaz Ibrahim Shaikh",
    title:       "Senior Civil Engineer & Project Coordinator",
    tagline:     "15+ Years of Engineering Excellence Across the Gulf",
    phone1:      "+91 7499145184",
    phone2:      "+91 8779185464",
    email:       "riyazibrahim2008@gmail.com",
    skype:       "riyazibrahim2008@gmail.com",
    passport:    "V2795500 (Valid until Aug 2031)",
    aramcoId:    "8012199",
    licenseNo:   "T.P./SUP-II/567",
    nationality: "Indian",
    dob:         "19 June 1967",
    photoUrl:    "",
    bio: "A highly accomplished Civil & Structural Engineer with over 15 years of experience, " +
         "including 14 years in Saudi Arabia. Proven expertise across ARAMCO, GACA, and large-scale " +
         "infrastructure projects. PMP Certified with deep knowledge of Gulf construction standards " +
         "(ARAMCO, ASTM, ACI, IBC, BS, SEC-EOA). Skilled in structural design, project management, " +
         "drainage systems, RCC detailing, and multi-disciplinary coordination. Currently registered as a BNCMC Valuer.",
  };

  for (const [key, value] of Object.entries(personal)) {
    await sql`
      INSERT INTO personal_info (key, value)
      VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
  console.log("✅  personal_info seeded");

  // ── stats ─────────────────────────────────────────────────────
  await sql`TRUNCATE stats RESTART IDENTITY`;
  const stats = [
    { value: "15+", label: "Years Experience",     sort_order: 1 },
    { value: "14",  label: "Years in Saudi Arabia", sort_order: 2 },
    { value: "50+", label: "Major Projects",         sort_order: 3 },
    { value: "PMP", label: "Certified",              sort_order: 4 },
  ];
  for (const s of stats) {
    await sql`INSERT INTO stats (value, label, sort_order) VALUES (${s.value}, ${s.label}, ${s.sort_order})`;
  }
  console.log("✅  stats seeded");

  // ── experience ────────────────────────────────────────────────
  await sql`TRUNCATE experience RESTART IDENTITY`;
  const experience = [
    { year: "2025 – Present",      company: "Astute Buildcons",   location: "India",        role: "Project Coordinator",      sort_order: 1,
      description: "Managing construction of Shree Tisai Grand Multistoried 26-Floor Twin Tower at Kalyan East. Overseeing all phases from planning to completion, ensuring adherence to safety, quality, and environmental standards." },
    { year: "2024 – 2025",         company: "VIRJA Group",        location: "India",        role: "Construction Manager", sort_order: 2,
      description: "Construction Manager for Godrej Tower (Godrej Property) at Kalyan-Bhiwandi By-Pass. Applied PMP principles to manage timelines, budgets, and stakeholder coordination." },
    { year: "Dec 2016 – 2024",     company: "Al Bawani Company",  location: "Jeddah, KSA",  role: "Project Coordinator",  sort_order: 3,
      description: "Coordinator for KAUST Housing Expansion Project. Prepared coordinate drawings for excavation, blinding, and footing works for all 81 buildings." },
    { year: "2014 – 2016",         company: "NESMA & Partners",   location: "Saudi Arabia", role: "Structural Engineer",  sort_order: 4,
      description: "Structural Engineer contributing to hospital projects for SANGH. Responsible for structural analysis, design coordination, and drawing review." },
    { year: "May 2009 – Jun 2013", company: "Dar Al Handasah",    location: "Jeddah, KSA",  role: "Civil Engineer",       sort_order: 5,
      description: "Civil Engineer on King Abdul Aziz International Airport Development Projects (GACA). Worked on a 13-meter-deep underground tunnel beneath the runway. Led civil inspection and shop drawing review." },
    { year: "Mar 2004 – Mar 2009", company: "SOFCON",             location: "Saudi Arabia", role: "Senior Engineer",      sort_order: 6,
      description: "Senior Engineer on ARAMCO projects including Khursaniyah Gas Plant, Rabigh Development, Riyadh Refinery, and multiple substation projects. Expertise in drainage, RCC detailing, and BOQ verification." },
    { year: "Nov 2001 – Feb 2004", company: "Zedan Consultants",  location: "Saudi Arabia", role: "Civil Engineer",       sort_order: 7,
      description: "Civil Engineer on SEC-EOA substation projects across Saudi Arabia including Hawiah, Jubail #5, Thurayyah, and Safco IV substations." },
  ];
  for (const e of experience) {
    await sql`
      INSERT INTO experience (year, company, location, role, description, sort_order)
      VALUES (${e.year}, ${e.company}, ${e.location}, ${e.role}, ${e.description}, ${e.sort_order})
    `;
  }
  console.log("✅  experience seeded");

  // ── projects ──────────────────────────────────────────────────
  await sql`TRUNCATE projects RESTART IDENTITY`;
  const projects = [
    { title: "King Abdul Aziz International Airport", category: "Infrastructure", client: "GACA – Jeddah, KSA",             sort_order: 1, image_url: "", tags: ["Airport","Tunneling","Infrastructure"],
      description: "Aviation Terminal Buildings (Phase A, B & C), GSE Tunnel (13m underground), Multi-Storey Car Park, Standard & Admin Buildings, Maintenance & Dormitory Buildings." },
    { title: "Khursaniyah Gas Plant (KGP)",           category: "Oil & Gas",      client: "Saudi Aramco, KSA",              sort_order: 2, image_url: "", tags: ["ARAMCO","Oil & Gas","Drainage"],
      description: "BOQ verification for the largest Khursaniyah Gas Plant in Saudi Arabia. Drainage systems, oily water recovery, RCC detailing, and pipe supports/sleepers." },
    { title: "KAUST Housing Expansion",               category: "Residential",    client: "Al Bawani – Jeddah, KSA",        sort_order: 3, image_url: "", tags: ["Housing","Coordination","KSA"],
      description: "Prepared coordinate drawings for excavation, blinding, and footing works for all 81 buildings. Full site grading and development plan coordination." },
    { title: "Rabigh Development Project",            category: "Oil & Gas",      client: "Saudi Aramco, KSA",              sort_order: 4, image_url: "", tags: ["ARAMCO","Petrochemical"],
      description: "ARAMCO Rabigh Development — structural detailing, drainage design, and multidisciplinary coordination for petrochemical infrastructure." },
    { title: "Shree Tisai Grand Twin Tower",          category: "High-Rise",      client: "Astute Buildcons, India",        sort_order: 5, image_url: "", tags: ["High-Rise","Project Management"],
      description: "Project Coordinator for 26-floor twin tower development at Kalyan East. Full lifecycle management from planning, execution to handover." },
    { title: "Godrej Tower",                          category: "Residential",    client: "Godrej Property / VIRJA Group",  sort_order: 6, image_url: "", tags: ["Residential","Management"],
      description: "Construction Manager for premium Godrej Tower at Kalyan-Bhiwandi By-Pass. Stakeholder management, progress tracking, and quality compliance." },
    { title: "Hospital Projects – SANGH",             category: "Healthcare",     client: "NESMA & Partners, KSA",          sort_order: 7, image_url: "", tags: ["Healthcare","Structural"],
      description: "Structural engineering contribution to SANGH hospital projects — structural analysis, drawing review, and design coordination." },
    { title: "Makkah Hotel Project",                  category: "Hospitality",    client: "Makkah, Saudi Arabia",           sort_order: 8, image_url: "", tags: ["Hotel","Execution","KSA"],
      description: "5 years of execution work based on working/shop drawings. Complete structural and civil execution for a large-scale hotel in Makkah." },
  ];
  for (const p of projects) {
    await sql`
      INSERT INTO projects (title, category, client, description, image_url, tags, sort_order)
      VALUES (${p.title}, ${p.category}, ${p.client}, ${p.description}, ${p.image_url}, ${p.tags}, ${p.sort_order})
    `;
  }
  console.log("✅  projects seeded");

  // ── education ─────────────────────────────────────────────────
  await sql`TRUNCATE education RESTART IDENTITY`;
  const education = [
    { degree: "Bachelor of Engineering (B.E.) – Civil Engineering",  institution: "Mumbai University",                                     year_detail: "2000s",                     type: "degree",        sort_order: 1 },
    { degree: "Project Management Professional (PMP)",                institution: "PMI Certified",                                        year_detail: "2020s",                     type: "certification", sort_order: 2 },
    { degree: "Diploma in Civil Engineering",                         institution: "Balasaheb Mhatre Polytechnic, MSBTE",                  year_detail: "First Class – 72.17%",      type: "degree",        sort_order: 3 },
    { degree: "Civil Draughtsman Trade Test Certificate",             institution: "Agnel ITI, Bandra, Mumbai",                            year_detail: "Nov 1991 – Grade A (81%)", type: "certification", sort_order: 4 },
    { degree: "Draughtsman Civil (N.T.C.)",                           institution: "Takiya Amani Shah Sarguroh T.C. (I.T.I.), Bhiwandi",   year_detail: "Feb 1988 – 71%",           type: "certification", sort_order: 5 },
    { degree: "Secondary School Certificate (SSC)",                   institution: "Maharashtra State Board",                              year_detail: "March 1985",                type: "degree",        sort_order: 6 },
  ];
  for (const e of education) {
    await sql`
      INSERT INTO education (degree, institution, year_detail, type, sort_order)
      VALUES (${e.degree}, ${e.institution}, ${e.year_detail}, ${e.type}, ${e.sort_order})
    `;
  }
  console.log("✅  education seeded");

  // ── courses ───────────────────────────────────────────────────
  await sql`TRUNCATE courses RESTART IDENTITY`;
  const courses = [
    { name: "AutoCAD",                        detail: "Certificate – 1995",                       sort_order: 1  },
    { name: "Revit – BIM",                    detail: "Building Information Modeling",             sort_order: 2  },
    { name: "STAAD Pro / STAAD III",           detail: "Structural Analysis",                      sort_order: 3  },
    { name: "ETABS",                           detail: "Structural Design Software",               sort_order: 4  },
    { name: "Primavera P6",                    detail: "Project Planning & Scheduling",            sort_order: 5  },
    { name: "MicroStation",                    detail: "CAD Drafting",                             sort_order: 6  },
    { name: "ISO 9001 Awareness",              detail: "Quality Management",                       sort_order: 7  },
    { name: "Microsoft Office",                detail: "Professional Suite",                       sort_order: 8  },
    { name: "Geosynthetic Solutions",          detail: "ALYAF Civil Engineering Seminar",          sort_order: 9  },
    { name: "Structural Engineering – Bridges",detail: "Princeton University (Online Course)",     sort_order: 10 },
  ];
  for (const c of courses) {
    await sql`INSERT INTO courses (name, detail, sort_order) VALUES (${c.name}, ${c.detail}, ${c.sort_order})`;
  }
  console.log("✅  courses seeded");

  // ── standards ─────────────────────────────────────────────────
  await sql`TRUNCATE standards RESTART IDENTITY`;
  const standards = ["Saudi Aramco", "ASTM", "ACI", "IBC / UBC", "BS", "SEC-EOA", "MSBTE", "GACA"];
  for (const name of standards) {
    await sql`INSERT INTO standards (name) VALUES (${name}) ON CONFLICT DO NOTHING`;
  }
  console.log("✅  standards seeded");

  console.log("\n🎉  All done! Database is ready.\n");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
