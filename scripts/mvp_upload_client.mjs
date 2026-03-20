#!/usr/bin/env node

import { basename, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { upload } from "@vercel/blob/client";

const DIRECT_UPLOAD_MULTIPART_THRESHOLD_BYTES = 8 * 1024 * 1024;

function normalizeBaseUrl(baseUrl) {
    return String(baseUrl || "").trim().replace(/\/+$/, "");
}

function inferContentType(filePath) {
    const lowerPath = filePath.toLowerCase();
    if (lowerPath.endsWith(".png")) return "image/png";
    if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) return "image/jpeg";
    if (lowerPath.endsWith(".webp")) return "image/webp";
    return "application/octet-stream";
}

function sanitizeUploadFilename(value) {
    return (
        String(value || "")
            .trim()
            .toLowerCase()
            .replaceAll(" ", "-")
            .replace(/[^a-z0-9._-]+/g, "-")
            .replace(/\.{2,}/g, ".")
            .replace(/^-+/, "")
            .replace(/-+$/, "") || "source-still.png"
    );
}

function buildDirectUploadPath(filename) {
    const dayStamp = new Date().toISOString().slice(0, 10);
    return `mvp/source-stills/${dayStamp}/${sanitizeUploadFilename(filename)}`;
}

async function parseJsonResponse(response, context) {
    const bodyText = await response.text();
    if (!response.ok) {
        throw new Error(`${context} failed (${response.status}): ${bodyText}`);
    }

    try {
        return JSON.parse(bodyText);
    } catch {
        throw new Error(`${context} returned non-JSON payload: ${bodyText.slice(0, 400)}`);
    }
}

async function uploadViaFormData({ url, fileBlob, filename, headers = {}, context }) {
    const formData = new FormData();
    formData.append("file", fileBlob, filename);
    const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
    });
    return parseJsonResponse(response, context);
}

export async function uploadImageViaMvp({
    baseUrl,
    filePath,
    filename = basename(filePath),
    contentType = inferContentType(filePath),
}) {
    const resolvedBaseUrl = normalizeBaseUrl(baseUrl);
    const resolvedFilePath = resolve(filePath);
    const fileBuffer = await readFile(resolvedFilePath);
    const fileBlob = new Blob([fileBuffer], { type: contentType });

    const uploadInitResponse = await fetch(`${resolvedBaseUrl}/api/mvp/upload-init`, {
        headers: {
            Accept: "application/json",
        },
        cache: "no-store",
    });
    const capability = await parseJsonResponse(uploadInitResponse, "upload init");

    if (capability.available && capability.transport === "blob") {
        const directBlob = await upload(buildDirectUploadPath(filename), fileBlob, {
            access: "public",
            handleUploadUrl: `${resolvedBaseUrl}/api/mvp/upload-init`,
            contentType,
            clientPayload: JSON.stringify({
                filename,
                contentType,
                size: fileBuffer.byteLength,
            }),
            multipart: fileBuffer.byteLength >= DIRECT_UPLOAD_MULTIPART_THRESHOLD_BYTES,
        });

        const completionResponse = await fetch(`${resolvedBaseUrl}/api/mvp/upload`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                blobUrl: directBlob.url,
                pathname: directBlob.pathname,
                filename,
                contentType: directBlob.contentType || contentType,
                size: fileBuffer.byteLength,
            }),
        });
        const uploadPayload = await parseJsonResponse(completionResponse, "blob upload completion");
        return {
            transport: "blob",
            capability,
            upload: uploadPayload,
            directBlob: {
                url: directBlob.url,
                pathname: directBlob.pathname,
                contentType: directBlob.contentType || contentType,
            },
        };
    }

    if (capability.available && capability.transport === "backend") {
        const ticketResponse = await fetch(`${resolvedBaseUrl}/api/mvp/upload-ticket`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                filename,
                contentType,
                size: fileBuffer.byteLength,
            }),
        });
        const ticket = await parseJsonResponse(ticketResponse, "upload ticket");
        const uploadPayload = await uploadViaFormData({
            url: typeof ticket.uploadUrl === "string" && ticket.uploadUrl ? ticket.uploadUrl : capability.directUploadUrl,
            fileBlob,
            filename,
            headers: ticket.headers && typeof ticket.headers === "object" ? ticket.headers : {},
            context: "direct backend upload",
        });
        return {
            transport: "backend",
            capability,
            upload: uploadPayload,
            ticket,
        };
    }

    const uploadPayload = await uploadViaFormData({
        url: `${resolvedBaseUrl}/api/mvp/upload`,
        fileBlob,
        filename,
        context: "legacy upload",
    });

    return {
        transport: "legacy",
        capability,
        upload: uploadPayload,
    };
}

async function main() {
    const args = process.argv.slice(2);
    const baseUrlIndex = args.indexOf("--base-url");
    const fileIndex = args.indexOf("--file");
    const baseUrl = baseUrlIndex >= 0 ? args[baseUrlIndex + 1] : "https://gauset.com";
    const filePath = fileIndex >= 0 ? args[fileIndex + 1] : "";

    if (!filePath) {
        throw new Error("Usage: node scripts/mvp_upload_client.mjs --base-url <url> --file <path>");
    }

    const result = await uploadImageViaMvp({ baseUrl, filePath });
    console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error(
            JSON.stringify(
                {
                    status: "fail",
                    check: "mvp_upload_client",
                    message: error instanceof Error ? error.message : String(error),
                },
                null,
                2,
            ),
        );
        process.exit(1);
    });
}
