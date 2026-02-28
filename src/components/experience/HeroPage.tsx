'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Preload } from '@react-three/drei';
import { EffectComposer, Noise, Vignette, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { WorldRenderer } from './WorldRenderer';
import { WaitlistForm } from '@/components/ui/WaitlistForm';

/*
  SIX-PHASE CONVERSION FUNNEL — Cinematic Product Experience

  Phase 1 (0%–15%):   HOOK — "Build worlds. Not clips." (pure statement)
  Phase 2 (15%–30%):  PROBLEM — AI video is broken (FRACTURE world)
  Phase 3 (30%–50%):  SOLUTION — Gauset is the production layer (PRODUCTION world)
  Phase 4 (50%–70%):  PROOF — Same world, infinite shots (PERSISTENT SHOT world)
  Phase 5 (70%–85%):  HORIZON — The future of production
  Phase 6 (85%–100%): CTA — The singular early access moment
*/

export function HeroPage() {
    const [mounted, setMounted] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const handleFormSuccess = useCallback(() => {
        setSubmitted(true);
    }, []);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
            {/* Cinematic submission overlay — dims the world on success */}
            <AnimatePresence>
                {submitted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[100] pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at 50% 60%, rgba(13,59,79,0.25) 0%, rgba(10,22,40,0.5) 50%, rgba(0,0,0,0.7) 100%)',
                            backdropFilter: 'blur(4px)',
                        }}
                    />
                )}
            </AnimatePresence>

            <Canvas
                camera={{ fov: 50, near: 0.1, far: 200 }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 0.85,
                }}
                dpr={[1, 1.5]}
                style={{ background: '#000000' }}
            >
                <color attach="background" args={['#050510']} />
                <fog attach="fog" args={['#050510', 30, 120]} />

                <Suspense fallback={null}>
                    <ScrollControls pages={7} damping={0.12}>
                        <WorldRenderer />

                        <Scroll html style={{ width: '100%' }}>
                            <div className="w-screen pointer-events-none">

                                {/* ═══ PHASE 1: HOOK — Pure cinematic statement ═══ */}
                                <div className="h-screen flex flex-col items-center justify-center px-6 text-center relative">
                                    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 md:px-10 py-5 pointer-events-auto z-50">
                                        <div className="text-white/90 font-bold tracking-[0.15em] text-xs uppercase">Gauset</div>
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
                                                    className="max-w-xl md:max-w-2xl text-xl md:text-2xl lg:text-3xl tracking-tight text-neutral-300 mb-10 leading-snug"
                                                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                                                >
                                                    The production layer for&nbsp;AI&nbsp;cinema.
                                                </motion.p>

                                                {/* Primary CTA — the main event */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 1.0, delay: 3.0, ease: [0.25, 0.1, 0.25, 1] }}
                                                    className="w-full max-w-sm pointer-events-auto"
                                                >
                                                    <WaitlistForm
                                                        size="large"
                                                        placeholder="you@yourstudio.com"
                                                        buttonText="Enter early"
                                                        onSuccess={handleFormSuccess}
                                                    />
                                                </motion.div>

                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.8, delay: 3.6 }}
                                                    className="mt-5 text-[11px] uppercase tracking-[0.3em] font-medium"
                                                    style={{
                                                        color: 'rgba(100, 200, 220, 0.45)',
                                                        textShadow: '0 1px 12px rgba(13,59,79,0.4)',
                                                    }}
                                                >
                                                    Private access · Rolling invites
                                                </motion.p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ═══ TRANSITION ═══ */}
                                <div className="h-[25vh]" />

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
                                                    You can&apos;t cut a scene from isolated clips. You can&apos;t direct randomness.
                                                    Current AI video tools are built for demos — not for filmmaking.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION ═══ */}
                                <div className="h-[25vh]" />

                                {/* ═══ PHASE 3: SOLUTION — Gauset is the layer ═══ */}
                                <div className="h-screen flex items-center relative">
                                    <div className="w-full max-w-6xl mx-auto px-6 md:px-16">
                                        <div className="md:max-w-2xl space-y-8">
                                            <p
                                                className="text-[10px] uppercase tracking-[0.35em] font-medium"
                                                style={{
                                                    textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                                                    color: 'rgba(100, 200, 220, 0.5)',
                                                }}
                                            >
                                                Introducing Gauset
                                            </p>
                                            <p
                                                className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter leading-[1.05] text-white/90"
                                                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}
                                            >
                                                A world you can
                                                <br />
                                                work inside.
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
                                        </div>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION ═══ */}
                                <div className="h-[25vh]" />

                                {/* ═══ PHASE 4: PROOF — One world, infinite shots ═══ */}
                                <div className="h-[140vh] flex flex-col items-center relative">
                                    <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
                                        <div className="max-w-3xl px-6 text-center space-y-6">
                                            <p
                                                className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-white/80 leading-tight"
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
                                                Same environment. Same lighting. Same geometry.
                                                <br />
                                                Only the camera changes.
                                            </p>

                                            {/* Shot type labels */}
                                            <div className="flex gap-4 justify-center mt-8 flex-wrap">
                                                {['Wide', 'Close-up', 'OTS', 'Tracking'].map((shot) => (
                                                    <div
                                                        key={shot}
                                                        className="px-4 py-2 rounded-full border text-xs tracking-[0.15em] uppercase font-medium"
                                                        style={{
                                                            borderColor: 'rgba(100, 200, 220, 0.2)',
                                                            backgroundColor: 'rgba(100, 200, 220, 0.05)',
                                                            color: 'rgba(100, 200, 220, 0.7)',
                                                            textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                                                        }}
                                                    >
                                                        {shot}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION ═══ */}
                                <div className="h-[25vh]" />

                                {/* ═══ PHASE 5: HORIZON — The future ═══ */}
                                <div className="h-screen flex items-center justify-center relative">
                                    <div className="max-w-4xl px-6 text-center space-y-8">
                                        <p
                                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tighter text-white/85 leading-[1.05]"
                                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
                                        >
                                            The future of film
                                            <br />
                                            is already here.
                                        </p>
                                        <p
                                            className="text-base md:text-xl text-neutral-400 tracking-tight leading-relaxed max-w-xl mx-auto"
                                            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                        >
                                            AI-generated worlds you can direct, shoot in, and return to.
                                            The entire production pipeline — reimagined.
                                        </p>
                                    </div>
                                </div>

                                {/* ═══ TRANSITION ═══ */}
                                <div className="h-[15vh]" />

                                {/* ═══ PHASE 6: CLOSING — Cinematic sign-off ═══ */}
                                <div className="h-screen flex flex-col items-center justify-center relative">
                                    {/* Atmospheric gradient */}
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: 'radial-gradient(ellipse 80% 60% at 50% 55%, rgba(13,59,79,0.15) 0%, rgba(26,39,68,0.08) 40%, transparent 70%)',
                                        }}
                                    />

                                    <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6">
                                        <p
                                            className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-[-0.04em] text-white/90 mb-3"
                                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
                                        >
                                            Gauset
                                        </p>
                                        <p
                                            className="text-base sm:text-lg tracking-[0.08em] text-white/30 font-light"
                                            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
                                        >
                                            The world doesn&apos;t reset anymore.
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <footer className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 text-xs text-neutral-600">
                                        <span>© {new Date().getFullYear()} Gauset Inc.</span>
                                        <a href="#" className="hover:text-neutral-400 transition-colors pointer-events-auto">Privacy</a>
                                        <a href="#" className="hover:text-neutral-400 transition-colors pointer-events-auto">Terms</a>
                                    </footer>
                                </div>

                                {/* Final breathing space */}
                                <div className="h-[8vh]" />
                            </div>
                        </Scroll>
                    </ScrollControls>

                    <EffectComposer multisampling={0}>
                        <Bloom
                            luminanceThreshold={0.5}
                            luminanceSmoothing={0.5}
                            intensity={0.5}
                            radius={0.9}
                            mipmapBlur
                        />
                        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.15} />
                        <Vignette offset={0.25} darkness={0.65} blendFunction={BlendFunction.NORMAL} />
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
