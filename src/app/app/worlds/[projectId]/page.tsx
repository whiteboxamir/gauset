import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentAuthSession } from "@/server/auth/session";
import { isPlatformDatabaseConfigured } from "@/server/db/client";
import { getLocalPreviewProjectReadinessDetailForId } from "@/server/projects/local-preview";
import { getProjectReadinessDetailForSession } from "@/server/projects/readiness";
import { ProjectWorldLaunchPanel } from "@/components/worlds/ProjectWorldLaunchPanel";

function readinessTone(state: "ready" | "at_risk" | "blocked") {
    if (state === "ready") return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
    if (state === "blocked") return "border-rose-400/30 bg-rose-500/10 text-rose-100";
    return "border-amber-400/30 bg-amber-500/10 text-amber-100";
}

function worldWorkspaceHref(projectId: string, primarySceneId: string | null) {
    if (primarySceneId) {
        return `/mvp?scene=${encodeURIComponent(primarySceneId)}&project=${encodeURIComponent(projectId)}`;
    }

    return `/mvp?project=${encodeURIComponent(projectId)}&entry=workspace`;
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
    const canAccessMvp = useLocalPreview ? true : Boolean(session?.entitlements.canAccessMvp);

    return (
        <main className="min-h-screen bg-[#07111a] text-[#ecf3f6]">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-8">
                <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/app/worlds" className="text-sm text-[#9db7c0] transition hover:text-white">
                            Project worlds
                        </Link>
                        <span className="text-[#5e7680]">/</span>
                        <span className="text-sm text-white">{detail.project.name}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-3xl">
                            <p className="text-[11px] uppercase tracking-[0.26em] text-[#89aeb9]">Project</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">{detail.project.name}</h1>
                            <p className="mt-3 text-sm leading-6 text-[#b2c2c9]">
                                {detail.project.description ?? "Choose the first source, start the first world, and save once."}
                            </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${readinessTone(releaseReadiness.state)}`}>
                            {releaseReadiness.state.replace("_", " ")}
                        </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <a
                            href="#project-world-launch"
                            className="inline-flex items-center rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-[#d7e5ea]"
                        >
                            Choose first source
                        </a>
                        {detail.project.primarySceneId ? (
                            <Link
                                href={worldWorkspaceHref(detail.project.projectId, detail.project.primarySceneId)}
                                className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                            >
                                Reopen saved world
                            </Link>
                        ) : null}
                    </div>
                </section>

                <ProjectWorldLaunchPanel
                    projectId={detail.project.projectId}
                    canAccessMvp={canAccessMvp}
                    resumeSceneId={detail.project.primarySceneId}
                />

                <section id="project-record" className="rounded-[30px] border border-white/8 bg-[#09141d] p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Saved worlds</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                                {detail.worldLinks.length > 0 ? `${detail.worldLinks.length} attached` : "None yet"}
                            </h2>
                        </div>
                        <p className="text-sm text-[#9db0b8]">
                            {primaryWorld?.environmentLabel ?? detail.project.primaryEnvironmentLabel ?? "Waiting for first save"}
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3">
                        {detail.worldLinks.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.02] p-5 text-sm text-[#b2c2c9]">
                                No saved world is attached yet. Start with one source above and save once.
                            </div>
                        ) : (
                            detail.worldLinks.map((link) => (
                                <div key={link.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7898a4]">{link.isPrimary ? "Primary world" : "Attached world"}</p>
                                            <h3 className="mt-2 text-lg font-semibold text-white">{link.environmentLabel ?? link.sceneId}</h3>
                                            <p className="mt-2 text-sm text-[#b2c2c9]">
                                                Scene {link.sceneId}
                                                {link.truthSummary?.latestVersionId ? ` · Version ${link.truthSummary.latestVersionId}` : ""}
                                                {link.truthSummary?.productionReadiness ? ` · ${link.truthSummary.productionReadiness}` : ""}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/mvp?scene=${encodeURIComponent(link.sceneId)}&project=${encodeURIComponent(detail.project.projectId)}`}
                                            className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                                        >
                                            Open saved world
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <details className="rounded-[30px] border border-white/8 bg-[#09141d]">
                    <summary className="cursor-pointer list-none px-6 py-4 text-sm font-medium text-white marker:content-none sm:px-8">
                        Project status
                    </summary>
                    <div className="space-y-4 border-t border-white/8 px-6 py-6 sm:px-8">
                        <div className="grid gap-3">
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

                        <div className="grid gap-3">
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
                    </div>
                </details>
            </div>
        </main>
    );
}
