import Link from 'next/link';

import { HeroBackground } from '@/components/experience/HeroBackground';
import { LoginForm } from '@/components/ui/LoginForm';
import { sanitizeNextPath } from '@/server/auth/redirects';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string; email?: string }>;
}) {
    const params = await searchParams;
    const redirectPath = sanitizeNextPath(params.next, '/mvp');

    return (
        <main className="relative h-screen overflow-y-auto bg-[#050510] text-white">
            <HeroBackground />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_42%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.08),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(5,5,16,0.92)_0%,rgba(5,5,16,0.74)_42%,rgba(5,5,16,0.88)_100%)]" />

            <header className="marketing-header">
                <div className="marketing-header__inner">
                    <div className="marketing-header__row">
                        <div className="marketing-header__group">
                            <Link
                                href="/"
                                className="pointer-events-auto inline-flex items-center text-sm font-bold uppercase tracking-[0.15em] text-white/90 transition-opacity hover:opacity-80"
                            >
                                Gauset
                            </Link>
                        </div>
                        <div className="marketing-header__actions">
                            <Link
                                href="/"
                                className="pointer-events-auto inline-flex min-h-10 items-center rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-black/50 hover:text-white sm:px-5"
                            >
                                Back home
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <section className="relative z-10 flex min-h-screen items-center px-6 py-24 sm:px-8 lg:px-12">
                <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
                    <div className="max-w-2xl space-y-7">
                        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-cyan-200/70">
                            Design Partner Access
                        </p>
                        <div className="space-y-5">
                            <h1 className="max-w-3xl text-5xl font-medium tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                                Step back into the world you&apos;re building.
                            </h1>
                            <p className="max-w-xl text-base leading-relaxed text-white/68 sm:text-lg">
                                Early access is not open yet. Enter your studio email to check status, and if your
                                team has not been invited yet we&apos;ll follow up when onboarding begins.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-3xl border border-white/10 bg-black/35 px-5 py-5 backdrop-blur-xl">
                                <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">Status</p>
                                <p className="mt-3 text-sm font-medium text-white/90">Closed beta onboarding</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-black/35 px-5 py-5 backdrop-blur-xl">
                                <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">Invites</p>
                                <p className="mt-3 text-sm font-medium text-white/90">Rolling approvals only</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-black/35 px-5 py-5 backdrop-blur-xl">
                                <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">Support</p>
                                <a
                                    href="mailto:amir@gnosika.com"
                                    className="mt-3 inline-flex text-sm font-medium text-cyan-100/90 transition-colors hover:text-white"
                                >
                                    amir@gnosika.com
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 text-sm text-white/58 sm:flex-row sm:items-center sm:gap-6">
                            <Link href="/" className="inline-flex items-center transition-colors hover:text-white">
                                Request access instead
                            </Link>
                            <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
                            <p>Build worlds. Not clips.</p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,rgba(165,243,252,0.18),transparent_55%)] blur-3xl" />
                        <div className="relative">
                            <LoginForm
                                defaultEmail={params.email ?? ''}
                                redirectPath={redirectPath}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
