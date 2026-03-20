"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

import type { MvpWorkspaceIntakeController } from "@/app/mvp/_hooks/useMvpWorkspaceIntakeController";
import type { WorkspaceLaunchSourceKind } from "@/app/mvp/_hooks/mvpWorkspaceSessionShared";

import type { LeftPanelPreviewWorkspaceNavigation } from "./leftPanelShared";

type LeftPanelWorkspaceSummaryProps = Pick<
    MvpWorkspaceIntakeController,
    | "assetCapability"
    | "backendMessage"
    | "backendMode"
    | "benchmarkStatusLabel"
    | "captureSession"
    | "minimumCaptureImages"
    | "previewCapability"
    | "recommendedCaptureImages"
    | "reconstructionBackendName"
    | "reconstructionCapability"
    | "releaseGateFailureCount"
    | "selectedUpload"
    | "setupTruth"
> & {
    clarityMode?: boolean;
    journeyStage?: "start" | "unsaved" | "saved";
    launchProjectId?: string | null;
    launchSourceKind?: WorkspaceLaunchSourceKind | null;
    previewWorkspaceNavigation?: LeftPanelPreviewWorkspaceNavigation | null;
};

function describeLaunchSource(launchSourceKind?: WorkspaceLaunchSourceKind | null) {
    switch (launchSourceKind) {
        case "upload":
            return "Scout stills attached";
        case "capture_session":
            return "Capture path attached";
        case "external_world_package":
            return "External world attached";
        case "third_party_world_model_output":
            return "Third-party world attached";
        case "provider_generated_still":
            return "Generated still attached";
        case "linked_scene_version":
            return "Linked world attached";
        case "demo_world":
            return "Sample shell attached";
        default:
            return "";
    }
}

function backendTone(backendMode: LeftPanelWorkspaceSummaryProps["backendMode"]) {
    if (backendMode === "offline") return "border-rose-400/20 bg-rose-500/10 text-rose-100";
    if (backendMode === "degraded") return "border-amber-400/20 bg-amber-500/10 text-amber-100";
    if (backendMode === "checking") return "border-cyan-300/20 bg-cyan-400/10 text-cyan-50";
    return "border-white/10 bg-white/[0.04] text-neutral-200";
}

