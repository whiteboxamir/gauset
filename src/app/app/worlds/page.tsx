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
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-8">
                <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-2xl">
                            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8eb2bf]">Project worlds</p>
                            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                                Build one world. Save it once. Then direct it.
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-[#b4c6cd] sm:text-base">
                                Pick a project, choose the first source, and keep the opening step calm.
                            </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${readinessTone(releaseReadiness.state)}`}>
                            {releaseReadiness.state.replace("_", " ")}
                        </span>
                    </div>
                </section>

                <section id="project-records" className="space-y-3">
                    {projects.map((project) => (
                        <article key={project.projectId} className="rounded-[28px] border border-white/8 bg-[#09141d] p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 max-w-2xl">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#86a8b4]">{project.studioName ?? "Project"}</p>
                                    <h2 className="mt-2 text-xl font-semibold text-white">{project.name}</h2>
                                    <p className="mt-3 text-sm leading-6 text-[#b2c2c9]">
                                        {project.description ?? "Choose the first source here, then save the first world once."}
                                    </p>
                                    <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#7898a4]">
                                        {project.primaryEnvironmentLabel ?? "No saved world yet"}
                                        {" · "}
                                        {project.lastActivityAt
                                            ? `Last active ${new Date(project.lastActivityAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                            : "No activity yet"}
                                    </p>
                                </div>
                                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${readinessTone(project.releaseReadiness.state)}`}>
                                    {project.releaseReadiness.state.replace("_", " ")}
                                </span>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link
                                    href={`/app/worlds/${project.projectId}`}
                                    className="inline-flex items-center rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-[#d7e5ea]"
                                >
                                    Open project
                                </Link>
                                {project.primarySceneId ? (
                                    <Link
                                        href={`/mvp?scene=${encodeURIComponent(project.primarySceneId)}&project=${encodeURIComponent(project.projectId)}`}
                                        className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                                    >
                                        Resume saved world
                                    </Link>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}
