import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const DEFAULT_BASE_URL = (process.env.GAUSET_MVP_BASE_URL || "https://gauset.com").trim().replace(/\/+$/, "");
export const DEFAULT_IMAGE_PATH = resolve(process.cwd(), "backend/ml-sharp/data/teaser.jpg");
export const DEFAULT_TIMEOUT_MS = Number(process.env.GAUSET_MVP_CANARY_TIMEOUT_MS || 180000);

export function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function resolveBaseUrl() {
    assert(/^https?:\/\//.test(DEFAULT_BASE_URL), `Invalid GAUSET_MVP_BASE_URL: ${DEFAULT_BASE_URL}`);
    return DEFAULT_BASE_URL;
}

export function apiUrl(pathname, baseUrl = resolveBaseUrl()) {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return new URL(`/api/mvp${normalizedPath}`, `${baseUrl}/`).toString();
}

export function joinBaseUrl(pathname, baseUrl = resolveBaseUrl()) {
    if (pathname.startsWith("/storage/")) {
        return new URL(`/api/mvp${pathname}`, `${baseUrl}/`).toString();
    }
    return new URL(pathname, `${baseUrl}/`).toString();
}

export async function readJsonResponse(response, context) {
    const bodyText = await response.text();
    if (!response.ok) {
        throw new Error(`${context} failed (${response.status}): ${bodyText}`);
    }

    try {
        return JSON.parse(bodyText);
    } catch (error) {
        throw new Error(`${context} returned non-JSON payload: ${bodyText.slice(0, 400)}`);
    }
}

export async function fetchJson(pathname, init = {}, context = pathname, baseUrl = resolveBaseUrl()) {
    const response = await fetch(apiUrl(pathname, baseUrl), {
        ...init,
        headers: {
            Accept: "application/json",
            ...(init.headers || {}),
        },
    });
    return readJsonResponse(response, context);
}

export async function fetchRequiredJson(url, context) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
    });
    return readJsonResponse(response, context);
}

export async function headRequired(url, context) {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(`${context} failed (${response.status}): ${bodyText}`);
    }
    return {
        status: response.status,
        contentType: response.headers.get("content-type") || null,
        contentLength: response.headers.get("content-length") || null,
    };
}

export async function wait(ms) {
    return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

export async function pollJob(jobId, { baseUrl = resolveBaseUrl(), timeoutMs = DEFAULT_TIMEOUT_MS, intervalMs = 1000 } = {}) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        const payload = await fetchJson(`/jobs/${jobId}`, {}, `job ${jobId}`, baseUrl);
        if (payload.status === "completed" || payload.status === "failed") {
            return payload;
        }
        await wait(intervalMs);
    }

    throw new Error(`Timed out waiting for job ${jobId} after ${timeoutMs}ms.`);
}

export async function uploadImage({ imagePath = DEFAULT_IMAGE_PATH, baseUrl = resolveBaseUrl() } = {}) {
    const fileBuffer = await readFile(imagePath);
    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer]), imagePath.split("/").pop() || "teaser.jpg");
    const response = await fetch(apiUrl("/upload", baseUrl), {
        method: "POST",
        body: formData,
    });
    return readJsonResponse(response, "upload");
}

export async function startEnvironmentGeneration(imageId, { baseUrl = resolveBaseUrl() } = {}) {
    const response = await fetch(apiUrl("/generate/environment", baseUrl), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ image_id: imageId }),
    });
    return readJsonResponse(response, "generate environment");
}

export async function saveScene(sceneId, sceneGraph, { baseUrl = resolveBaseUrl(), source = "manual" } = {}) {
    const response = await fetch(apiUrl("/scene/save", baseUrl), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            scene_id: sceneId,
            scene_graph: sceneGraph,
            source,
        }),
    });
    return readJsonResponse(response, "save scene");
}

export function summarizeSetupStatus(payload) {
    return {
        baseUrl: resolveBaseUrl(),
        storage_mode: payload.storage_mode,
        durable_public_storage: Boolean(payload.storage?.public_write_safe),
        preview_available: Boolean(payload.capabilities?.preview?.available),
        asset_available: Boolean(payload.capabilities?.asset?.available),
        reconstruction_available: Boolean(payload.capabilities?.reconstruction?.available),
        backend_kind: payload.backend?.kind || null,
        backend_truth: payload.backend?.truth || null,
    };
}