export function LeftPanelWorkspaceSummary({
    assetCapability,
    backendMessage,
    backendMode,
    benchmarkStatusLabel,
    captureSession,
    journeyStage = "start",
    launchProjectId = null,
    launchSourceKind = null,
    minimumCaptureImages,
    previewCapability,
    previewWorkspaceNavigation = null,
    recommendedCaptureImages,
    reconstructionBackendName,
    reconstructionCapability,
    releaseGateFailureCount,
    selectedUpload,
    setupTruth,
}: LeftPanelWorkspaceSummaryProps) {
    const launchSourceLabel = describeLaunchSource(launchSourceKind);
    const captureFrameCount = captureSession?.frame_count ?? 0;
    const hasSelectedSource = Boolean(selectedUpload || captureFrameCount > 0);
    const stepNumber = journeyStage === "saved" ? 3 : hasSelectedSource ? 2 : 1;
    const stageBadge = journeyStage === "saved" ? "Saved" : hasSelectedSource ? "World ready" : "Source";
    const sourceLabel = selectedUpload
        ? selectedUpload.sourceName
        : captureFrameCount > 0
          ? `${captureFrameCount} capture view${captureFrameCount === 1 ? "" : "s"}`
          : launchSourceLabel || (launchProjectId ? "Project attached" : "Nothing selected yet");
    const title =
        journeyStage === "saved"
            ? "First world anchored"
            : hasSelectedSource
              ? "Build the first world"
              : launchProjectId
                ? "Choose the first source"
                : "Start with one source";
    const body =
        journeyStage === "saved"
            ? "The first save is in place. Review, history, and deeper tools can open now."
            : hasSelectedSource
              ? "Use the selected source to build the first world, then save once."
              : launchProjectId
                ? "Add one still or a capture set for this project. Everything else can wait."
                : "Add one still or a small capture set. Keep the opening move simple.";
    const compactStatus =
        backendMode === "offline"
            ? "The local backend is offline. Reconnect it before uploading or building."
            : backendMode === "checking"
              ? backendMessage || "Checking backend capabilities..."
            : backendMode === "degraded"
              ? backendMessage || setupTruth || "One lane still needs attention."
              : !previewCapability?.available
                ? previewCapability?.truth ?? previewCapability?.summary ?? "Preview lane unavailable."
                : "";
    const showSystemStatus =
        (backendMode !== "ready" && backendMode !== "checking") || !previewCapability?.available || journeyStage === "saved";

    return (
        <>
            {previewWorkspaceNavigation ? (
                <div
                    className="mb-3 rounded-[18px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(22,28,34,0.94),rgba(16,20,24,0.96))] px-3.5 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.18)]"
                    data-testid="mvp-preview-workspace-nav"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#bfd6de]/78">
                                {previewWorkspaceNavigation.eyebrow ?? "World entry"}
                            </p>
                            <p className="mt-1 text-sm font-medium tracking-tight text-white">
                                {previewWorkspaceNavigation.title ?? "Current workspace"}
                            </p>
                        </div>
                        {previewWorkspaceNavigation.backToStartHref ? (
                            <Link
                                href={previewWorkspaceNavigation.backToStartHref}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                                data-testid="mvp-preview-back-to-start"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                {previewWorkspaceNavigation.backLabel ?? "Return to launchpad"}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={previewWorkspaceNavigation.onBackToStart}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                                data-testid="mvp-preview-back-to-start"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                {previewWorkspaceNavigation.backLabel ?? "Return to launchpad"}
                            </button>
                        )}
                    </div>
                </div>
            ) : null}

            <section
                className="mb-4 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] px-4 py-4 shadow-[0_14px_32px_rgba(0,0,0,0.18)]"
                data-testid="mvp-session-status"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-400">Step {stepNumber} of 3</p>
                        <h2 className="mt-2 text-[17px] font-medium tracking-[-0.03em] text-white" data-testid="mvp-shell-title">
                            {title}
                        </h2>
                        <p className="mt-2 text-[12px] leading-5 text-neutral-300">{body}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-200">
                        {stageBadge}
                    </span>
                </div>

                <div className="mt-4 rounded-[18px] border border-white/8 bg-black/15 px-3.5 py-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Current source</p>
                    <p className="mt-2 text-sm text-white">{sourceLabel}</p>
                </div>

                {compactStatus ? (
                    <div className="mt-3 flex items-start gap-2 rounded-[18px] border border-white/8 bg-black/15 px-3.5 py-3 text-[11px] leading-5 text-neutral-300">
                        {backendMode === "checking" ? (
                            <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-neutral-300" />
                        ) : (
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />
                        )}
                        <p>{compactStatus}</p>
                    </div>
                ) : null}

                {showSystemStatus ? (
                    <details className="mt-3 rounded-[18px] border border-white/8 bg-black/15">
                        <summary className="cursor-pointer list-none px-3.5 py-3 text-[11px] font-medium text-neutral-300 marker:content-none">
                            System status
                        </summary>
                        <div className="space-y-3 border-t border-white/8 px-3.5 py-3 text-[11px] leading-5 text-neutral-400">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Preview</p>
                                <p className="mt-1 text-white">
                                    {previewCapability?.available ? "Available" : "Unavailable"}
                                </p>
                                <p className="mt-1">{previewCapability?.truth ?? previewCapability?.summary ?? "Preview lane not reported."}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Capture</p>
                                <p className="mt-1 text-white">
                                    {captureFrameCount > 0
                                        ? `${captureFrameCount} / ${recommendedCaptureImages} views`
                                        : `${minimumCaptureImages} minimum / ${recommendedCaptureImages} target`}
                                </p>
                                <p className="mt-1">
                                    {reconstructionCapability?.available
                                        ? reconstructionCapability.summary
                                        : reconstructionCapability?.truth ?? "Reconstruction is not ready in this backend."}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Asset</p>
                                <p className="mt-1 text-white">{assetCapability?.available ? "Available" : "Locked until later"}</p>
                                <p className="mt-1">{assetCapability?.truth ?? assetCapability?.summary ?? "Asset lane not reported."}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Backend</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${backendTone(backendMode)}`}>
                                        {backendMode}
                                    </span>
                                    <span>{benchmarkStatusLabel}</span>
                                    <span>{reconstructionBackendName.replaceAll("_", " ")}</span>
                                </div>
                                <p className="mt-2">{backendMessage || setupTruth || "Backend truth not reported."}</p>
                                {releaseGateFailureCount > 0 ? (
                                    <p className="mt-1 text-amber-200">
                                        {releaseGateFailureCount} release gate{releaseGateFailureCount === 1 ? "" : "s"} need attention.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </details>
                ) : null}
            </section>
        </>
    );
}
