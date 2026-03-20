"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { ProviderCatalogResponse } from "@/lib/mvp-product";
import { StatusBadge } from "@/components/platform/StatusBadge";

const fallbackProviderOptions = [
    { id: "vertex_imagen", label: "Google Vertex Imagen" },
    { id: "runway", label: "Runway" },
    { id: "byteplus_seedream", label: "BytePlus Seedream" },
];

function buildLaunchPath({
    projectId,
    brief,
    references,
    providerId,
    intent,
    sourceKind,
    sceneId,
}: {
    projectId: string;
    brief: string;
    references: string;
    providerId: string;
    intent?: "generate" | "import" | "capture";
    sourceKind?: string;
    sceneId?: string | null;
}) {
    const searchParams = new URLSearchParams({
        project: projectId,
    });

    if (sceneId) {
        searchParams.set("scene", sceneId);
    }
    if (intent) {
        searchParams.set("intent", intent);
    }
    if (sourceKind) {
        searchParams.set("source_kind", sourceKind);
    }
    if (brief.trim()) {
        searchParams.set("brief", brief.trim());
    }
    if (references.trim()) {
        searchParams.set("refs", references.trim());
    }
    if (providerId) {
        searchParams.set("provider", providerId);
    }

    return `/mvp?${searchParams.toString()}`;
}

