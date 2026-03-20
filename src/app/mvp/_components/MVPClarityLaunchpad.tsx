"use client";

import Link from "next/link";
import React from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, History, Loader2 } from "lucide-react";

interface MVPClarityLaunchpadProps {
    draftUpdatedAt?: string | null;
    draftSceneId?: string | null;
    hasDraft: boolean;
    launchProjectId?: string | null;
    launchSceneId?: string | null;
    launchSourceKind?: string | null;
    startWorkspaceHref?: string | null;
    linkedLaunchMessage?: string;
    linkedLaunchStatus?: "idle" | "opening" | "opened" | "unavailable";
    onOpenDemoWorld: () => void;
    onStartWorkspace: () => void;
    onResumeDraft: () => void;
}

const formatTimestamp = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], {
        hour: "numeric",
        minute: "2-digit",
        month: "short",
        day: "numeric",
    });
};

const formatSourceLabel = (sourceKind?: string | null) => {
    switch (sourceKind) {
        case "capture_session":
            return "Capture set";
        case "external_world_package":
            return "External world";
        case "third_party_world_model_output":
            return "Third-party world";
        case "provider_generated_still":
            return "Generated still";
        case "linked_scene_version":
            return "Linked world";
        case "demo_world":
            return "Sample shell";
        case "upload":
            return "Scout stills";
        default:
            return "Source";
    }
};

export default function MVPClarityLaunchpad({
    draftUpdatedAt,
    draftSceneId,
    hasDraft,
    launchProjectId,
    launchSceneId,
    launchSourceKind,
    startWorkspaceHref = null,
    linkedLaunchMessage,
    linkedLaunchStatus = "idle",
    onOpenDemoWorld,
    onStartWorkspace,
    onResumeDraft,
}: MVPClarityLaunchpadProps) {
    const launchLocked = linkedLaunchStatus === "opening";
    const hasProjectLaunchContext = Boolean(launchProjectId);
    const hasAttachedSource = Boolean(launchSourceKind);
    const sourceLabel = formatSourceLabel(launchSourceKind);
    const canResumeDraft = hasDraft && !hasProjectLaunchContext && !hasAttachedSource;
    const primaryActionLabel = hasAttachedSource ? "Start first world" : "Choose source";
    const summaryLabel = hasAttachedSource ? `${sourceLabel} attached` : hasProjectLaunchContext ? "Project attached" : "Start clean";
    const startMessage = hasAttachedSource
        ? `${sourceLabel} is ready. Start the first world, then save once.`
        : hasProjectLaunchContext
          ? "Choose the first source for this project, then build the first world."
          : "Add one still or a small capture set. Keep the first move narrow.";
    const projectLibraryHref = "/app/worlds";

    return (
        <div className="relative flex min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#101418] text-white supports-[min-height:100dvh]:min-h-dvh">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(191,214,222,0.14),transparent_26%),linear-gradient(180deg,#151b22_0%,#101418_100%)]" />

            <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col justify-center px-6 py-8 sm:px-8 lg:min-h-dvh lg:py-12">
                <section className="rounded-[36px] border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(22,28,34,0.94),rgba(16,20,24,0.92))] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-9">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#bfd6de]/24 bg-[#bfd6de]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#deedf1]">
                            Project-first entry
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-neutral-300">
                            {summaryLabel}
                        </span>
                    </div>

                    <h1 className="mt-6 text-[2.7rem] font-medium leading-[0.94] tracking-[-0.06em] text-white sm:text-[3.6rem]">
                        Build one world.
                        <br />
                        Save it once. Then direct it.
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-7 text-[#d3ccc2]">{startMessage}</p>

                    {launchSceneId ? (
                        <div
                            className={`mt-6 rounded-[24px] border px-4 py-4 ${
                                linkedLaunchStatus === "unavailable"
                                    ? "border-[#d9bfc7]/35 bg-[#d9bfc7]/10"
                                    : "border-[#bfd6de]/25 bg-[#bfd6de]/10"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                                    {linkedLaunchStatus === "opening" ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-cyan-100" />
                                    ) : linkedLaunchStatus === "unavailable" ? (
                                        <AlertTriangle className="h-4 w-4 text-rose-100" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 text-cyan-100" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#ddd5cb]">Linked world</p>
                                    <p className="mt-2 text-sm font-medium text-white">
                                        {linkedLaunchStatus === "opening"
                                            ? `Opening ${launchSceneId}`
                                            : linkedLaunchStatus === "unavailable"
                                              ? `Could not reopen ${launchSceneId}`
                                              : `Ready to reopen ${launchSceneId}`}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[#d3ccc2]">
                                        {linkedLaunchMessage || "The saved route stays attached when project history already exists."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-7 rounded-[28px] border border-[var(--border-soft)] bg-[rgba(244,239,232,0.03)] p-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-4">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#9d978f]">1. Source</p>
                                <p className="mt-2 text-sm text-white">Choose or attach one source.</p>
                            </div>
                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-4">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#9d978f]">2. Build</p>
                                <p className="mt-2 text-sm text-white">Start the first world.</p>
                            </div>
                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-4">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#9d978f]">3. Save</p>
                                <p className="mt-2 text-sm text-white">Anchor it once before anything else opens.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        {startWorkspaceHref && !launchLocked ? (
                            <Link
                                href={startWorkspaceHref}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f4efe8] px-6 py-3.5 text-sm font-medium text-[#101418] transition-colors hover:bg-[#ebe3d8]"
                            >
                                {primaryActionLabel}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={onStartWorkspace}
                                disabled={launchLocked}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f4efe8] px-6 py-3.5 text-sm font-medium text-[#101418] transition-colors hover:bg-[#ebe3d8] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {primaryActionLabel}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#a7abae]">
                        {!hasProjectLaunchContext && !hasAttachedSource ? (
                            <Link href={projectLibraryHref} className="transition-colors hover:text-white">
                                Open project library
                            </Link>
                        ) : null}
                        {!hasProjectLaunchContext && !hasAttachedSource ? (
                            <button type="button" onClick={onOpenDemoWorld} disabled={launchLocked} className="text-left transition-colors hover:text-white disabled:opacity-60">
                                Inspect sample shell
                            </button>
                        ) : null}
                        {canResumeDraft ? (
                            <button type="button" onClick={onResumeDraft} disabled={launchLocked} className="text-left transition-colors hover:text-white disabled:opacity-60">
                                <span className="inline-flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    Resume draft
                                    {draftSceneId ? ` ${draftSceneId}` : draftUpdatedAt ? ` ${formatTimestamp(draftUpdatedAt)}` : ""}
                                </span>
                            </button>
                        ) : null}
                    </div>
                </section>
            </div>
        </div>
    );
}
