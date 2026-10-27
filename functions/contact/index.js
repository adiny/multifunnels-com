// HTTP Cloud Function that receives the "project-brief" contact form and
// stores each submission in Firestore (collection: contact-submissions).
const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore();

const ALLOWED_ORIGINS = new Set([
  "https://multifunnels.com",
  "https://www.multifunnels.com",
  "https://multifunnels-com.web.app",
  "https://multifunnels-com.firebaseapp.com",
  "http://localhost:8123",
]);

const field = (value, max) => String(value || "").trim().slice(0, max);

exports.contact = async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    return res.status(204).send("");
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = req.body || {};
  // Honeypot: pretend success so bots don't adapt.
  if (body["bot-field"]) {
    return res.status(200).json({ ok: true });
  }

  const name = field(body.name, 200);
  const email = field(body.email, 200);
  const agentGoal = field(body["agent-goal"], 5000);
  if (!name || !agentGoal || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "missing or invalid fields" });
  }

  const company = field(body.company, 300);
  const stage = field(body.stage, 50);
  await firestore.collection("contact-submissions").add({
    name,
    email,
    company,
    agentGoal,
    apis: field(body.apis, 1000),
    stage,
    projectUrl: field(body["project-url"], 500),
    language: field(body.language, 10),
    submittedAt: new Date().toISOString(),
    userAgent: field(req.headers["user-agent"], 300),
  });

  // Structured log entry; a Cloud Monitoring log-based alert emails
  // info@multifunnels.com for each NEW_SUBMISSION event.
  console.log(JSON.stringify({
    message: "NEW_SUBMISSION",
    name,
    email,
    company,
    stage,
    goal: agentGoal.slice(0, 200),
  }));

  // Email notification via Resend. Failures are logged but never fail
  // the request — the submission is already safe in Firestore.
  if (process.env.RESEND_API_KEY) {
    try {
      const esc = (s) => s.replace(/[&<>"]/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      const row = (label, value) => value
        ? `<tr><td style="padding:4px 12px 4px 0;color:#667;white-space:nowrap">${label}</td><td style="padding:4px 0">${esc(value)}</td></tr>`
        : "";
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.NOTIFY_FROM || "MultiFunnels <notifications@multifunnels.com>",
          to: [process.env.NOTIFY_TO || "info@multifunnels.com"],
          reply_to: email,
          subject: `New project brief: ${name}${company ? " (" + company + ")" : ""}`,
          html:
            `<h2 style="font-family:sans-serif">New project brief</h2>` +
            `<table style="font-family:sans-serif;font-size:14px">` +
            row("Name", name) + row("Email", email) + row("Company", company) +
            row("Stage", stage) + row("APIs", field(body.apis, 1000)) +
            row("Project URL", field(body["project-url"], 500)) +
            `</table>` +
            `<p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${esc(agentGoal)}</p>` +
            `<p style="font-family:sans-serif;font-size:12px;color:#889">` +
            `<a href="https://console.cloud.google.com/firestore/databases/-default-/data/panel/contact-submissions?project=multifunnels-com">All submissions in Firestore</a></p>`,
        }),
      });
      if (!resp.ok) {
        console.error("resend_error", resp.status, await resp.text());
      }
    } catch (e) {
      console.error("resend_error", e.message);
    }
  }

  return res.status(200).json({ ok: true });
};
