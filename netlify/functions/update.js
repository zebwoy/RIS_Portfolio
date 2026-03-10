/**
 * POST /api/update
 * Headers: { x-admin-password: <password> }
 * Body: { table, action, id?, data }
 *
 * Supported actions:
 *   upsert  – personal_info key-value pairs
 *   insert  – add a new row to any table
 *   update  – update an existing row by id
 *   delete  – delete a row by id from any table
 *
 * Auth check is performed on EVERY request server-side.
 */

import { neon } from "@neondatabase/serverless";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-password",
  "Content-Type": "application/json",
};

// ─── Auth helper ─────────────────────────────────────────────────────────────
function isAuthorised(event) {
  const pw = event.headers["x-admin-password"] || event.headers["X-Admin-Password"];
  return pw === process.env.ADMIN_PASSWORD;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // ── Auth ──────────────────────────────────────────────────────
  if (!isAuthorised(event)) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorised" }) };
  }

  // ── Parse body ────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { table, action, id, data } = body;

  if (!table || !action) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "table and action are required" }) };
  }

  // Whitelist tables to prevent SQL injection via table name
  const ALLOWED_TABLES = ["personal_info", "stats", "experience", "projects", "education", "courses", "gallery", "standards"];
  if (!ALLOWED_TABLES.includes(table)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Unknown table: ${table}` }) };
  }

  if (!process.env.NETLIFY_DATABASE_URL && !process.env.DATABASE_URL) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "DATABASE_URL not configured" }) };
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

  try {
    let result;

    // ═══════════════════════════════════════════════════════════
    // UPSERT — personal_info only (key-value store)
    // ═══════════════════════════════════════════════════════════
    if (action === "upsert" && table === "personal_info") {
      if (!data || typeof data !== "object") {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "data object required for upsert" }) };
      }
      for (const [key, value] of Object.entries(data)) {
        await sql`
          INSERT INTO personal_info (key, value)
          VALUES (${key}, ${String(value)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
      }
      result = { ok: true, upserted: Object.keys(data).length };
    }

    // ═══════════════════════════════════════════════════════════
    // INSERT
    // ═══════════════════════════════════════════════════════════
    else if (action === "insert") {
      if (table === "experience") {
        [result] = await sql`
          INSERT INTO experience (year, company, location, role, description, sort_order)
          VALUES (
            ${data.year        ?? ""},
            ${data.company     ?? ""},
            ${data.location    ?? ""},
            ${data.role        ?? ""},
            ${data.desc        ?? data.description ?? ""},
            (SELECT COALESCE(MAX(sort_order),0)+1 FROM experience)
          )
          RETURNING id
        `;
      } else if (table === "projects") {
        const tags = Array.isArray(data.tags) ? data.tags : [];
        [result] = await sql`
          INSERT INTO projects (title, category, client, description, image_url, tags, sort_order)
          VALUES (
            ${data.title       ?? ""},
            ${data.category    ?? ""},
            ${data.client      ?? ""},
            ${data.desc        ?? data.description ?? ""},
            ${data.imageUrl    ?? data.image_url   ?? ""},
            ${tags},
            (SELECT COALESCE(MAX(sort_order),0)+1 FROM projects)
          )
          RETURNING id
        `;
      } else if (table === "education") {
        [result] = await sql`
          INSERT INTO education (degree, institution, year_detail, type, sort_order)
          VALUES (
            ${data.degree      ?? ""},
            ${data.institution ?? ""},
            ${data.year        ?? data.year_detail ?? ""},
            ${data.type        ?? "degree"},
            (SELECT COALESCE(MAX(sort_order),0)+1 FROM education)
          )
          RETURNING id
        `;
      } else if (table === "courses") {
        [result] = await sql`
          INSERT INTO courses (name, detail, sort_order)
          VALUES (
            ${data.name   ?? ""},
            ${data.detail ?? ""},
            (SELECT COALESCE(MAX(sort_order),0)+1 FROM courses)
          )
          RETURNING id
        `;
      } else if (table === "gallery") {
        [result] = await sql`
          INSERT INTO gallery (image_url, caption, sort_order)
          VALUES (
            ${data.url     ?? data.image_url ?? ""},
            ${data.caption ?? ""},
            (SELECT COALESCE(MAX(sort_order),0)+1 FROM gallery)
          )
          RETURNING id
        `;
      } else if (table === "standards") {
        [result] = await sql`
          INSERT INTO standards (name)
          VALUES (${data.name ?? ""})
          ON CONFLICT (name) DO NOTHING
          RETURNING id
        `;
      } else if (table === "stats") {
        [result] = await sql`
          INSERT INTO stats (value, label, sort_order)
          VALUES (
            ${data.value ?? ""},
            ${data.label ?? ""},
            (SELECT COALESCE(MAX(sort_order),0)+1 FROM stats)
          )
          RETURNING id
        `;
      }
    }

    // ═══════════════════════════════════════════════════════════
    // UPDATE
    // ═══════════════════════════════════════════════════════════
    else if (action === "update") {
      if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "id required for update" }) };

      if (table === "experience") {
        await sql`
          UPDATE experience SET
            year        = ${data.year        ?? ""},
            company     = ${data.company     ?? ""},
            location    = ${data.location    ?? ""},
            role        = ${data.role        ?? ""},
            description = ${data.desc        ?? data.description ?? ""}
          WHERE id = ${id}
        `;
      } else if (table === "projects") {
        const tags = Array.isArray(data.tags) ? data.tags : [];
        await sql`
          UPDATE projects SET
            title       = ${data.title       ?? ""},
            category    = ${data.category    ?? ""},
            client      = ${data.client      ?? ""},
            description = ${data.desc        ?? data.description ?? ""},
            image_url   = ${data.imageUrl    ?? data.image_url   ?? ""},
            tags        = ${tags}
          WHERE id = ${id}
        `;
      } else if (table === "education") {
        await sql`
          UPDATE education SET
            degree      = ${data.degree      ?? ""},
            institution = ${data.institution ?? ""},
            year_detail = ${data.year        ?? data.year_detail ?? ""},
            type        = ${data.type        ?? "degree"}
          WHERE id = ${id}
        `;
      } else if (table === "courses") {
        await sql`
          UPDATE courses SET
            name   = ${data.name   ?? ""},
            detail = ${data.detail ?? ""}
          WHERE id = ${id}
        `;
      } else if (table === "gallery") {
        await sql`
          UPDATE gallery SET
            image_url = ${data.url     ?? data.image_url ?? ""},
            caption   = ${data.caption ?? ""}
          WHERE id = ${id}
        `;
      } else if (table === "stats") {
        await sql`
          UPDATE stats SET
            value = ${data.value ?? ""},
            label = ${data.label ?? ""}
          WHERE id = ${id}
        `;
      }
      result = { ok: true };
    }

    // ═══════════════════════════════════════════════════════════
    // DELETE
    // ═══════════════════════════════════════════════════════════
    else if (action === "delete") {
      if (table === "standards") {
        // Standards deleted by name, not id
        if (!data?.name) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "name required for standards delete" }) };
        await sql`DELETE FROM standards WHERE name = ${data.name}`;
      } else {
        // All other tables delete by id
        if (!id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "id required for delete" }) };
        await sql`DELETE FROM ${sql(table)} WHERE id = ${id}`;
      }
      result = { ok: true };
    }

    else {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(result ?? { ok: true }),
    };
  } catch (err) {
    console.error(`[update] ${table}/${action} error:`, err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Database operation failed", detail: err.message }),
    };
  }
};
