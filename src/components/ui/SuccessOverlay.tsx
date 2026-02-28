'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessOverlayProps {
    show: boolean;
}

// Generate stable particle configs once
function generateParticles(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 1.5 + Math.random() * 2.5,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 6,
        opacity: 0.15 + Math.random() * 0.25,
    }));
}

export function SuccessOverlay({ show }: SuccessOverlayProps) {
    const [showDelayedLine, setShowDelayedLine] = useState(false);
    const particles = useMemo(() => generateParticles(20), []);

    useEffect(() => {
        if (!show) return;
        const timer = setTimeout(() => setShowDelayedLine(true), 1500);
        return () => clearTimeout(timer);
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="success-overlay"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[200] flex items-center justify-center"
                    style={{ willChange: 'opacity, transform' }}
                >
                    {/* Deep vignette background */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `
                                radial-gradient(ellipse 70% 60% at 50% 50%, rgba(15, 10, 40, 0.85) 0%, rgba(5, 5, 15, 0.95) 60%, rgba(0, 0, 0, 0.98) 100%)
                            `,
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                        }}
                    />

                    {/* Radial light sweep — one-shot */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle at 50% 50%, rgba(120, 100, 220, 0.12) 0%, transparent 60%)',
                            animation: 'light-sweep 1.8s ease-out forwards',
                        }}
                    />

                    {/* Glowing orb with breathing animation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                            className="rounded-full"
                            style={{
                                width: '380px',
                                height: '380px',
                                background: `
                                    radial-gradient(circle,
                                        rgba(80, 60, 200, 0.18) 0%,
                                        rgba(100, 80, 220, 0.1) 25%,
                                        rgba(60, 40, 180, 0.05) 50%,
                                        transparent 70%
                                    )
                                `,
                                animation: 'orb-breathe 5s ease-in-out infinite',
                                willChange: 'transform, opacity',
                            }}
                        />
                    </div>

                    {/* Ambient particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {particles.map((p) => (
                            <div
                                key={p.id}
                                className="absolute rounded-full"
                                style={{
                                    left: p.left,
                                    bottom: '-10px',
                                    width: `${p.size}px`,
                                    height: `${p.size}px`,
                                    background: `radial-gradient(circle, rgba(140, 120, 255, ${p.opacity}) 0%, transparent 70%)`,
                                    animation: `particle-float ${p.duration}s linear ${p.delay}s infinite`,
                                    willChange: 'transform, opacity',
                                }}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="mb-8"
                        >
                            <span
                                className="inline-block px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-medium"
                                style={{
                                    border: '1px solid rgba(120, 100, 220, 0.3)',
                                    backgroundColor: 'rgba(120, 100, 220, 0.08)',
                                    color: 'rgba(180, 165, 255, 0.8)',
                                    boxShadow: '0 0 20px rgba(100, 80, 200, 0.1)',
                                }}
                            >
                                Wave 1 Access
                            </span>
                        </motion.div>

                        {/* Primary: "You're in." */}
                        <motion.h2
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.0, ease: [0.22, 1, 0.36, 1] }}
                            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-none mb-4"
                            style={{
                                background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(180,165,255,0.85) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: 'none',
                            }}
                        >
                            You&apos;re in.
                        </motion.h2>

                        {/* Secondary: "Early access granted." */}
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                            className="text-lg sm:text-xl tracking-tight text-neutral-300 mb-3"
                        >
                            Early access granted.
                        </motion.p>

                        {/* Tertiary: "Wave 1 — limited rollout." */}
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                            className="text-sm tracking-wide mb-2"
                            style={{ color: 'rgba(140, 120, 255, 0.65)' }}
                        >
                            Wave 1 — limited rollout.
                        </motion.p>

                        {/* Quaternary: "We'll reach out when your world is ready." */}
                        <motion.p
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                            className="text-sm tracking-tight text-neutral-500 mb-0"
                        >
                            We&apos;ll reach out when your world is ready.
                        </motion.p>

                        {/* Delayed line after 1.5s */}
                        <AnimatePresence>
                            {showDelayedLine && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    className="mt-10 flex flex-col items-center gap-4"
                                >
                                    <div
                                        className="w-12 h-px"
                                        style={{
                                            background: 'linear-gradient(90deg, transparent, rgba(140, 120, 255, 0.2), transparent)',
                                        }}
                                    />
                                    <p
                                        className="text-xs tracking-[0.15em] uppercase"
                                        style={{ color: 'rgba(255, 255, 255, 0.18)' }}
                                    >
                                        Invites rolling out soon
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
