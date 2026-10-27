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

  return res.status(200).json({ ok: true });
};
