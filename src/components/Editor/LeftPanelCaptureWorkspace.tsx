"use client";

import { Box, ImageIcon, Loader2, Upload } from "lucide-react";

import type { MvpWorkspaceIntakeController } from "@/app/mvp/_hooks/useMvpWorkspaceIntakeController";
import { toProxyUrl } from "@/lib/mvp-api";

import { formatBandLabel, formatScore, truncateLabel } from "./leftPanelShared";

type LeftPanelCaptureWorkspaceProps = Pick<
    MvpWorkspaceIntakeController,
    | "addSelectedToCaptureSet"
    | "assetCapability"
    | "backendMode"
    | "backendWritesDisabled"
    | "captureBlockers"
    | "captureDuplicateRatioPercent"
    | "captureNextActions"
    | "captureQualitySummary"
    | "captureSession"
    | "captureSetBlocked"
    | "captureUniqueFrameCount"
    | "errorText"
    | "generateAsset"
    | "generatePreview"
    | "isGeneratingAsset"
    | "isGeneratingPreview"
    | "isUploading"
    | "isStartingReconstruction"
    | "isUpdatingCapture"
    | "minimumCaptureImages"
    | "previewCapability"
    | "recommendedCaptureImages"
    | "reconstructionAvailable"
    | "reconstructionCapability"
    | "reconstructionButtonLabel"
    | "selectedUpload"
    | "selectedUploadAnalysis"
    | "selectedUploadId"
    | "setSelectedUploadId"
    | "startReconstruction"
    | "statusText"
    | "uploads"
> & {
    allowAssetActions?: boolean;
    previewButtonLabel?: string;
};

