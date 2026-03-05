/**
 * GET /api/portfolio
 * Returns the complete portfolio dataset from Neon DB.
 * No auth required — this is public read data.
 */

import { neon } from "@neondatabase/serverless";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!process.env.DATABASE_URL) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "DATABASE_URL not configured" }) };
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Run all queries in parallel for performance
    const [personalRows, stats, experience, projects, education, courses, gallery, standardRows] =
      await Promise.all([
        sql`SELECT key, value FROM personal_info`,
        sql`SELECT id, value, label, sort_order FROM stats            ORDER BY sort_order ASC`,
        sql`SELECT id, year, company, location, role, description, sort_order
            FROM experience ORDER BY sort_order ASC`,
        sql`SELECT id, title, category, client, description, image_url, tags, sort_order
            FROM projects  ORDER BY sort_order ASC`,
        sql`SELECT id, degree, institution, year_detail AS year, type, sort_order
            FROM education ORDER BY sort_order ASC`,
        sql`SELECT id, name, detail, sort_order FROM courses ORDER BY sort_order ASC`,
        sql`SELECT id, image_url AS url, caption, sort_order FROM gallery ORDER BY sort_order ASC`,
        sql`SELECT name FROM standards ORDER BY name ASC`,
      ]);

    // Convert personal_info rows [{key,value}] → plain object
    const personal = Object.fromEntries(personalRows.map((r) => [r.key, r.value]));

    // Normalise projects: image_url → imageUrl, tags stays as PG array
    const normalisedProjects = projects.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      client: p.client,
      desc: p.description,
      imageUrl: p.image_url ?? "",
      tags: p.tags ?? [],
      sort_order: p.sort_order,
    }));

    // Normalise experience: description → desc
    const normalisedExperience = experience.map((e) => ({
      id: e.id,
      year: e.year,
      company: e.company,
      location: e.location,
      role: e.role,
      desc: e.description,
      sort_order: e.sort_order,
    }));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        personal,
        stats,
        experience: normalisedExperience,
        projects: normalisedProjects,
        education,
        courses,
        gallery,
        standards: standardRows.map((s) => s.name),
      }),
    };
  } catch (err) {
    console.error("[portfolio] DB error:", err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Failed to load portfolio data" }),
    };
  }
};
