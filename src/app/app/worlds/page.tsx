import Link from "next/link";

import { getCurrentAuthSession } from "@/server/auth/session";
import { isPlatformDatabaseConfigured } from "@/server/db/client";
import { getLocalPreviewWorkspaceReadiness, listLocalPreviewProjectReadinessCardsForSession } from "@/server/projects/local-preview";
import { getWorkspaceReleaseReadinessForSession, listProjectReadinessCardsForSession } from "@/server/projects/readiness";

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

export default async function WorldsPage() {
    const session = await getCurrentAuthSession();
    const useLocalPreview = !session || !isPlatformDatabaseConfigured();
    const [releaseReadiness, projects] = useLocalPreview
        ? [getLocalPreviewWorkspaceReadiness(), listLocalPreviewProjectReadinessCardsForSession()]
        : await Promise.all([
              getWorkspaceReleaseReadinessForSession(session),
              listProjectReadinessCardsForSession(session),
          ]);

    return (
        <main className="min-h-screen bg-[#07111a] text-[#ecf3f6]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
                <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#8eb2bf]">World Record Library</p>
                    <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                                Build one world. Save it once. Then direct it.
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b4c6cd] sm:text-base">
                                Gauset keeps world truth, continuity, and shot direction attached to one persistent record. Start from the record, reopen the saved world, and keep review handoff anchored to the same source of truth.
                            </p>
                        </div>
                        <div className={`inline-flex items-center rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${readinessTone(releaseReadiness.state)}`}>
                            {releaseReadiness.state.replace("_", " ")}
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                        <Link
                            href="/mvp/preview"
                            className="inline-flex items-center rounded-full border border-white/15 bg-white px-4 py-2 font-medium text-black transition hover:bg-[#d7e5ea]"
                        >
                            Open unsaved workspace
                        </Link>
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[#b4c6cd]">
                            {useLocalPreview ? "Local preview truth is active" : "Authenticated project records are active"}
                        </span>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-[28px] border border-white/8 bg-[#0b1822] p-6">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Workflow</p>
                        <p className="mt-3 text-lg font-semibold text-white">World bible and continuity stay with the saved world.</p>
                    </article>
                    <article className="rounded-[28px] border border-white/8 bg-[#0b1822] p-6">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Direction</p>
                        <p className="mt-3 text-lg font-semibold text-white">Shot lists and sequence plans reopen from the same record.</p>
                    </article>
                    <article className="rounded-[28px] border border-white/8 bg-[#0b1822] p-6">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Trust</p>
                        <p className="mt-3 text-lg font-semibold text-white">Progress, review, and handoff stay tied to one durable world.</p>
                    </article>
                </section>

                <section className="rounded-[32px] border border-white/8 bg-[#09141d] p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7fa3b0]">Projects</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Persistent world records</h2>
                        </div>
                        <p className="text-sm text-[#9db0b8]">{projects.length} active project records</p>
                    </div>
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {projects.map((project) => (
                            <article key={project.projectId} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#86a8b4]">{project.studioName ?? "Project record"}</p>
                                        <h3 className="mt-2 text-xl font-semibold text-white">{project.name}</h3>
                                    </div>
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${readinessTone(project.releaseReadiness.state)}`}>
                                        {project.releaseReadiness.state.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-[#b2c2c9]">
                                    {project.description ?? "Project record for one durable world and its continuity handoff."}
                                </p>
                                <div className="mt-5 grid gap-3 text-sm text-[#c4d2d8] sm:grid-cols-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7597a3]">World links</p>
                                        <p className="mt-1 text-base text-white">{project.worldCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7597a3]">Primary world</p>
                                        <p className="mt-1 text-base text-white">{project.primaryEnvironmentLabel ?? "Not saved yet"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7597a3]">Last activity</p>
                                        <p className="mt-1 text-base text-white">{project.lastActivityAt ? new Date(project.lastActivityAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No activity yet"}</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href={`/app/worlds/${project.projectId}`}
                                        className="inline-flex items-center rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-[#d7e5ea]"
                                    >
                                        Open project record
                                    </Link>
                                    <Link
                                        href={worldWorkspaceHref(project.projectId, project.primarySceneId)}
                                        className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                                    >
                                        {project.primarySceneId ? "Reopen saved world" : "Enter workspace"}
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