export function LeftPanelCaptureWorkspace({
    addSelectedToCaptureSet,
    allowAssetActions = false,
    assetCapability,
    backendMode,
    backendWritesDisabled,
    captureBlockers,
    captureDuplicateRatioPercent,
    captureNextActions,
    captureQualitySummary,
    captureSession,
    captureSetBlocked,
    captureUniqueFrameCount,
    errorText,
    generateAsset,
    generatePreview,
    isGeneratingAsset,
    isGeneratingPreview,
    isUploading,
    isStartingReconstruction,
    isUpdatingCapture,
    minimumCaptureImages,
    previewCapability,
    recommendedCaptureImages,
    reconstructionAvailable,
    reconstructionCapability,
    reconstructionButtonLabel,
    selectedUpload,
    selectedUploadAnalysis,
    setSelectedUploadId,
    startReconstruction,
    statusText,
    uploads,
    previewButtonLabel = "Build world preview",
}: LeftPanelCaptureWorkspaceProps) {
    const previewDisabled =
        !selectedUpload ||
        isUploading ||
        isGeneratingPreview ||
        isGeneratingAsset ||
        backendMode === "offline" ||
        backendWritesDisabled ||
        !previewCapability?.available;
    const previewNote =
        !selectedUpload
            ? "Select one still first."
            : backendMode === "offline"
              ? "Reconnect the backend first."
              : backendWritesDisabled
                ? "Writes are disabled on this backend."
                : !previewCapability?.available
                  ? previewCapability?.truth ?? previewCapability?.summary ?? "Preview is unavailable here."
                  : "Use the selected source to build the first world.";
    const reconstructionTruth =
        reconstructionCapability?.truth ??
        reconstructionCapability?.summary ??
        "Multi-view reconstruction is intentionally unavailable in this backend.";
    const showCaptureDetails =
        Boolean(selectedUploadAnalysis) ||
        Boolean(captureSession?.frame_count) ||
        Boolean(captureQualitySummary) ||
        !reconstructionAvailable ||
        allowAssetActions;

    return (
        <>
            {statusText ? (
                <div className="mb-4 rounded-[18px] border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-3 text-[11px] leading-5 text-emerald-100">
                    {statusText}
                </div>
            ) : null}
            {errorText ? (
                <div className="mb-4 rounded-[18px] border border-rose-400/20 bg-rose-500/10 px-3.5 py-3 text-[11px] leading-5 text-rose-100">
                    {errorText}
                </div>
            ) : null}

            {uploads.length > 0 ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-6">
                    <section
                        className="order-2 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.76),rgba(10,14,19,0.9))] p-4"
                        data-testid="mvp-capture-tray"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Selected source</p>
                                <p className="mt-2 text-sm text-white">{selectedUpload?.sourceName ?? `${uploads.length} stills ready`}</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                                {uploads.length} still{uploads.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {uploads.map((upload) => {
                                const isSelected = upload.image_id === selectedUpload?.image_id;
                                return (
                                    <button
                                        key={upload.image_id}
                                        type="button"
                                        onClick={() => setSelectedUploadId(upload.image_id)}
                                        className={`relative aspect-square rounded-xl border bg-neutral-950 bg-cover bg-center text-left transition-all ${
                                            isSelected ? "border-blue-500/70 shadow-lg shadow-blue-950/30" : "border-neutral-800 hover:border-neutral-700"
                                        }`}
                                        style={{ backgroundImage: `url(${upload.previewUrl})` }}
                                        title={upload.sourceName}
                                    >
                                        {typeof upload.analysis?.technical_score === "number" ? (
                                            <span className="absolute right-1 top-1 rounded-md bg-black/70 px-1.5 py-1 text-[10px] text-white">
                                                {upload.analysis.technical_score.toFixed(0)}
                                            </span>
                                        ) : null}
                                        <span className="sr-only">{upload.sourceName}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedUpload && selectedUploadAnalysis ? (
                            <div className="mt-4 rounded-[18px] border border-white/8 bg-black/20 px-3.5 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-neutral-300">
                                        Score {typeof selectedUploadAnalysis.technical_score === "number" ? selectedUploadAnalysis.technical_score.toFixed(1) : "n/a"}
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-neutral-300">
                                        {formatBandLabel(selectedUploadAnalysis.band) || "Unrated"}
                                    </span>
                                </div>
                                <p className="mt-3 text-[11px] leading-5 text-neutral-300">
                                    {selectedUploadAnalysis.warnings?.[0] ??
                                        selectedUploadAnalysis.cinematic_use ??
                                        "This still is ready for the first world."}
                                </p>
                            </div>
                        ) : selectedUpload?.source_type === "generated" ? (
                            <div className="mt-4 rounded-[18px] border border-white/8 bg-black/20 px-3.5 py-3">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Generated source</p>
                                <p className="mt-2 text-[11px] leading-5 text-neutral-300">
                                    {truncateLabel(selectedUpload.prompt, 120) || "Generated still ingested into the source tray."}
                                </p>
                            </div>
                        ) : null}
                    </section>

                    <section className="order-1 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Step 2</p>
                        <h3 className="mt-2 text-base font-medium text-white">Build the first world</h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-400">{previewNote}</p>

                        <div className="mt-4 space-y-3">
                            <button
                                type="button"
                                onClick={generatePreview}
                                disabled={previewDisabled}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 font-medium text-black transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500"
                            >
                                {isGeneratingPreview || isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                                {isUploading ? "Upload in progress..." : isGeneratingPreview ? "Building first world..." : previewButtonLabel}
                            </button>
                        </div>
                    </section>

                    {showCaptureDetails ? (
                        <details className="rounded-[24px] border border-white/8 bg-black/15">
                            <summary className="cursor-pointer list-none px-4 py-3 text-[11px] font-medium text-neutral-300 marker:content-none">
                                More source details
                            </summary>
                            <div className="space-y-3 border-t border-white/8 px-4 py-4">
                                {selectedUpload ? (
                                    <button
                                        type="button"
                                        onClick={addSelectedToCaptureSet}
                                        disabled={!selectedUpload || isUploading || isUpdatingCapture || backendMode === "offline" || backendWritesDisabled}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-medium text-white transition-all hover:bg-white/[0.08] disabled:opacity-50 disabled:hover:bg-white/[0.04]"
                                    >
                                        {isUpdatingCapture || isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                                        {isUploading ? "Upload in progress..." : isUpdatingCapture ? "Adding to capture set..." : "Use this in a capture set"}
                                    </button>
                                ) : null}

                                {selectedUploadAnalysis ? (
                                    <div className="rounded-[18px] border border-white/8 bg-black/20 px-3.5 py-3">
                                        <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Frame detail</p>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
                                            <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2">
                                                Sharpness {formatScore(selectedUploadAnalysis.sharpness_score)}
                                            </div>
                                            <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2">
                                                Exposure {formatScore(selectedUploadAnalysis.exposure_score)}
                                            </div>
                                            <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2">
                                                Contrast {formatScore(selectedUploadAnalysis.contrast_score)}
                                            </div>
                                            <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2">
                                                Grade {formatBandLabel(selectedUploadAnalysis.band)}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="rounded-[18px] border border-white/8 bg-black/20 px-3.5 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Capture set</p>
                                            <p className="mt-2 text-sm text-white">
                                                {captureSession ? `${captureSession.frame_count} / ${recommendedCaptureImages} views` : "Not started"}
                                            </p>
                                        </div>
                                        <div className="text-right text-[11px] text-neutral-500">
                                            <p>{minimumCaptureImages} minimum</p>
                                            <p>{recommendedCaptureImages} target</p>
                                        </div>
                                    </div>

                                    {captureQualitySummary ? (
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
                                            <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2">
                                                Grade {formatBandLabel(captureQualitySummary.readiness) || formatBandLabel(captureQualitySummary.band) || "pending"}
                                            </div>
                                            <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2">
                                                Unique {captureUniqueFrameCount}/{captureQualitySummary.frame_count ?? 0}
                                            </div>
                                            <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2">
                                                Coverage {formatScore(captureQualitySummary.coverage_score)}
                                            </div>
                                            <div className="rounded-lg border border-neutral-800 bg-black/20 px-3 py-2">
                                                Duplicates {captureQualitySummary.duplicate_frames ?? 0}
                                                {captureDuplicateRatioPercent !== null ? ` · ${captureDuplicateRatioPercent}%` : ""}
                                            </div>
                                        </div>
                                    ) : null}

                                    {captureBlockers.length ? (
                                        <div className="mt-3 space-y-1">
                                            {captureBlockers.slice(0, 3).map((blocker) => (
                                                <p key={blocker} className="text-[11px] text-rose-200">
                                                    {blocker}
                                                </p>
                                            ))}
                                        </div>
                                    ) : null}

                                    {captureNextActions.length ? (
                                        <div className="mt-3 space-y-1">
                                            {captureNextActions.slice(0, 3).map((action) => (
                                                <p key={action} className="text-[11px] text-sky-200">
                                                    {action}
                                                </p>
                                            ))}
                                        </div>
                                    ) : null}

                                    {captureSession?.frames?.length ? (
                                        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                                            {captureSession.frames.map((frame) => (
                                                <div key={frame.image_id} className="shrink-0">
                                                    <div
                                                        className="h-16 w-16 rounded-lg border border-neutral-800 bg-neutral-950 bg-cover bg-center"
                                                        style={{ backgroundImage: `url(${toProxyUrl(frame.url)})` }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                    {!reconstructionAvailable ? (
                                        <div
                                            className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-[11px] leading-5 text-amber-100"
                                            data-testid="mvp-reconstruction-truth"
                                        >
                                            <p className="text-[10px] uppercase tracking-[0.16em] text-amber-50">Capture-only mode</p>
                                            <p className="mt-2">{reconstructionTruth}</p>
                                        </div>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={startReconstruction}
                                        disabled={
                                            !captureSession ||
                                            !captureSession.ready_for_reconstruction ||
                                            !reconstructionAvailable ||
                                            isStartingReconstruction
                                        }
                                        className={`mt-4 w-full rounded-2xl border px-4 py-3 font-medium transition-all disabled:opacity-50 ${
                                            captureSetBlocked || (reconstructionAvailable && !isStartingReconstruction)
                                                ? "border-amber-500/20 bg-amber-400/10 text-amber-100"
                                                : "border-white/10 bg-white/[0.04] text-neutral-400"
                                        }`}
                                    >
                                        {isStartingReconstruction ? "Starting reconstruction..." : reconstructionButtonLabel}
                                    </button>
                                </div>

                                {allowAssetActions ? (
                                    <div className="rounded-[18px] border border-white/8 bg-black/20 px-3.5 py-3">
                                        <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Studio action</p>
                                        <button
                                            type="button"
                                            onClick={generateAsset}
                                            disabled={
                                                !selectedUpload ||
                                                isUploading ||
                                                isGeneratingPreview ||
                                                isGeneratingAsset ||
                                                backendMode === "offline" ||
                                                backendWritesDisabled ||
                                                !assetCapability?.available
                                            }
                                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3.5 font-medium text-black transition-all hover:bg-sky-400 disabled:opacity-50 disabled:hover:bg-sky-500"
                                        >
                                            {isGeneratingAsset || isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Box className="h-5 w-5" />}
                                            {isUploading ? "Upload in progress..." : isGeneratingAsset ? "Extracting 3D asset..." : "Extract 3D asset"}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </details>
                    ) : null}
                </div>
            ) : (
                <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.7),rgba(10,14,19,0.86))] p-4 text-sm leading-6 text-neutral-400">
                    Add one still or a small capture set to begin.
                </div>
            )}
        </>
    );
}
