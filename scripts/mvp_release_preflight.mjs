import { assert, fetchJson, fetchPage, fetchRedirect, resolveBaseUrl, summarizeSetupStatus } from "./mvp_release_shared.mjs";

async function main() {
    const baseUrl = resolveBaseUrl();
    const health = await fetchJson("/health", {}, "health", baseUrl);
    assert(health.status === "ok", `Unexpected health payload: ${JSON.stringify(health)}`);

    const deployment = await fetchJson("/deployment", {}, "deployment", baseUrl);
    assert(deployment.status === "ok", `Unexpected deployment payload: ${JSON.stringify(deployment)}`);
    assert(typeof deployment.fingerprint?.build_label === "string" && deployment.fingerprint.build_label.length > 0, "Deployment fingerprint is missing build_label.");
    assert(typeof deployment.fingerprint?.deployment_host === "string" && deployment.fingerprint.deployment_host.length > 0, "Deployment fingerprint is missing deployment_host.");
    assert(typeof deployment.fingerprint?.runtime_target === "string" && deployment.fingerprint.runtime_target.length > 0, "Deployment fingerprint is missing runtime_target.");

    const uploadInit = await fetchJson("/upload-init", {}, "upload init", baseUrl);
    assert(uploadInit.available === true, `Upload init does not advertise a direct upload path: ${JSON.stringify(uploadInit)}`);
    assert(uploadInit.transport === "blob" || uploadInit.transport === "backend", `Unexpected upload transport: ${JSON.stringify(uploadInit)}`);
    assert(
        Number(uploadInit.maximumSizeInBytes) > Number(uploadInit.legacyProxyMaximumSizeInBytes),
        `Direct upload limit does not exceed legacy proxy limit: ${JSON.stringify(uploadInit)}`,
    );

    const setupStatus = await fetchJson("/setup/status", {}, "setup status", baseUrl);
    const durablePublicStorage =
        setupStatus.storage?.public_write_safe === true ||
        (setupStatus.storage_mode === "blob" && uploadInit.available === true && uploadInit.transport === "blob");
    assert(setupStatus.status === "ok", `Unexpected setup/status payload: ${JSON.stringify(setupStatus)}`);
    assert(setupStatus.storage_mode === "blob", `Expected storage_mode=blob but received ${setupStatus.storage_mode}`);
    assert(durablePublicStorage, "Public MVP storage is not durable.");
    assert(setupStatus.capabilities?.preview?.available === true, "Preview lane is not available.");
    assert(setupStatus.capabilities?.asset?.available === true, "Asset lane is not available.");
    assert(setupStatus.capabilities?.reconstruction?.available === false, "Reconstruction lane unexpectedly reports available.");
    assert(setupStatus.release_gates?.truthful_preview_lane === setupStatus.capabilities?.preview?.available, "truthful_preview_lane does not match preview availability.");
    assert(setupStatus.release_gates?.gpu_reconstruction_connected === false, "Public release gates still claim GPU reconstruction connectivity.");
    assert(setupStatus.release_gates?.native_gaussian_training === false, "Public release gates still claim native Gaussian training.");
    assert(setupStatus.reconstruction_backend?.gpu_worker_connected === false, "Public reconstruction backend still claims a connected GPU worker.");
    assert(setupStatus.reconstruction_backend?.native_gaussian_training === false, "Public reconstruction backend still claims native Gaussian training.");

    const worldsHtml = await fetchPage("/app/worlds", {}, "world record library page", baseUrl);
    assert(worldsHtml.includes("Build one world. Save it once. Then direct it."), "World record library is missing the protected sentence.");

    const mvpHtml = await fetchPage("/mvp", {}, "mvp launchpad", baseUrl);
    assert(mvpHtml.includes("Project-first entry"), "Bare /mvp no longer renders the project-first launchpad.");

    const previewRedirect = await fetchRedirect("/mvp/preview?entry=workspace", "preview canonicalization", baseUrl);
    assert(previewRedirect.location.includes("/mvp?entry=workspace"), `Preview compatibility route did not redirect to /mvp: ${JSON.stringify(previewRedirect)}`);

    console.log(
        JSON.stringify(
            {
                status: "pass",
                check: "mvp_release_preflight",
                summary: summarizeSetupStatus(setupStatus),
                upload: {
                    transport: uploadInit.transport || null,
                    maximumSizeInBytes: uploadInit.maximumSizeInBytes ?? null,
                    legacyProxyMaximumSizeInBytes: uploadInit.legacyProxyMaximumSizeInBytes ?? null,
                },
                durable_public_storage: durablePublicStorage,
                routes: {
                    worlds_sentence: true,
                    mvp_launchpad: true,
                    preview_redirect_status: previewRedirect.status,
                },
                deployment: {
                    build_label: deployment.fingerprint?.build_label || null,
                    deployment_host: deployment.fingerprint?.deployment_host || null,
                    runtime_target: deployment.fingerprint?.runtime_target || null,
                },
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
                check: "mvp_release_preflight",
                message: error instanceof Error ? error.message : String(error),
            },
            null,
            2,
        ),
    );
    process.exit(1);
});
