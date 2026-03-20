import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentAuthSession } from "@/server/auth/session";
import { isPlatformDatabaseConfigured } from "@/server/db/client";
import { getLocalPreviewProjectReadinessDetailForId } from "@/server/projects/local-preview";
import { getProjectReadinessDetailForSession } from "@/server/projects/readiness";

function readinessTone(state: "ready" | "at_risk" | "blocked") {
    if (state === "ready") return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
    if (state === "blocked") return "border-rose-400/30 bg-rose-500/10 text-rose-100";
    return "border-amber-400/30 bg-amber-500/10 text-amber-100";
}

function worldWorkspaceHref(projectId: string, primarySceneId: string | null) {
    if (primarySceneId) {
        return `/mvp?scene=${encodeURIComponent(primarySceneId)}&project=${encodeURIComponent(projectId)}`;
    }

    return `/mvp/preview?project=${encodeURIComponent(projectId)}&entry=workspace`;
}

export default async function ProjectWorldRecordPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;
    const session = await getCurrentAuthSession();
    const useLocalPreview = !session || !isPlatformDatabaseConfigured();

    const detail = useLocalPreview
        ? getLocalPreviewProjectReadinessDetailForId(projectId)
        : await getProjectReadinessDetailForSession(session, projectId);

    if (!detail) {
        notFound();
    }

    const releaseReadiness = detail.releaseReadiness;
    const primaryWorld = detail.worldLinks.find((entry) => entry.isPrimary) ?? detail.worldLinks[0] ?? null;

    return (
        <main className="min-h-screen bg-[#07111a] text-[#ecf3f6]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
                <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/app/worlds" className="text-sm text-[#9db7c0] transition hover:text-white">
                            World Record Library
                        </Link>
                        <span className="text-[#5e7680]">/</span>
                        <span className="text-sm text-white">{detail.project.name}</span>
                    </div>
                    <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-[11px] uppercase tracking-[0.26em] text-[#89aeb9]">Project record</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">{detail.project.name}</h1>
                            <p className="mt-3 text-sm leading-6 text-[#b2c2c9]">
                                {detail.project.description ?? "Persistent world record for continuity, saved-world review, and shot-direction handoff."}
                            </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${readinessTone(releaseReadiness.state)}`}>
                            {releaseReadiness.state.replace("_", " ")}
                        </span>
                    </div>
                    <div id="project-world-launch" className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href={worldWorkspaceHref(detail.project.projectId, detail.project.primarySceneId)}
                            className="inline-flex items-center rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-[#d7e5ea]"
                        >
                            {detail.project.primarySceneId ? "Reopen saved world" : "Open world workspace"}
                        </Link>
                        <Link
                            href={`/mvp/preview?project=${encodeURIComponent(detail.project.projectId)}`}
                            className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                        >
                            Review pre-save flow
                        </Link>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <article id="project-record" className="rounded-[30px] border border-white/8 bg-[#09141d] p-6 sm:p-8">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Saved-world record</p>
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7898a4]">Primary world</p>
                                <p className="mt-2 text-lg font-semibold text-white">{primaryWorld?.environmentLabel ?? detail.project.primaryEnvironmentLabel ?? "Pending first save"}</p>
                            </div>
                            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7898a4]">World links</p>
                                <p className="mt-2 text-lg font-semibold text-white">{detail.worldLinks.length}</p>
                            </div>
                            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7898a4]">Last activity</p>
                                <p className="mt-2 text-lg font-semibold text-white">
                                    {detail.project.lastActivityAt ? new Date(detail.project.lastActivityAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No activity yet"}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-4">
                            {detail.worldLinks.length === 0 ? (
                                <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.02] p-5 text-sm text-[#b2c2c9]">
                                    No saved world is attached yet. Open the world workspace from this project record, save the first world, then come back here for review and handoff.
                                </div>
                            ) : (
                                detail.worldLinks.map((link) => (
                                    <div key={link.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7898a4]">{link.isPrimary ? "Primary world" : "Attached world"}</p>
                                                <h2 className="mt-2 text-lg font-semibold text-white">{link.environmentLabel ?? link.sceneId}</h2>
                                            </div>
                                            <Link
                                                href={`/mvp?scene=${encodeURIComponent(link.sceneId)}&project=${encodeURIComponent(detail.project.projectId)}`}
                                                className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                                            >
                                                Open saved world
                                            </Link>
                                        </div>
                                        <p className="mt-3 text-sm text-[#b2c2c9]">
                                            Scene {link.sceneId}
                                            {link.truthSummary?.latestVersionId ? ` • Version ${link.truthSummary.latestVersionId}` : ""}
                                            {link.truthSummary?.productionReadiness ? ` • ${link.truthSummary.productionReadiness}` : ""}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </article>

                    <aside className="grid gap-4">
                        <article className="rounded-[30px] border border-white/8 bg-[#09141d] p-6">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Release truth</p>
                            <p className="mt-3 text-sm leading-6 text-[#b2c2c9]">{releaseReadiness.summary}</p>
                            <div className="mt-4 grid gap-3">
                                {releaseReadiness.capabilities.map((capability) => (
                                    <div key={capability.capability} className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-medium capitalize text-white">{capability.capability}</p>
                                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${readinessTone(capability.state)}`}>
                                                {capability.state.replace("_", " ")}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-[#b2c2c9]">{capability.summary}</p>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-[30px] border border-white/8 bg-[#09141d] p-6">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Project activity</p>
                            <div className="mt-4 grid gap-3">
                                {detail.activity.length === 0 ? (
                                    <p className="rounded-[20px] border border-dashed border-white/12 bg-white/[0.02] p-4 text-sm text-[#b2c2c9]">
                                        No recorded project activity yet in this shell.
                                    </p>
                                ) : (
                                    detail.activity.map((entry) => (
                                        <div key={entry.id} className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                                            <p className="text-sm font-medium text-white">{entry.summary}</p>
                                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#7e9ca8]">
                                                {entry.eventType} • {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </article>
                    </aside>
                </section>
            </div>
        </main>
    );
}
