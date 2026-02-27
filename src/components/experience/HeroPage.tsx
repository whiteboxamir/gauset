'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Preload } from '@react-three/drei';
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicScene } from './HeroScene';
import { WaitlistForm } from '@/components/ui/WaitlistForm';

/*
  SIX-PHASE CONVERSION FUNNEL — HTML Overlay
  
  Phase 1 (0%–12%):   HOOK — "Build worlds. Not clips." + CTA
  Phase 2 (15%–28%):  PROBLEM — AI video is broken
  Phase 3 (30%–42%):  INSIGHT — Production needs persistence
  Phase 4 (45%–60%):  SOLUTION — Gauset is the layer + CTA
  Phase 5 (65%–80%):  PROOF — One world, infinite shots
  Phase 6 (85%–100%): CTA — Join early access + CTA
*/

export function HeroPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
            <Canvas
                camera={{ fov: 50, near: 0.1, far: 200 }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                }}
                dpr={[1, 1.5]}
                style={{ background: '#000000' }}
            >
                <color attach="background" args={['#000000']} />

                <Suspense fallback={null}>
                    <ScrollControls pages={8} damping={0.12}>
                        <CinematicScene />

                        <Scroll html style={{ width: '100%' }}>
                            <div className="w-screen pointer-events-none">

                                {/* ═══ PHASE 1: HOOK — Immediate clarity + intrigue ═══ */}
                                <div className="h-screen flex flex-col items-center justify-center px-6 text-center relative">
                                    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 md:px-10 py-5 pointer-events-auto z-50">
                                        <div className="text-white/90 font-bold tracking-[0.15em] text-xs uppercase">Gauset</div>
                                        <a
                                            href="#waitlist"
                                            className="text-white/50 text-xs tracking-wider border border-white/[0.08] rounded-full px-5 py-2.5 hover:text-white/80 hover:border-white/[0.15] transition-all duration-500"
                                        >
                                            Get Early Access
                                        </a>
                                    </nav>

                                    <AnimatePresence>
                                        {mounted && (
                                            <div className="flex flex-col items-center text-center max-w-5xl">
                                                <h1 className="mb-6 pb-2 leading-[0.92] tracking-[-0.04em]">
                                                    <HeroWord word="Build" delay={0} />
                                                    <HeroWord word="worlds." delay={0.4} />
                                                    <br className="hidden sm:block" />
                                                    <HeroWord word="Not" delay={0.9} />
                                                    <HeroWord word="clips." delay={1.3} isLast />
                                                </h1>

                                                <motion.p
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 1.4, delay: 2.4, ease: [0.25, 0.1, 0.25, 1] }}
                                                    className="max-w-xl md:max-w-2xl text-xl md:text-2xl lg:text-3xl tracking-tight text-neutral-300 mb-14 leading-snug"
                                                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                                                >
                                                    The production layer for&nbsp;AI&nbsp;cinema.
                                                </motion.p>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 1.0, delay: 3.0, ease: [0.25, 0.1, 0.25, 1] }}
                                                    className="w-full max-w-sm pointer-events-auto"
                                                >
                                                    <WaitlistForm size="large" />
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ═══ TRANSITION: scroll into the problem ═══ */}
                                <div className="h-[30vh]" />

                                {/* ═══ PHASE 2: PROBLEM — AI video is broken ═══ */}
                                <div className="h-screen flex items-center relative">
                                    <div className="w-full max-w-6xl mx-auto px-6 md:px-16">
                                        <div className="md:ml-auto md:max-w-2xl space-y-8">
                                            <p
                                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tighter leading-[1.05] text-white/90"
                                                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}
                                            >
                                                AI video is
                                                <br />
                                                a dead end.
                                            </p>
                                            <div className="space-y-4">
                                                <p
                                                    className="text-base md:text-lg text-neutral-400 tracking-tight leading-relaxed max-w-lg"
                                                    style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                                >
                                                    Every generation is a one-shot. Nothing persists between clips.
                                                    Characters change faces. Environments reset. Lighting is random.
                                                </p>
                                                <p
                                                    className="text-base md:text-lg text-neutral-500 tracking-tight leading-relaxed max-w-lg"
                                                    style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                                >
                                                    You can&apos;t cut a scene from isolated clips. You can&apos;t build continuity from randomness.
                                                    Current AI video tools are built for demos — not for production.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION: from chaos to clarity ═══ */}
                                <div className="h-[30vh]" />

                                {/* ═══ PHASE 3: INSIGHT — Production needs a world ═══ */}
                                <div className="h-screen flex items-center justify-center relative">
                                    <div className="max-w-3xl px-6 text-center space-y-8">
                                        <p
                                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-white/80 leading-tight"
                                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}
                                        >
                                            Production needs a world,
                                            <br />
                                            not a prompt.
                                        </p>
                                        <p
                                            className="text-base md:text-lg text-neutral-400 tracking-tight leading-relaxed max-w-xl mx-auto"
                                            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                        >
                                            The missing layer between generation and production is persistence.
                                            A world that holds its state — so you can direct inside it, shoot from any angle,
                                            and return to it tomorrow exactly as you left it.
                                        </p>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION: insight to solution ═══ */}
                                <div className="h-[30vh]" />

                                {/* ═══ PHASE 4: SOLUTION — Gauset is that layer + mid-scroll CTA ═══ */}
                                <div className="h-screen flex items-center relative">
                                    <div className="w-full max-w-6xl mx-auto px-6 md:px-16">
                                        <div className="md:max-w-2xl space-y-8">
                                            <p
                                                className="text-[10px] uppercase tracking-[0.35em] text-white/30 font-medium"
                                                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                                            >
                                                Introducing Gauset
                                            </p>
                                            <p
                                                className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter leading-[1.05] text-white/90"
                                                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}
                                            >
                                                The production layer
                                                <br />
                                                for AI worlds.
                                            </p>
                                            <div className="space-y-4">
                                                <p
                                                    className="text-base md:text-lg text-neutral-400 tracking-tight leading-relaxed max-w-lg"
                                                    style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                                >
                                                    Build a world once. Direct inside it forever.
                                                    Persistent environments, controllable cameras, scene-level continuity.
                                                </p>
                                                <p
                                                    className="text-base md:text-lg text-neutral-500 tracking-tight leading-relaxed max-w-lg"
                                                    style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                                >
                                                    Gauset doesn&apos;t generate clips — it gives you a world you can work in.
                                                    Place cameras. Move characters. Shoot, re-shoot, iterate.
                                                    Like a real production — but the world is AI-generated.
                                                </p>
                                            </div>
                                            <div className="w-full max-w-sm pointer-events-auto pt-4">
                                                <WaitlistForm />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION: solution to proof ═══ */}
                                <div className="h-[30vh]" />

                                {/* ═══ PHASE 5: PROOF — One world, infinite shots ═══ */}
                                <div className="h-screen flex items-center justify-center relative">
                                    <div className="max-w-3xl px-6 text-center space-y-6">
                                        <p
                                            className="text-[10px] uppercase tracking-[0.35em] text-white/25 font-medium"
                                            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                                        >
                                            Persistent World Demo
                                        </p>
                                        <p
                                            className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-white/75 leading-tight"
                                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}
                                        >
                                            One world.
                                            <br />
                                            Infinite shots.
                                        </p>
                                        <p
                                            className="text-sm md:text-base text-neutral-500 tracking-tight leading-relaxed max-w-md mx-auto"
                                            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                        >
                                            Multiple camera paths through one persistent environment.
                                            Different angles, same continuity. Every frame belongs to the same world.
                                        </p>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION: proof to closing ═══ */}
                                <div className="h-[30vh]" />

                                {/* ═══ PHASE 6: CTA — Join early access ═══ */}
                                <div id="waitlist" className="h-screen flex flex-col items-center justify-center relative">
                                    <p
                                        className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-[-0.04em] text-white/85 mb-4"
                                        style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
                                    >
                                        Gauset
                                    </p>
                                    <p
                                        className="text-base sm:text-lg tracking-[0.08em] text-white/40 font-light mb-4"
                                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                    >
                                        Persistent worlds for production.
                                    </p>
                                    <p
                                        className="text-sm text-neutral-500 mb-10 tracking-tight"
                                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                    >
                                        Join the early access.
                                    </p>
                                    <div className="w-full max-w-sm pointer-events-auto mb-6">
                                        <WaitlistForm size="large" />
                                    </div>
                                    <p
                                        className="text-[11px] tracking-[0.2em] text-white/20 font-light mt-8"
                                        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                                    >
                                        Early access is limited.
                                    </p>
                                </div>

                                {/* Final breathing space */}
                                <div className="h-[10vh]" />

                            </div>
                        </Scroll>
                    </ScrollControls>

                    <EffectComposer multisampling={0}>
                        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} />
                        <Vignette offset={0.25} darkness={0.75} blendFunction={BlendFunction.NORMAL} />
                    </EffectComposer>

                    <Preload all />
                </Suspense>
            </Canvas>
        </div>
    );
}

function HeroWord({ word, delay, isLast = false }: { word: string; delay: number; isLast?: boolean }) {
    return (
        <motion.span
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50 ${isLast ? '' : 'mr-4 md:mr-6'}`}
        >
            {word}
        </motion.span>
    );
}
