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
  FULL CINEMATIC EXPERIENCE
  
  10 scroll pages → 8 phases, continuous narrative.
  
  Page 1 (0%–10%):     THE VOID — "Build worlds. Not clips." (promise)
  Gap (10%–15%):       Scroll into the problem
  Page 2 (15%–30%):    THE FRACTURE — "AI video breaks at production." (pain)
  Gap (30%–35%):       The shift from chaos to control
  Page 3 (35%–42%):    THE PRODUCTION — "What if the world stayed?" (pivot)
  Page 4 (42%–54%):    TYSON — "One world. Every angle." (proof)
  Page 5 (54%–66%):    CONQUISTADOR — "A different world, same control." (breadth)
  Page 6 (66%–78%):    WORLD REUSE — "Same world. Different shots." (key insight)
  Page 7 (78%–92%):    FOUNDERS — Amir, Krasi, Brett (authorship)
  Page 8 (92%–100%):   CLOSING — "Persistent worlds for production." (conviction)
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
                    <ScrollControls pages={10} damping={0.12}>
                        <CinematicScene />

                        <Scroll html style={{ width: '100%' }}>
                            <div className="w-screen pointer-events-none">

                                {/* ═══ WORLD 1: THE VOID — "Creation begins in nothing" ═══ */}
                                <div className="h-screen flex flex-col items-center justify-center px-6 text-center relative">
                                    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 md:px-10 py-5 pointer-events-auto z-50">
                                        <div className="text-white/90 font-bold tracking-[0.15em] text-xs uppercase">Gauset</div>
                                        <a
                                            href="/login"
                                            className="text-white/50 text-xs tracking-wider border border-white/[0.08] rounded-full px-5 py-2.5 hover:text-white/80 hover:border-white/[0.15] transition-all duration-500"
                                        >
                                            Log In
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

                                {/* ═══ TRANSITION ZONE 1 — scroll into the problem ═══ */}
                                <div className="h-[50vh]" />

                                {/* ═══ WORLD 2: THE FRACTURE — "The problem: AI video doesn't persist" ═══ */}
                                <div className="h-screen flex items-center relative">
                                    <div className="w-full max-w-6xl mx-auto px-6 md:px-16">
                                        <div className="md:ml-auto md:max-w-2xl">
                                            <p
                                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tighter leading-[1.05] text-white/90"
                                                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}
                                            >
                                                AI&nbsp;video breaks
                                                <br />
                                                at production.
                                            </p>
                                            <p
                                                className="mt-8 text-lg md:text-xl text-neutral-500 tracking-tight leading-relaxed max-w-md"
                                                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                            >
                                                Nothing persists. Nothing matches.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION ZONE 2 ═══ */}
                                <div className="h-[60vh]" />

                                {/* ═══ WORLD 3: THE PRODUCTION — pivot ═══ */}
                                <div className="h-screen flex items-center justify-center relative">
                                    <p
                                        className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-white/60 leading-tight px-6"
                                        style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}
                                    >
                                        What if the world&nbsp;stayed?
                                    </p>
                                </div>

                                {/* ═══ TRANSITION ZONE 3 ═══ */}
                                <div className="h-[40vh]" />

                                {/* ═══ WORLD 4: TYSON ═══ */}
                                <div className="h-screen flex items-end relative">
                                    <div className="w-full px-6 md:px-10 pb-12">
                                        <p
                                            className="text-[10px] uppercase tracking-[0.35em] text-white/20 font-medium mb-2"
                                            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                                        >
                                            Persistent world
                                        </p>
                                        <p
                                            className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-white/55"
                                            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}
                                        >
                                            Lightning in a Bottle
                                        </p>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION ZONE 4 ═══ */}
                                <div className="h-[40vh]" />

                                {/* ═══ WORLD 5: CONQUISTADOR ═══ */}
                                <div className="h-screen flex items-end justify-end relative">
                                    <div className="px-6 md:px-10 pb-12 text-right">
                                        <p
                                            className="text-[10px] uppercase tracking-[0.35em] text-white/20 font-medium mb-2"
                                            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                                        >
                                            Persistent world
                                        </p>
                                        <p
                                            className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-white/55"
                                            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}
                                        >
                                            Conquistador
                                        </p>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION ZONE 5 ═══ */}
                                <div className="h-[40vh]" />

                                {/* ═══ WORLD 6: WORLD REUSE ═══ */}
                                <div className="h-[70vh] flex items-center justify-center relative">
                                    <p
                                        className="text-sm sm:text-base tracking-[0.15em] text-white/30 font-medium"
                                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                    >
                                        Same world. Different shots.
                                    </p>
                                </div>

                                {/* ═══ TRANSITION ZONE 6 — quiet before presence ═══ */}
                                <div className="h-[40vh]" />

                                {/* ═══ WORLD 7: FOUNDERS — discovered, not presented ═══ */}
                                <div className="h-screen flex items-end relative">
                                    <div className="w-full flex justify-between items-end px-8 md:px-16 pb-14">
                                        <div className="text-left">
                                            <p className="text-[11px] tracking-[0.3em] text-white/20 font-light">Amir</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[11px] tracking-[0.3em] text-white/20 font-light">Krasi</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] tracking-[0.3em] text-white/20 font-light">Brett</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION ZONE 7 — the world stops moving ═══ */}
                                <div className="h-[60vh]" />

                                {/* ═══ WORLD 8: CLOSING — "The name. The mission. The invitation." ═══ */}
                                <div className="h-screen flex flex-col items-center justify-center relative">
                                    <p
                                        className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-[-0.04em] text-white/85 mb-4"
                                        style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
                                    >
                                        Gauset
                                    </p>
                                    <p
                                        className="text-sm sm:text-base tracking-[0.12em] text-white/35 font-light mb-16"
                                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                    >
                                        Persistent worlds for production.
                                    </p>
                                    <a
                                        href="/login"
                                        className="text-[11px] tracking-[0.35em] uppercase text-white/40 hover:text-white/70 transition-colors duration-700 pointer-events-auto border-b border-white/10 pb-1 hover:border-white/25"
                                        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
                                    >
                                        Request access
                                    </a>
                                </div>

                                {/* Final breathing space */}
                                <div className="h-[20vh]" />

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
