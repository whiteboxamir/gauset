import Link from 'next/link';
import { redirect } from 'next/navigation';

import { buildAppLoginUrl, hasConfiguredExternalAppHost } from '@/lib/appAuth';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string; email?: string }>;
}) {
    const params = await searchParams;
    const nextPath = params.next ?? '/app/worlds';

    if (hasConfiguredExternalAppHost()) {
        redirect(buildAppLoginUrl({
            next: nextPath,
            email: params.email ?? null,
        }));
    }

    return (
        <main className="min-h-screen bg-[#07111a] px-6 py-10 text-[#ecf3f6]">
            <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
                <section className="w-full rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#8eb2bf]">Auth handoff</p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">Sign-in is not configured in this shell.</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b4c6cd] sm:text-base">
                        This production repo can still show the world-record workflow and saved-world handoff posture, but the dedicated auth host is not configured in the current environment. You can keep reviewing the same-site world flow without landing in a dead external page.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                        <Link
                            href="/app/worlds"
                            className="inline-flex items-center rounded-full border border-white/15 bg-white px-4 py-2 font-medium text-black transition hover:bg-[#d7e5ea]"
                        >
                            Open world record library
                        </Link>
                        <Link
                            href={nextPath}
                            className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
                        >
                            Continue to requested route
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
