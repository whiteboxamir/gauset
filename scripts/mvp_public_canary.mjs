import {
    assert,
    fetchJson,
    fetchRequiredJson,
    headRequired,
    joinBaseUrl,
    pollJob,
    resolveBaseUrl,
    saveScene,
    startEnvironmentGeneration,
    uploadImage,
} from "./mvp_release_shared.mjs";

function buildMinimalSceneGraph(sceneId, urls) {
    return {
        environment: {
            id: sceneId,
            urls: {
                viewer: urls.viewer,
                splats: urls.splats,
                cameras: urls.cameras,
                metadata: urls.metadata,
            },
        },
        assets: [],
        camera_views: [],
        pins: [],
        director_path: [],
        director_brief: "",
        viewer: {
            fov: 45,
            lens_mm: 35,
        },
    };
}

async function main() {
    const baseUrl = resolveBaseUrl();
    const setupStatus = await fetchJson("/setup/status", {}, "setup status", baseUrl);
    assert(setupStatus.storage_mode === "blob", `Expected durable blob storage before canary, received ${setupStatus.storage_mode}`);
    assert(setupStatus.capabilities?.preview?.available === true, "Preview lane is unavailable.");

    const upload = await uploadImage({ baseUrl });
    assert(typeof upload.upload?.image_id === "string" && upload.upload.image_id, `Upload did not return image_id: ${JSON.stringify(upload)}`);
    assert(upload.transport === "blob" || upload.transport === "backend", `Unexpected upload transport: ${JSON.stringify(upload)}`);
    assert(upload.capability?.available === true, `Direct upload capability is unavailable: ${JSON.stringify(upload.capability)}`);

    const generation = await startEnvironmentGeneration(upload.upload.image_id, { baseUrl });
    assert(typeof generation.job_id === "string" && generation.job_id, `Generation did not return job_id: ${JSON.stringify(generation)}`);

    const job = await pollJob(generation.job_id, { baseUrl });
    assert(job.status === "completed", `Environment generation did not complete successfully: ${JSON.stringify(job)}`);

    const result = job.result || {};
    const urls = result.urls || {};
    const sceneId = result.scene_id;
    assert(typeof sceneId === "string" && sceneId, `Completed environment job is missing scene_id: ${JSON.stringify(job)}`);

    const metadataUrl = joinBaseUrl(urls.metadata, baseUrl);
    const splatUrl = joinBaseUrl(urls.splats, baseUrl);
    const versionsUrl = joinBaseUrl(`/api/mvp/scene/${sceneId}/versions`, baseUrl);

    const metadata = await fetchRequiredJson(metadataUrl, "environment metadata");
    const splatHead = await headRequired(splatUrl, "environment splat");
    const save = await saveScene(sceneId, buildMinimalSceneGraph(sceneId, urls), { baseUrl, source: "canary" });
    const versions = await fetchRequiredJson(versionsUrl, "scene versions");

    assert(save.status === "saved", `Unexpected save payload: ${JSON.stringify(save)}`);
    assert(Array.isArray(versions.versions) && versions.versions.length > 0, `Scene versions missing after save: ${JSON.stringify(versions)}`);

    console.log(
        JSON.stringify(
            {
                status: "pass",
                check: "mvp_public_canary",
                baseUrl,
                upload_transport: upload.transport,
                direct_upload_available: upload.capability?.available ?? null,
                direct_upload_max_bytes: upload.capability?.maximumSizeInBytes ?? null,
                image_id: upload.upload.image_id,
                scene_id: sceneId,
                version_id: save.version_id,
                storage_mode: metadata.storage_mode || null,
                viewer_renderer: metadata.rendering?.viewer_renderer || null,
                splat_status: splatHead.status,
                splat_content_type: splatHead.contentType,
                version_count: versions.versions.length,
            },
            null,
            2,
        ),
    );
}

main().catch((error) => {
    console.error(
        JSON.stringify(
            {
                status: "fail",
                check: "mvp_public_canary",
                message: error instanceof Error ? error.message : String(error),
            },
            null,
            2,
        ),
    );
    process.exit(1);
});
