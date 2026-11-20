import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { DeveloperApiKeyRecord } from "@/lib/shieldcode-b2b-store";
import {
  insertPartnerApiKey,
  listPartnerApiKeys,
  revokePartnerApiKey,
} from "@/lib/supabase/db";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

function serializeKey(record: DeveloperApiKeyRecord) {
  return {
    id: record.id,
    institution_name: record.institution_name,
    label: record.label,
    key_prefix: record.key_prefix,
    masked_key: record.masked_key,
    last4: record.last4,
    environment: record.environment,
    sha256_preview: `${record.sha256_hash.slice(0, 12)}...${record.sha256_hash.slice(-6)}`,
    is_active: record.is_active,
    requests_today: record.requests_today,
    created_at: record.created_at,
    revoked_at: record.revoked_at,
  };
}

/**
 * `GET /api/v1/institutions/api-keys`
 * Returns only masked metadata & SHA-256 fingerprints — plaintext keys are NEVER persisted or returned.
 */
export async function GET() {
  const { source, keys: rawKeys } = await listPartnerApiKeys();
  const keys = rawKeys.map(serializeKey);

  return NextResponse.json(
    { source, count: keys.length, keys },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

/**
 * `POST /api/v1/institutions/api-keys`
 * Generates a 256-bit CSPRNG secret key (`sc_live_...` or `sc_test_...`),
 * stores ONLY its SHA-256 digest in memory/PostgreSQL, and returns `raw_api_key` ONCE.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const environment: "live" | "test" =
      body?.environment === "test" ? "test" : "live";
    const label =
      String(body?.label || "").trim().slice(0, 64) ||
      (environment === "live"
        ? "Production SMS Gateway Key"
        : "Sandbox Test Key");
    const institutionName =
      String(body?.institution_name || "").trim().slice(0, 80) ||
      "CPA (Crédit Populaire d'Algérie)";

    const prefix = environment === "live" ? "sc_live_" : "sc_test_";
    const entropy = crypto.randomBytes(24).toString("base64url");
    const rawKey = `${prefix}${entropy}`;
    const last4 = rawKey.slice(-4);
    const sha256Hash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const record: DeveloperApiKeyRecord = {
      id: `devkey_${crypto.randomBytes(4).toString("hex")}`,
      institution_name: institutionName,
      label,
      key_prefix: prefix,
      masked_key: `${prefix}••••••••••••${last4}`,
      last4,
      environment,
      sha256_hash: sha256Hash,
      is_active: true,
      requests_today: 0,
      created_at: new Date().toISOString(),
      revoked_at: null,
    };

    const { source, key: saved } = await insertPartnerApiKey(record);

    return NextResponse.json(
      {
        source,
        key: serializeKey(saved),
        // Revealed ONCE; never stored on server state in plaintext
        raw_api_key: rawKey,
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      {
        error_code: "KEY_GENERATION_FAILED",
        message: "Failed to generate secret API key",
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

/**
 * `DELETE /api/v1/institutions/api-keys?id=...`
 * Revokes an institution secret key immediately.
 */
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { error_code: "VALIDATION_ERROR", message: "Missing key id" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const { source, key: updated } = await revokePartnerApiKey(id);
  if (!updated) {
    return NextResponse.json(
      { error_code: "NOT_FOUND", message: "API key not found" },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    { source, key: serializeKey(updated), revoked: true },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
