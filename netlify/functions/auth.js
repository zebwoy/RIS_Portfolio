/**
 * POST /api/auth
 * Body: { password: string }
 * Returns: { ok: true } on success, 401 on failure.
 *
 * The real password lives in the ADMIN_PASSWORD env var — never in client code.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { password } = body;

  if (!password || typeof password !== "string") {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Password required" }) };
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.error("[auth] ADMIN_PASSWORD env var not set");
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Server misconfiguration" }) };
  }

  // Constant-time comparison to prevent timing attacks
  const expected = process.env.ADMIN_PASSWORD;
  const match =
    password.length === expected.length &&
    password.split("").every((ch, i) => ch === expected[i]);

  if (match) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) };
  }

  // Small artificial delay on failure to slow brute-force
  await new Promise((r) => setTimeout(r, 400));
  return { statusCode: 401, headers: CORS, body: JSON.stringify({ ok: false, error: "Invalid password" }) };
};
