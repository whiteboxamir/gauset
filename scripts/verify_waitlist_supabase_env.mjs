#!/usr/bin/env node

const vercelEnv = (process.env.VERCEL_ENV || "").trim().toLowerCase();
const isProtectedDeploy = vercelEnv === "production" || vercelEnv === "preview";
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const blobToken = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();
const legacyJwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

if (!isProtectedDeploy) {
    process.exit(0);
}

const hasSupabaseConfig = Boolean(supabaseUrl && serviceRoleKey);
const hasBlobFallback = Boolean(blobToken);

if (!hasSupabaseConfig && !hasBlobFallback) {
    console.error(
        "Waitlist env verification failed: preview/production deploys require Supabase REST credentials or BLOB_READ_WRITE_TOKEN for the waitlist fallback.",
    );
    process.exit(1);
}

if (!hasSupabaseConfig && hasBlobFallback) {
    console.warn(
        "Waitlist env verification warning: Supabase REST credentials are missing, so preview/production waitlist writes will use the Blob fallback.",
    );
    process.exit(0);
}

if (!supabaseUrl) {
    console.error(
        "Waitlist env verification failed: preview/production deploys require NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.",
    );
    process.exit(1);
}

if (!serviceRoleKey) {
    console.error(
        "Waitlist env verification failed: preview/production deploys require SUPABASE_SERVICE_ROLE_KEY when using Supabase.",
    );
    process.exit(1);
}

if (legacyJwtPattern.test(serviceRoleKey)) {
    console.error(
        "Waitlist env verification failed: SUPABASE_SERVICE_ROLE_KEY is a legacy JWT-style key. Use an sb_secret_ service-role key instead.",
    );
    process.exit(1);
}

if (!serviceRoleKey.startsWith("sb_secret_")) {
    console.warn(
        "Waitlist env verification warning: SUPABASE_SERVICE_ROLE_KEY does not start with sb_secret_. Verify this is the intended non-legacy key type.",
    );
}