export function ProjectWorldLaunchPanel({
    projectId,
    canAccessMvp,
    resumeSceneId = null,
}: {
    projectId: string;
    canAccessMvp: boolean;
    resumeSceneId?: string | null;
}) {
    const [brief, setBrief] = useState("");
    const [references, setReferences] = useState("");
    const [providerCatalog, setProviderCatalog] = useState<ProviderCatalogResponse | null>(null);
    const [providerError, setProviderError] = useState<string | null>(null);
    const [selectedProviderId, setSelectedProviderId] = useState("");

    useEffect(() => {
        let cancelled = false;

        void fetch("/api/mvp/providers", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Provider catalog unavailable (${response.status})`);
                }
                return (await response.json()) as ProviderCatalogResponse;
            })
            .then((payload) => {
                if (!cancelled) {
                    setProviderCatalog(payload);
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    setProviderError(error instanceof Error ? error.message : "Provider catalog unavailable.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const providerOptions = useMemo(() => {
        const liveProviders = (providerCatalog?.providers ?? [])
            .filter((provider) => provider.media_kind === "image")
            .map((provider) => ({
                id: provider.id,
                label: provider.available ? provider.label : `${provider.label} (checked in workspace)`,
            }));
        return liveProviders.length > 0 ? liveProviders : fallbackProviderOptions;
    }, [providerCatalog]);

    useEffect(() => {
        if (!selectedProviderId && providerOptions.length > 0) {
            setSelectedProviderId(providerOptions[0].id);
        }
    }, [providerOptions, selectedProviderId]);

    const launchHref = ({
        intent,
        sourceKind,
        sceneId = null,
    }: {
        intent?: "generate" | "import" | "capture";
        sourceKind?: string;
        sceneId?: string | null;
    }) =>
        buildLaunchPath({
            projectId,
            brief,
            references,
            providerId: selectedProviderId,
            intent,
            sourceKind,
            sceneId,
        });

    const cardClassName =
        "rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] px-4 py-4 text-left transition-colors hover:border-white/18 hover:bg-white/[0.06]";

    const renderLinkCard = ({
        label,
        body,
        href,
        disabled,
        primary = false,
    }: {
        label: string;
        body: string;
        href: string;
        disabled: boolean;
        primary?: boolean;
    }) => {
        const className = primary ? `${cardClassName} border-[#bfd6de]/24 bg-[#bfd6de]/8 hover:border-[#bfd6de]/36` : cardClassName;
        const content = (
            <>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-2 text-xs leading-5 text-neutral-400">{body}</p>
            </>
        );

        if (disabled) {
            return (
                <button type="button" disabled className={`${className} cursor-not-allowed opacity-60`}>
                    {content}
                </button>
            );
        }

        return (
            <Link href={href} prefetch={false} className={className}>
                {content}
            </Link>
        );
    };

    return (
        <section id="project-world-launch" className="rounded-[30px] border border-white/8 bg-[#09141d] p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-3xl">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Project start</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Choose the first source</h2>
                    <p className="mt-3 text-sm leading-6 text-[#b2c2c9]">
                        Start with one still. Build the first world, then save once before anything else expands.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <StatusBadge label={canAccessMvp ? "Ready" : "Blocked"} tone={canAccessMvp ? "success" : "warning"} />
                    {resumeSceneId ? <StatusBadge label="Saved world exists" tone="info" /> : null}
                </div>
            </div>

            <div className="mt-6">
                {renderLinkCard({
                    label: "Import stills",
                    body: "Start from a real still or a few reference frames.",
                    href: launchHref({ intent: "import", sourceKind: "upload" }),
                    disabled: !canAccessMvp,
                    primary: true,
                })}
            </div>

            {resumeSceneId ? (
                <div className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9d978f]">Existing saved world</p>
                    <p className="mt-2 text-sm text-white">A saved world is already attached to this project.</p>
                    <div className="mt-3">
                        <Link
                            href={launchHref({ sceneId: resumeSceneId, sourceKind: "linked_scene_version" })}
                            prefetch={false}
                            className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                        >
                            Reopen saved world
                        </Link>
                    </div>
                </div>
            ) : null}

            <details className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.02]">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-white marker:content-none">
                    Project notes (optional)
                </summary>
                <div className="space-y-4 border-t border-white/8 px-4 py-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#9d978f]">World notes</p>
                        <textarea
                            value={brief}
                            onChange={(event) => setBrief(event.target.value)}
                            rows={3}
                            placeholder="Only the notes that should stay with the saved world."
                            className="mt-3 w-full rounded-2xl border border-[var(--border-soft)] bg-[rgba(244,239,232,0.03)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[#80796f] focus:border-[#bfd6de]/40"
                        />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#9d978f]">Look and continuity</p>
                        <textarea
                            value={references}
                            onChange={(event) => setReferences(event.target.value)}
                            rows={3}
                            placeholder="Optional look, cast, or shot continuity."
                            className="mt-3 w-full rounded-2xl border border-[var(--border-soft)] bg-[rgba(244,239,232,0.03)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[#80796f] focus:border-[#bfd6de]/40"
                        />
                    </div>
                </div>
            </details>

            <details className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.02]">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-white marker:content-none">
                    More ways to start
                </summary>
                <div className="space-y-4 border-t border-white/8 px-4 py-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        {renderLinkCard({
                            label: "Start a capture set",
                            body: "Use overlapping views when you want a fuller world later.",
                            href: launchHref({ intent: "capture", sourceKind: "capture_session" }),
                            disabled: !canAccessMvp,
                        })}
                        {renderLinkCard({
                            label: "Attach external world",
                            body: "Use this only when the world already exists outside Gauset.",
                            href: launchHref({ intent: "import", sourceKind: "external_world_package" }),
                            disabled: !canAccessMvp,
                        })}
                        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
                            <p className="text-sm font-semibold text-white">Generate a source still</p>
                            <p className="mt-2 text-xs leading-5 text-neutral-400">
                                Keep prompt generation secondary. It only supplies a starting still.
                            </p>
                            <div className="mt-3 flex flex-col gap-3">
                                <select
                                    value={selectedProviderId}
                                    onChange={(event) => setSelectedProviderId(event.target.value)}
                                    className="w-full rounded-2xl border border-[var(--border-soft)] bg-[rgba(244,239,232,0.03)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[#bfd6de]/40"
                                >
                                    {providerOptions.map((provider) => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.label}
                                        </option>
                                    ))}
                                </select>
                                {canAccessMvp ? (
                                    <Link
                                        href={launchHref({ intent: "generate", sourceKind: "provider_generated_still" })}
                                        prefetch={false}
                                        className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                                    >
                                        Open generation lane
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white opacity-60"
                                    >
                                        Open generation lane
                                    </button>
                                )}
                                {providerError ? <p className="text-[11px] leading-5 text-amber-200">{providerError}</p> : null}
                            </div>
                        </div>
                    </div>
                </div>
            </details>
        </section>
    );
}
