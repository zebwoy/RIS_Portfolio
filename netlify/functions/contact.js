/**
 * POST /api/contact
 * Body: { name, email, company, subject, message }
 * Sends email to riyazibrahim2008@gmail.com via Resend API.
 * Uses Node https module — works on all Node versions, zero dependencies.
 */

import https from "https";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// Small helper — calls Resend over raw HTTPS, no fetch needed
function callResend(apiKey, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const handler = async (event) => {
  console.log("[contact] Handler called, method:", event.httpMethod);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // ── Parse body ────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || "{}");
    console.log("[contact] Parsed body keys:", Object.keys(body));
  } catch (e) {
    console.error("[contact] JSON parse error:", e.message);
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { name, email, company, subject, message } = body;

  // ── Validate ──────────────────────────────────────────────────
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    console.log("[contact] Missing fields — name:", !!name?.trim(), "email:", !!email?.trim(), "message:", !!message?.trim());
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Name, email and message are required" }),
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log("[contact] Invalid email format:", email);
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Invalid email address" }),
    };
  }

  // ── Check API key ─────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set in environment variables");
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Email service not configured" }),
    };
  }
  console.log("[contact] API key found, length:", apiKey.length);

  // ── Build HTML email ──────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/>
<style>
  body{font-family:Georgia,serif;background:#f4f1eb;margin:0;padding:32px 16px;}
  .card{background:#fff;max-width:560px;margin:0 auto;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);}
  .header{background:#0a1628;padding:28px 32px;}
  .header h1{color:#c9a84c;font-size:1.3rem;margin:0;letter-spacing:1px;}
  .header p{color:#8fa8c4;font-size:0.82rem;margin:6px 0 0;}
  .body{padding:28px 32px;}
  .label{font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:#c9a84c;font-weight:700;margin-bottom:5px;}
  .value{font-size:0.98rem;color:#1a1a2e;line-height:1.6;margin-bottom:18px;}
  .msg{background:#f9f7f2;border-left:3px solid #c9a84c;padding:14px 18px;border-radius:0 6px 6px 0;}
  .btn{display:inline-block;margin-top:20px;padding:11px 26px;background:#c9a84c;color:#0a1628;text-decoration:none;border-radius:6px;font-weight:700;font-size:0.9rem;}
  .footer{background:#0a1628;padding:16px 32px;text-align:center;}
  .footer p{color:#4a7fa5;font-size:0.75rem;margin:0;}
  hr{border:none;border-top:1px solid #ede9df;margin:20px 0;}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>New Portfolio Enquiry</h1>
    <p>Received via your portfolio contact form</p>
  </div>
  <div class="body">
    <div class="label">From</div>
    <div class="value"><strong>${esc(name)}</strong></div>
    <div class="label">Email</div>
    <div class="value">${esc(email)}</div>
    ${company?.trim() ? `<div class="label">Company</div><div class="value">${esc(company)}</div>` : ""}
    ${subject?.trim() ? `<div class="label">Subject</div><div class="value">${esc(subject)}</div>` : ""}
    <hr/>
    <div class="label">Message</div>
    <div class="value msg">${esc(message).replace(/\n/g, "<br/>")}</div>
    <a href="mailto:${esc(email)}?subject=Re: ${esc(subject || "Your portfolio enquiry")}" class="btn">
      Reply to ${esc(name)}
    </a>
  </div>
  <div class="footer">
    <p>Riyaz Ibrahim Shaikh &mdash; Senior Civil Engineer &amp; Project Manager</p>
  </div>
</div>
</body>
</html>`;

  // ── Send via Resend ────────────────────────────────────────────
  try {
    console.log("[contact] Calling Resend API...");
    const result = await callResend(apiKey, {
      from:     "RIS Portfolio <onboarding@resend.dev>",
      to:       ["riyazibrahim2008@gmail.com"],
      reply_to: email,
      subject:  subject?.trim()
                  ? `Portfolio Enquiry: ${subject}`
                  : `New Enquiry from ${name}`,
      html,
    });

    console.log("[contact] Resend response status:", result.status, "body:", JSON.stringify(result.body));

    if (result.status >= 200 && result.status < 300) {
      console.log("[contact] Email sent successfully, id:", result.body?.id);
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ ok: true }),
      };
    } else {
      console.error("[contact] Resend API error:", result.body);
      return {
        statusCode: 502,
        headers: CORS,
        body: JSON.stringify({ error: "Failed to send email — please try again or email directly." }),
      };
    }
  } catch (err) {
    console.error("[contact] HTTPS call failed:", err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Network error — please try again." }),
    };
  }
};
