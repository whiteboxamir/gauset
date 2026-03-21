import { createHmac, randomUUID } from "node:crypto";
import { copy, del, put } from "@vercel/blob";
import type { NextRequest } from "next/server";

import {
    MVP_DIRECT_UPLOAD_ALLOWED_CONTENT_TYPES,
    MVP_DIRECT_UPLOAD_MAX_BYTES,
    MVP_LEGACY_PROXY_UPLOAD_MAX_BYTES,
    type MvpDirectUploadCapability,
    type MvpDirectUploadTransport,
    isAllowedBlobStoreUrl,
} from "@/lib/mvp-upload";
import {
    buildProxyResponseHeaders,
    buildUpstreamRequestHeaders,
    buildUpstreamUrl,
    resolveBackendBaseUrlForOrigin,
    resolveBackendWorkerToken,
} from "@/server/mvp/proxyBackend";
import { buildBackendProxyErrorResponse, buildUnavailableResponse, type ProxyAccessContext } from "@/server/mvp/proxyShared";

export const MVP_DIRECT_UPLOAD_PATH_PREFIX = "mvp/source-stills/";
const BROWSER_UPLOAD_GRANT_TTL_MS = 5 * 60 * 1000;
const BROWSER_UPLOAD_GRANT_VERSION = "gauset-browser-upload-v2";
const LOCAL_BACKEND_FALLBACK_URL = "http://127.0.0.1:8000";
const LOCAL_DEV_SHARED_SECRET = "gauset-local-dev-worker-token";
const UPLOAD_META_PREFIX = "uploads/meta/";
const UPLOAD_IMAGE_PREFIX = "uploads/images/";

export interface CompleteDirectUploadPayload {
    blobUrl: string;
    pathname: string;
    filename: string;
    contentType: string;
    size: number;
}

export interface BrowserDirectUploadGrantRequest {
    filename: string;
    contentType: string;
    size: number;
}

interface StoredUploadRecord {
    image_id: string;
    filename: string;
    stored_filename: string;
    storage_path: string;
    filepath: string;
    url: string;
    created_at: string;
    source_type: "upload";
    provider: null;
    model: null;
    prompt: null;
    generation_job_id: null;
}

function normalizeUploadString(value: unknown, max: number) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().slice(0, max);
}

function normalizeUploadSize(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.trunc(value);
    }
    if (typeof value === "string" && value.trim()) {
        const parsed = Number.parseInt(value.trim(), 10);
        return Number.isFinite(parsed) ? parsed : Number.NaN;
    }
    return Number.NaN;
}

function resolveStoredUploadExtension(filename: string, contentType: string) {
    const filenameMatch = /\.[^.]+$/.exec(filename.toLowerCase());
    if (filenameMatch?.[0]) {
        return filenameMatch[0];
    }

    switch (contentType) {
        case "image/jpeg":
            return ".jpg";
        case "image/webp":
            return ".webp";
        case "image/png":
        default:
            return ".png";
    }
}

function buildStoredUploadRecord({
    imageId,
    originalFilename,
    storedFilename,
}: {
    imageId: string;
    originalFilename: string;
    storedFilename: string;
}): StoredUploadRecord {
    const storagePath = `${UPLOAD_IMAGE_PREFIX}${storedFilename}`;
    return {
        image_id: imageId,
        filename: originalFilename,
        stored_filename: storedFilename,
        storage_path: storagePath,
        filepath: storagePath,
        url: `/storage/${storagePath}`,
        created_at: new Date().toISOString(),
        source_type: "upload",
        provider: null,
        model: null,
        prompt: null,
        generation_job_id: null,
    };
}

function buildStoredUploadResponse(record: StoredUploadRecord) {
    return {
        image_id: record.image_id,
        filename: record.stored_filename || record.filename,
        filepath: record.storage_path || record.filepath,
        url: record.url,
        source_type: record.source_type,
    };
}

