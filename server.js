/**
 * ShieldCode — Enterprise API-First B2B2C Anti-Phishing SaaS Platform
 * Express.js REST API Server + Embeddable Widget SDK
 */

const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.json());

// Enable CORS for Partner Bank Web Apps & Embeddable Widget SDK
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Shield-Api-Key, Authorization"
  );
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ============================================================================
// Multi-Tenant In-Memory / SQLite-Mirrored Relational Store
// Mirrors `schema.sql`: Companies, API_Keys, End_Users, Anti_Phishing_Codes
// ============================================================================

const db = {
  companies: new Map([
    [
      "comp_finanza_01",
      {
        id: "comp_finanza_01",
        company_name: "FinanzaBank",
        institution_type: "Digital Bank",
        webhook_url: "https://api.finanzabank.com/webhooks/shieldcode",
        integration_active: true,
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  apiKeys: new Map([
    [
      "sc_live_finanza_9f8e7d6c5b4a3210",
      {
        id: "key_finanza_01",
        company_id: "comp_finanza_01",
        api_key: "sc_live_finanza_9f8e7d6c5b4a3210",
        key_prefix: "sc_live_finanza",
        environment: "production",
        is_active: true,
        requests_count: 14,
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  endUsers: new Map([
    [
      "comp_finanza_01:CUST-1001",
      {
        id: "usr_ayoub_01",
        company_id: "comp_finanza_01",
        external_user_id: "CUST-1001",
        username: "Ayoub Benali",
        phone_number: "+213550123456",
        created_at: new Date().toISOString(),
      },
    ],
  ]),
  antiPhishingCodes: new Map([
    [
      "comp_finanza_01:CUST-1001",
      {
        id: "code_ayoub_01",
        company_id: "comp_finanza_01",
        end_user_id: "usr_ayoub_01",
        external_user_id: "CUST-1001",
        security_code: "Ayoub",
        is_enabled: true,
        updated_at: new Date().toISOString(),
      },
    ],
  ]),
};

// ============================================================================
// Middleware: Partner Institution API Key Authentication
// ============================================================================

function authenticatePartnerApiKey(req, res, next) {
  const rawKey =
    req.headers["x-shield-api-key"] ||
    (req.body && req.body.api_key) ||
    req.query.api_key;

  if (!rawKey) {
    return res.status(401).json({
      success: false,
      error_code: "MISSING_API_KEY",
      message: "Missing partner API key (supply X-Shield-Api-Key header or api_key).",
    });
  }

  const keyRecord = db.apiKeys.get(String(rawKey).trim());
  if (!keyRecord || !keyRecord.is_active) {
    return res.status(403).json({
      success: false,
      error_code: "INVALID_API_KEY",
      message: "Invalid or revoked partner institution API key.",
    });
  }

  const company = db.companies.get(keyRecord.company_id);
  if (!company || !company.integration_active) {
    return res.status(403).json({
      success: false,
      error_code: "INTEGRATION_DISABLED",
      message: "Partner institution integration is currently paused.",
    });
  }

  keyRecord.requests_count += 1;
  keyRecord.last_used_at = new Date().toISOString();

  req.partnerCompany = company;
  req.partnerApiKey = keyRecord;
  next();
}

// ============================================================================
// 1. POST /api/v1/register-company (and /api/v1/company/register)
// Generates a new B2B API Key for a financial institution / corporate client.
// ============================================================================

function handleRegisterCompany(req, res) {
  const { company_name, institution_type, webhook_url } = req.body || {};

  if (!company_name || String(company_name).trim().length < 2) {
    return res.status(400).json({
      success: false,
      error_code: "VALIDATION_ERROR",
      message: "company_name is required (minimum 2 characters).",
    });
  }

  const cleanName = String(company_name).trim();
  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10) || "bank";

  const companyId = `comp_${slug}_${crypto.randomBytes(3).toString("hex")}`;
  const randomSecret = crypto.randomBytes(8).toString("hex");
  const apiKey = `sc_live_${slug}_${randomSecret}`;
  const now = new Date().toISOString();

  const company = {
    id: companyId,
    company_name: cleanName,
    institution_type: institution_type || "Financial Institution",
    webhook_url: webhook_url || `https://api.${slug}.com/webhooks/shieldcode`,
    integration_active: true,
    created_at: now,
  };

  const apiKeyRecord = {
    id: `key_${crypto.randomBytes(4).toString("hex")}`,
    company_id: companyId,
    api_key: apiKey,
    key_prefix: `sc_live_${slug}`,
    environment: "production",
    is_active: true,
    requests_count: 0,
    created_at: now,
  };

  db.companies.set(companyId, company);
  db.apiKeys.set(apiKey, apiKeyRecord);

  // Seed default demo end-user for the newly registered institution
  const userKey = `${companyId}:CUST-1001`;
  db.endUsers.set(userKey, {
    id: `usr_${crypto.randomBytes(4).toString("hex")}`,
    company_id: companyId,
    external_user_id: "CUST-1001",
    username: "Ayoub Benali",
    phone_number: "+213550123456",
    created_at: now,
  });

  return res.status(201).json({
    success: true,
    company,
    api_key: apiKey,
    embed_script: `<script src="https://cdn.shieldcode.io/sdk/v1.js" data-api-key="${apiKey}" data-user-id="CUST-1001"></script>`,
  });
}

app.post("/api/v1/register-company", handleRegisterCompany);
app.post("/api/v1/company/register", handleRegisterCompany);

// ============================================================================
// 2. POST /api/v1/shield/configure
// Used by the partner bank's app or embedded widget to set/update an end-user's
// personal anti-phishing security code (e.g., "Ayoub").
// ============================================================================

app.post("/api/v1/shield/configure", authenticatePartnerApiKey, (req, res) => {
  const {
    external_user_id = "CUST-1001",
    username = "Ayoub Benali",
    phone_number = "+213550123456",
    security_code,
  } = req.body || {};

  const trimmedCode = String(security_code || "").trim();
  if (!/^[A-Za-z0-9_\-\u0600-\u06FF]{3,20}$/.test(trimmedCode)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_SECURITY_CODE",
      message:
        "security_code must be 3 to 20 safe alphanumeric/Arabic characters (no spaces or special symbols).",
    });
  }

  const companyId = req.partnerCompany.id;
  const compositeKey = `${companyId}:${external_user_id}`;
  const now = new Date().toISOString();

  let endUser = db.endUsers.get(compositeKey);
  if (!endUser) {
    endUser = {
      id: `usr_${crypto.randomBytes(4).toString("hex")}`,
      company_id: companyId,
      external_user_id,
      username,
      phone_number,
      created_at: now,
    };
    db.endUsers.set(compositeKey, endUser);
  }

  const codeRecord = {
    id: `code_${crypto.randomBytes(4).toString("hex")}`,
    company_id: companyId,
    end_user_id: endUser.id,
    external_user_id,
    security_code: trimmedCode,
    is_enabled: true,
    updated_at: now,
  };

  db.antiPhishingCodes.set(compositeKey, codeRecord);

  return res.status(200).json({
    success: true,
    company_name: req.partnerCompany.company_name,
    external_user_id,
    security_code: codeRecord.security_code,
    masked_code: `${trimmedCode.slice(0, 2)}***`,
    is_enabled: true,
    updated_at: now,
  });
});

// ============================================================================
// 3. GET /api/v1/sms/simulate
// Generates and returns a simulated secure bank SMS payload containing the
// embedded custom security code prefix (e.g., "[Ayoub] FinanzaBank: Your OTP is...").
// ============================================================================

app.get("/api/v1/sms/simulate", authenticatePartnerApiKey, (req, res) => {
  const externalUserId = String(req.query.external_user_id || "CUST-1001");
  const actionType = String(req.query.action || "transfer");
  const company = req.partnerCompany;
  const compositeKey = `${company.id}:${externalUserId}`;

  const endUser = db.endUsers.get(compositeKey) || {
    external_user_id: externalUserId,
    username: "Ayoub Benali",
    phone_number: "+213550123456",
  };

  const codeRecord = db.antiPhishingCodes.get(compositeKey);
  const generatedOtp = crypto.randomInt(100000, 999999).toString();
  const hasShieldCode = Boolean(codeRecord && codeRecord.is_enabled);
  const activeCode = hasShieldCode ? codeRecord.security_code : null;

  const prefix = hasShieldCode
    ? `[${activeCode}]`
    : `[UNVERIFIED-NO-SHIELDCODE]`;

  const messageText =
    actionType === "login"
      ? `${prefix} ${company.company_name}: Your login verification OTP is ${generatedOtp}. Never share this code with anyone.`
      : `${prefix} ${company.company_name}: Your OTP is ${generatedOtp} to authorize a transfer of $1,250.00. If this code does not match your personal ShieldCode, DO NOT proceed!`;

  return res.status(200).json({
    success: true,
    company_name: company.company_name,
    recipient_phone: endUser.phone_number,
    external_user_id: externalUserId,
    shield_code_active: hasShieldCode,
    embedded_security_code: activeCode,
    generated_otp: generatedOtp,
    sms_payload: messageText,
    dispatched_at: new Date().toISOString(),
  });
});

// Serve index.html for standalone demo
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`ShieldCode B2B2C API Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
