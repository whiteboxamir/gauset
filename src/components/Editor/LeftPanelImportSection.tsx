"use client";

import { ArrowRight, Loader2, Upload } from "lucide-react";

import type { MvpWorkspaceIntakeController } from "@/app/mvp/_hooks/useMvpWorkspaceIntakeController";
import { formatUploadBytes } from "@/lib/mvp-upload";

type LeftPanelImportSectionProps = Pick<
    MvpWorkspaceIntakeController,
    | "backendMode"
    | "backendWritesDisabled"
    | "backendWritesDisabledMessage"
    | "isUploading"
    | "uploadQueue"
    | "uploadQueueSummary"
    | "directUploadAvailable"
    | "directUploadTransport"
    | "directUploadMaximumSizeInBytes"
    | "legacyProxyMaximumSizeInBytes"
    | "reconstructionAvailable"
    | "triggerFilePicker"
> & {
    hasIntakeSource?: boolean;
};

function phaseLabel(phase: LeftPanelImportSectionProps["uploadQueue"][number]["phase"]) {
    switch (phase) {
        case "queued":
            return "Queued";
        case "uploading":
            return "Uploading";
        case "registering":
            return "Registering";
        case "complete":
            return "Ready";
        case "error":
            return "Needs attention";
        default:
            return "Queued";
    }
}

export function LeftPanelImportSection({
    backendMode,
    backendWritesDisabled,
    backendWritesDisabledMessage,
    isUploading,
    uploadQueue,
    uploadQueueSummary,
    directUploadAvailable,
    directUploadTransport,
    directUploadMaximumSizeInBytes,
    legacyProxyMaximumSizeInBytes,
    hasIntakeSource = false,
    reconstructionAvailable,
    triggerFilePicker,
}: LeftPanelImportSectionProps) {
    const uploadsBlocked = backendMode === "offline" || backendWritesDisabled;
    const uploadButtonLabel =
        backendMode === "offline" ? "Reconnect backend first" : backendWritesDisabled ? "Uploads disabled" : hasIntakeSource ? "Add more stills" : "Add stills";
    const title =
        backendMode === "offline"
            ? "Reconnect backend"
            : backendWritesDisabled
              ? "Uploads are disabled"
              : isUploading
                ? "Adding source stills"
                : hasIntakeSource
                  ? "Source ready"
                  : "Add a source";
    const description =
        backendMode === "offline"
            ? "The backend has to be running before you can upload or build."
            : backendWritesDisabled
              ? backendWritesDisabledMessage
              : hasIntakeSource
                ? "Build the first world next. Add more only if you need them."
              : reconstructionAvailable
                ? "Start with one still or a small capture set."
                : "Start with one still. Capture can wait.";
    const sizeLabel =
        directUploadAvailable === false
            ? `Large direct upload is unavailable here. Keep stills under ${formatUploadBytes(legacyProxyMaximumSizeInBytes)}.`
            : directUploadTransport === "backend"
              ? `Direct upload is available up to ${formatUploadBytes(directUploadMaximumSizeInBytes)}.`
              : `Direct upload is available up to ${formatUploadBytes(directUploadMaximumSizeInBytes)}.`;

    return (
        <section
            className={`rounded-[24px] border p-4 shadow-[0_16px_36px_rgba(0,0,0,0.2)] ${
                uploadsBlocked
                    ? "border-white/10 bg-black/25 opacity-80"
                    : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))]"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">{hasIntakeSource ? "Source" : "Step 1"}</p>
                    <h3 className="mt-2 text-lg font-medium tracking-tight text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
                </div>
                {isUploading ? (
                    <Loader2 className="mt-1 h-7 w-7 shrink-0 animate-spin text-sky-300" />
                ) : (
                    <Upload className="mt-1 h-7 w-7 shrink-0 text-neutral-500" />
                )}
            </div>

            {!hasIntakeSource ? (
                <p className="mt-3 text-[11px] leading-5 text-neutral-500">
                    JPG, PNG, or WEBP. One clear still is enough.
                </p>
            ) : null}

            {directUploadAvailable === false && !uploadsBlocked && !hasIntakeSource ? (
                <p className="mt-2 text-[11px] leading-5 text-amber-200" data-testid="mvp-upload-cap-warning">
                    {sizeLabel}
                </p>
            ) : !uploadsBlocked && !hasIntakeSource ? (
                <p className="mt-2 text-[11px] leading-5 text-neutral-500">{sizeLabel}</p>
            ) : null}

            {isUploading ? (
                <div className="mt-4 space-y-2.5 rounded-[18px] border border-sky-400/20 bg-sky-500/8 px-3 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-sky-100/80">Uploading</p>
                        <p className="text-[11px] text-sky-100">
                            {uploadQueueSummary.completedCount > 0
                                ? `${uploadQueueSummary.completedCount} of ${uploadQueueSummary.totalCount} ready`
                                : "Routing source stills"}
                        </p>
                    </div>
                    {uploadQueue.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-[0.95rem] border border-white/8 bg-black/20 px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-[11px] font-medium text-white">{item.fileName}</p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-sky-100/75">
                                        {phaseLabel(item.phase)}
                                        {item.errorMessage ? ` · ${item.errorMessage}` : ""}
                                    </p>
                                </div>
                                <p className="shrink-0 text-[10px] text-sky-100/75">
                                    {item.progressPercent > 0 ? `${Math.round(item.progressPercent)}%` : formatUploadBytes(item.sizeBytes)}
                                </p>
                            </div>
                            <div className="mt-2 overflow-hidden rounded-full bg-white/[0.08]">
                                <div
                                    className={`h-1.5 rounded-full transition-[width] duration-200 ${
                                        item.phase === "error" ? "bg-rose-300/80" : item.phase === "complete" ? "bg-emerald-300/80" : "bg-sky-300/80"
                                    }`}
                                    style={{ width: `${Math.max(item.progressPercent, item.phase === "complete" ? 100 : 6)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => {
                        if (!uploadsBlocked) {
                            triggerFilePicker();
                        }
                    }}
                    disabled={uploadsBlocked}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-100 transition-colors hover:border-white/18 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                    data-testid="mvp-upload-open-picker"
                >
                    {uploadButtonLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </section>
    );
}