function resolveBrowserUploadGrantSecret(env: NodeJS.ProcessEnv = process.env) {
    return (
        env.GAUSET_BROWSER_UPLOAD_SECRET ??
        env.GAUSET_BACKEND_WORKER_TOKEN ??
        env.GAUSET_WORKER_TOKEN ??
        (env.VERCEL === "1" ? "" : env.GAUSET_LOCAL_DEV_SHARED_SECRET ?? LOCAL_DEV_SHARED_SECRET) ??
        ""
    ).trim();
}

function resolveLocalBackendFallbackUrl(env: NodeJS.ProcessEnv = process.env) {
    return env.VERCEL === "1" ? "" : LOCAL_BACKEND_FALLBACK_URL;
}

function resolveDefaultBackendBaseUrl(env: NodeJS.ProcessEnv = process.env) {
    return (
        env.GAUSET_BACKEND_URL ??
        env.NEXT_PUBLIC_GAUSET_API_BASE_URL ??
        (env.NODE_ENV !== "production" ? LOCAL_BACKEND_FALLBACK_URL : resolveLocalBackendFallbackUrl(env)) ??
        ""
    ).trim();
}

function resolveBrowserDirectBackendUploadUrl(env: NodeJS.ProcessEnv = process.env) {
    const explicitUploadUrl = normalizeAbsoluteHttpUrl(env.GAUSET_BROWSER_BACKEND_UPLOAD_URL ?? "");
    if (explicitUploadUrl) {
        return explicitUploadUrl.endsWith("/upload") ? explicitUploadUrl : `${explicitUploadUrl}/upload`;
    }

    const backendBaseUrl = normalizeAbsoluteHttpUrl(resolveDefaultBackendBaseUrl(env));
    if (!backendBaseUrl) {
        return "";
    }

    try {
        const parsed = new URL(backendBaseUrl);
        if (parsed.pathname === "/api/_mvp_backend" || parsed.pathname.startsWith("/api/_mvp_backend/")) {
            return "";
        }
    } catch {
        return "";
    }

    return backendBaseUrl.endsWith("/upload") ? backendBaseUrl : `${backendBaseUrl}/upload`;
}

export function resolveDirectUploadCapability(env: NodeJS.ProcessEnv = process.env): MvpDirectUploadCapability {
    const blobUploadAvailable = isDirectUploadConfigured(env);
    const backendDirectUploadUrl = blobUploadAvailable ? "" : resolveBrowserDirectBackendUploadUrl(env);
    const backendDirectUploadAvailable = Boolean(backendDirectUploadUrl && resolveBrowserUploadGrantSecret(env));
    const transport: MvpDirectUploadTransport = blobUploadAvailable ? "blob" : backendDirectUploadAvailable ? "backend" : null;

    return {
        available: Boolean(transport),
        transport,
        directUploadUrl: transport === "backend" ? backendDirectUploadUrl || undefined : undefined,
        allowedContentTypes: [...MVP_DIRECT_UPLOAD_ALLOWED_CONTENT_TYPES],
        maximumSizeInBytes: MVP_DIRECT_UPLOAD_MAX_BYTES,
        legacyProxyMaximumSizeInBytes: MVP_LEGACY_PROXY_UPLOAD_MAX_BYTES,
        pathPrefix: blobUploadAvailable ? MVP_DIRECT_UPLOAD_PATH_PREFIX : "",
    };
}

function normalizeUploadAudience(value: string) {
    try {
        const parsed = new URL(value.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return "";
        }
        parsed.hash = "";
        parsed.search = "";
        parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
        return parsed.toString();
    } catch {
        return "";
    }
}

function buildBrowserUploadGrantMessage({
    filename,
    contentType,
    size,
    expiresAt,
    audience,
    nonce,
}: {
    filename: string;
    contentType: string;
    size: number;
    expiresAt: number;
    audience: string;
    nonce: string;
}) {
    return [BROWSER_UPLOAD_GRANT_VERSION, filename, contentType, String(size), String(expiresAt), audience, nonce].join("\n");
}

export function isDirectUploadConfigured(env: NodeJS.ProcessEnv = process.env) {
    return Boolean((env.BLOB_READ_WRITE_TOKEN ?? "").trim());
}

function normalizeAbsoluteHttpUrl(value: string) {
    try {
        const parsed = new URL(value.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return "";
        }
        parsed.hash = "";
        return parsed.toString().replace(/\/$/, "");
    } catch {
        return "";
    }
}


