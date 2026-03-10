/**
 * POST /api/contact
 * Body: { name, email, company, subject, message }
 *
 * Sends a formatted email to Riyaz's Gmail via Resend.
 * No auth required — this is a public contact form.
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

  // ── Parse & validate ──────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { name, email, company, subject, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Name, email and message are required" }),
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Invalid email address" }),
    };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY not set");
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Email service not configured" }),
    };
  }

  // ── Build styled HTML email ────────────────────────────────────
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body{font-family:Georgia,serif;background:#f4f1eb;margin:0;padding:32px 16px;}
    .card{background:#fff;max-width:560px;margin:0 auto;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);}
    .header{background:#0a1628;padding:28px 32px;}
    .header h1{color:#c9a84c;font-size:1.3rem;margin:0;letter-spacing:1px;}
    .header p{color:#8fa8c4;font-size:0.82rem;margin:6px 0 0;}
    .body{padding:28px 32px;}
    .label{font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;color:#c9a84c;font-weight:700;margin-bottom:5px;}
    .value{font-size:0.98rem;color:#1a1a2e;line-height:1.6;margin-bottom:18px;}
    .message-box{background:#f9f7f2;border-left:3px solid #c9a84c;padding:14px 18px;border-radius:0 6px 6px 0;}
    .reply-btn{display:inline-block;margin-top:20px;padding:11px 26px;background:#c9a84c;color:#0a1628;text-decoration:none;border-radius:6px;font-weight:700;font-size:0.9rem;}
    .footer{background:#0a1628;padding:16px 32px;text-align:center;}
    .footer p{color:#4a7fa5;font-size:0.75rem;margin:0;}
    hr{border:none;border-top:1px solid #ede9df;margin:20px 0;}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>&#128233; New Portfolio Enquiry</h1>
      <p>Received via your portfolio contact form</p>
    </div>
    <div class="body">
      <div class="label">From</div>
      <div class="value"><strong>${esc(name)}</strong></div>

      <div class="label">Email</div>
      <div class="value"><a href="mailto:${esc(email)}" style="color:#0a1628">${esc(email)}</a></div>

      ${company?.trim() ? `<div class="label">Company / Organisation</div><div class="value">${esc(company)}</div>` : ""}
      ${subject?.trim() ? `<div class="label">Subject</div><div class="value">${esc(subject)}</div>` : ""}

      <hr/>

      <div class="label">Message</div>
      <div class="value message-box">${esc(message).replace(/\n/g, "<br/>")}</div>

      <a href="mailto:${esc(email)}?subject=Re: ${esc(subject || "Your portfolio enquiry")}"
         class="reply-btn">Reply to ${esc(name)}</a>
    </div>
    <div class="footer">
      <p>Riyaz Ibrahim Shaikh &mdash; Senior Civil Engineer &amp; Project Manager</p>
    </div>
  </div>
</body>
</html>`;

  // ── Call Resend API ────────────────────────────────────────────
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:     "RIS Portfolio <onboarding@resend.dev>",
        // to:       ["riyazibrahim2008@gmail.com"],
        to:       ["imanriyaj@gmail.com"],
        reply_to: email,          // clicking Reply in Gmail goes to the enquirer directly
        subject:  subject?.trim()
                    ? `Portfolio Enquiry: ${subject}`
                    : `New Enquiry from ${name}`,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("[contact] Resend error:", result);
      return {
        statusCode: 502,
        headers: CORS,
        body: JSON.stringify({ error: "Failed to send — please email directly." }),
      };
    }

    console.log("[contact] Email sent, id:", result.id);
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("[contact] Fetch error:", err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "Network error — please try again." }),
    };
  }
};

// Prevent XSS inside the HTML email body
function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
