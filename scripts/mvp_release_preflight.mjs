import { assert, fetchJson, resolveBaseUrl, summarizeSetupStatus } from "./mvp_release_shared.mjs";

async function main() {
    const baseUrl = resolveBaseUrl();
    const health = await fetchJson("/health", {}, "health", baseUrl);
    assert(health.status === "ok", `Unexpected health payload: ${JSON.stringify(health)}`);

    const deployment = await fetchJson("/deployment", {}, "deployment", baseUrl);
    assert(deployment.status === "ok", `Unexpected deployment payload: ${JSON.stringify(deployment)}`);
    assert(typeof deployment.fingerprint?.build_label === "string" && deployment.fingerprint.build_label.length > 0, "Deployment fingerprint is missing build_label.");
    assert(typeof deployment.fingerprint?.deployment_host === "string" && deployment.fingerprint.deployment_host.length > 0, "Deployment fingerprint is missing deployment_host.");
    assert(typeof deployment.fingerprint?.runtime_target === "string" && deployment.fingerprint.runtime_target.length > 0, "Deployment fingerprint is missing runtime_target.");

    const setupStatus = await fetchJson("/setup/status", {}, "setup status", baseUrl);
    assert(setupStatus.status === "ok", `Unexpected setup/status payload: ${JSON.stringify(setupStatus)}`);
    assert(setupStatus.storage_mode === "blob", `Expected storage_mode=blob but received ${setupStatus.storage_mode}`);
    assert(setupStatus.storage?.public_write_safe === true, "Public MVP storage is not durable.");
    assert(setupStatus.capabilities?.preview?.available === true, "Preview lane is not available.");
    assert(setupStatus.capabilities?.asset?.available === true, "Asset lane is not available.");
    assert(setupStatus.capabilities?.reconstruction?.available === false, "Reconstruction lane unexpectedly reports available.");
    assert(setupStatus.release_gates?.truthful_preview_lane === setupStatus.capabilities?.preview?.available, "truthful_preview_lane does not match preview availability.");
    assert(setupStatus.release_gates?.gpu_reconstruction_connected === false, "Public release gates still claim GPU reconstruction connectivity.");
    assert(setupStatus.release_gates?.native_gaussian_training === false, "Public release gates still claim native Gaussian training.");
    assert(setupStatus.reconstruction_backend?.gpu_worker_connected === false, "Public reconstruction backend still claims a connected GPU worker.");
    assert(setupStatus.reconstruction_backend?.native_gaussian_training === false, "Public reconstruction backend still claims native Gaussian training.");

    console.log(
        JSON.stringify(
            {
                status: "pass",
                check: "mvp_release_preflight",
                summary: summarizeSetupStatus(setupStatus),
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