export function parseBrowserDirectUploadGrantRequest(raw: unknown) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return {
            error: "Upload grant payload is missing.",
            payload: null as BrowserDirectUploadGrantRequest | null,
        };
    }

    const record = raw as Record<string, unknown>;
    const filename = normalizeUploadString(record.filename, 240);
    const contentType = normalizeUploadString(record.contentType, 120).toLowerCase();
    const size = normalizeUploadSize(record.size);

    if (!filename) {
        return {
            error: "Upload grant is missing the original filename.",
            payload: null as BrowserDirectUploadGrantRequest | null,
        };
    }

    if (!MVP_DIRECT_UPLOAD_ALLOWED_CONTENT_TYPES.includes(contentType as (typeof MVP_DIRECT_UPLOAD_ALLOWED_CONTENT_TYPES)[number])) {
        return {
            error: "Upload grant specified an unsupported still format.",
            payload: null as BrowserDirectUploadGrantRequest | null,
        };
    }

    if (!Number.isFinite(size) || size <= 0) {
        return {
            error: "Upload grant is missing a valid file size.",
            payload: null as BrowserDirectUploadGrantRequest | null,
        };
    }

    if (size > MVP_DIRECT_UPLOAD_MAX_BYTES) {
        return {
            error: `Upload exceeds the ${Math.round(MVP_DIRECT_UPLOAD_MAX_BYTES / (1024 * 1024))} MB intake limit.`,
            payload: null as BrowserDirectUploadGrantRequest | null,
        };
    }

    return {
        error: "",
        payload: {
            filename,
            contentType,
            size,
        } satisfies BrowserDirectUploadGrantRequest,
    };
}

export function issueBrowserDirectUploadGrant({
    filename,
    contentType,
    size,
    uploadUrl,
    env = process.env,
}: BrowserDirectUploadGrantRequest & {
    uploadUrl: string;
    env?: NodeJS.ProcessEnv;
}) {
    const expiresAt = Date.now() + BROWSER_UPLOAD_GRANT_TTL_MS;
    const secret = resolveBrowserUploadGrantSecret(env);
    if (!secret) {
        throw new Error("Direct backend upload signing is unavailable on this deployment.");
    }

    const audience = normalizeUploadAudience(uploadUrl);
    if (!audience) {
        throw new Error("Direct backend upload URL is invalid.");
    }

    const nonce = randomUUID().replace(/-/g, "");
    const headers = {
        "x-gauset-upload-filename": filename,
        "x-gauset-upload-content-type": contentType,
        "x-gauset-upload-size": String(size),
        "x-gauset-upload-expires": String(expiresAt),
        "x-gauset-upload-audience": audience,
        "x-gauset-upload-nonce": nonce,
        "x-gauset-upload-signature": createHmac("sha256", secret)
            .update(
                buildBrowserUploadGrantMessage({
                    filename,
                    contentType,
                    size,
                    expiresAt,
                    audience,
                    nonce,
                }),
                "utf8",
            )
            .digest("hex"),
    };

    return {
        uploadUrl: audience,
        headers,
        expiresAt,
        maximumSizeInBytes: MVP_DIRECT_UPLOAD_MAX_BYTES,
    };
}

export function parseCompleteDirectUploadPayload(raw: unknown) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return {
            error: "Upload completion payload is missing.",
            payload: null as CompleteDirectUploadPayload | null,
        };
    }

    const record = raw as Record<string, unknown>;
    const blobUrl = normalizeUploadString(record.blobUrl, 1_000);
    const pathname = normalizeUploadString(record.pathname, 512);
    const filename = normalizeUploadString(record.filename, 240);
    const contentType = normalizeUploadString(record.contentType, 120).toLowerCase();
    const size = normalizeUploadSize(record.size);

    if (!blobUrl || !isAllowedBlobStoreUrl(blobUrl)) {
        return {
            error: "Upload completion did not include a trusted blob URL.",
            payload: null as CompleteDirectUploadPayload | null,
        };
    }

    if (!pathname.startsWith(MVP_DIRECT_UPLOAD_PATH_PREFIX)) {
        return {
            error: "Upload completion path is outside the allowed intake prefix.",
            payload: null as CompleteDirectUploadPayload | null,
        };
    }

    if (!filename) {
        return {
            error: "Upload completion is missing the original filename.",
            payload: null as CompleteDirectUploadPayload | null,
        };
    }

    if (!MVP_DIRECT_UPLOAD_ALLOWED_CONTENT_TYPES.includes(contentType as (typeof MVP_DIRECT_UPLOAD_ALLOWED_CONTENT_TYPES)[number])) {
        return {
            error: "Upload completion specified an unsupported still format.",
            payload: null as CompleteDirectUploadPayload | null,
        };
    }

    if (!Number.isFinite(size) || size <= 0) {
        return {
            error: "Upload completion is missing a valid file size.",
            payload: null as CompleteDirectUploadPayload | null,
        };
    }

    if (size > MVP_DIRECT_UPLOAD_MAX_BYTES) {
        return {
            error: `Upload exceeds the ${Math.round(MVP_DIRECT_UPLOAD_MAX_BYTES / (1024 * 1024))} MB intake limit.`,
            payload: null as CompleteDirectUploadPayload | null,
        };
    }

    return {
        error: "",
        payload: {
            blobUrl,
            pathname,
            filename,
            contentType,
            size,
        } satisfies CompleteDirectUploadPayload,
    };
}

async function finalizeDirectUploadIntoSharedBlobStore(payload: CompleteDirectUploadPayload) {
    if (!isDirectUploadConfigured()) {
        throw new Error("Direct durable uploads are unavailable on this deployment.");
    }

    const imageId = randomUUID().replace(/-/g, "");
    const extension = resolveStoredUploadExtension(payload.filename, payload.contentType);
    const storedFilename = `${imageId}${extension}`;
    const record = buildStoredUploadRecord({
        imageId,
        originalFilename: payload.filename,
        storedFilename,
    });

    await copy(payload.blobUrl, record.storage_path, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: payload.contentType,
    });

    await put(`${UPLOAD_META_PREFIX}${imageId}.json`, JSON.stringify(record, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
    });

    return buildStoredUploadResponse(record);
}

export async function importDirectUploadIntoBackend({
    request,
    accessContext,
    payload,
}: {
    request: NextRequest;
    accessContext: ProxyAccessContext;
    payload: CompleteDirectUploadPayload;
}) {
    const backendBaseUrl = resolveBackendBaseUrlForOrigin({
        origin: request.nextUrl.origin,
    });
    if (!backendBaseUrl) {
        return buildUnavailableResponse("upload/ingest");
    }

    const headers = buildUpstreamRequestHeaders({
        requestHeaders: request.headers,
        workerToken: resolveBackendWorkerToken(),
        studioId: accessContext.session?.activeStudioId ?? null,
        userId: accessContext.session?.user.userId ?? null,
    });
    headers.set("content-type", "application/json");

    const upstreamUrl = buildUpstreamUrl({
        backendBaseUrl,
        pathname: "upload/ingest",
        searchParams: new URLSearchParams(),
    });

    try {
        const upstream = await fetch(upstreamUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                url: payload.blobUrl,
                original_filename: payload.filename,
                content_type: payload.contentType,
                size_bytes: payload.size,
            }),
            cache: "no-store",
            signal: request.signal,
        });

        if (upstream.status === 404 || upstream.status === 405) {
            const finalizedUpload = await finalizeDirectUploadIntoSharedBlobStore(payload);
            void del(payload.blobUrl).catch((error) => {
                console.warn("[mvp-upload] failed to delete staging blob after shared-store finalize", error);
            });
            return Response.json(finalizedUpload);
        }

        const responseBody = await upstream.text();

        if (upstream.ok) {
            void del(payload.blobUrl).catch((error) => {
                console.warn("[mvp-upload] failed to delete staging blob after backend import", error);
            });
        }

        return new Response(responseBody, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: buildProxyResponseHeaders(upstream.headers),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown upstream error";
        return buildBackendProxyErrorResponse("upload/ingest", message);
    }
}
