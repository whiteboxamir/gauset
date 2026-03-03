'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── Stage data ─── */
const STAGES = [
    {
        id: 'screenplay',
        label: 'SCREENPLAY',
        tagline: 'A screenplay enters the system.',
        meta: 'SC 01 · PARSE · INGEST',
        detail: 'Structure, characters, locations, props — extracted and indexed.',
        accent: '#d4a04a', // gold
        statusLabel: 'INGESTING',
    },
    {
        id: 'world-gen',
        label: 'WORLD GENERATION',
        tagline: 'Scenes become explorable worlds.',
        meta: 'ENV · BUILD · POPULATE',
        detail: 'Persistent environments generated from scene descriptions.',
        accent: '#4a9fd4', // blue
        statusLabel: 'GENERATING',
    },
    {
        id: 'staging',
        label: 'STAGING',
        tagline: 'Direct, block, and iterate in real-time.',
        meta: 'CAM · ACTOR · LIGHT',
        detail: 'Place cameras. Direct performances. Adjust in the world.',
        accent: '#ef4444', // red
        statusLabel: 'RECORDING',
    },
    {
        id: 'orchestration',
        label: 'ORCHESTRATION',
        tagline: 'An agent maintains continuity across the film.',
        meta: 'CONTINUITY · RENDER · EXPORT',
        detail: 'Every shot, every scene — connected and consistent.',
        accent: '#d4a04a', // gold
        statusLabel: 'ORCHESTRATING',
    },
] as const;

const MONO: React.CSSProperties = {
    fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", "Courier New", monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
};

/* ═══════════════════════════════════════════════════════════════
   PipelineSection — Scroll-driven cinematic sequence
   ═══════════════════════════════════════════════════════════════ */
export function PipelineSection() {
    return (
        <div style={{ zIndex: 1, position: 'relative' }}>
            {/* 4 stages — each revealed on scroll */}
            {STAGES.map((stage, i) => (
                <PipelineStage key={stage.id} stage={stage} index={i} total={STAGES.length} />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PipelineStage — A single cinematic stage
   ═══════════════════════════════════════════════════════════════ */
function PipelineStage({
    stage,
    index,
    total,
}: {
    stage: (typeof STAGES)[number];
    index: number;
    total: number;
}) {
    const stageRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.25 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const isLeft = index % 2 === 0;

    return (
        <div
            ref={stageRef}
            className="relative flex items-center justify-center px-6 md:px-16"
            style={{ minHeight: '55dvh' }}
        >
            {/* ── Stage content ── */}
            <div
                className={`w-full max-w-5xl flex flex-col ${isLeft ? 'md:items-start' : 'md:items-end'} items-center`}
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'all 1s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
            >
                {/* Director-view HUD frame for this stage */}
                <div
                    className="relative w-full md:max-w-lg"
                    style={{ padding: '32px 28px', minHeight: '200px' }}
                >
                    {/* ── Border frame ── */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            border: `1px solid rgba(255, 255, 255, 0.07)`,
                            borderRadius: '2px',
                        }}
                    />

                    {/* ── Corner brackets ── */}
                    <CornerBrackets color={stage.accent} visible={visible} />

                    {/* ── Scanline overlay ── */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 6px)',
                            opacity: visible ? 0.6 : 0,
                            transition: 'opacity 1s ease 0.3s',
                        }}
                    />

                    {/* ── Top-left: status indicator ── */}
                    <div
                        className="flex items-center gap-2 mb-6"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateX(0)' : 'translateX(-10px)',
                            transition: 'all 0.7s ease 0.3s',
                        }}
                    >
                        <div
                            className="w-[6px] h-[6px] rounded-full"
                            style={{
                                backgroundColor: stage.accent,
                                boxShadow: `0 0 8px ${stage.accent}80`,
                                animation: visible ? 'rec-pulse 2s ease-in-out infinite' : 'none',
                            }}
                        />
                        <span
                            style={{
                                ...MONO,
                                fontSize: '9px',
                                color: `${stage.accent}cc`,
                                letterSpacing: '0.2em',
                            }}
                        >
                            {stage.statusLabel}
                        </span>
                        <span style={{ ...MONO, fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>
                            ·
                        </span>
                        <span style={{ ...MONO, fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                            {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
                        </span>
                    </div>

                    {/* ── Main headline ── */}
                    <h3
                        className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tighter leading-tight mb-3"
                        style={{
                            color: 'rgba(255,255,255,0.9)',
                            textShadow: '0 4px 30px rgba(0,0,0,0.9)',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0)' : 'translateY(16px)',
                            transition: 'all 0.8s ease 0.4s',
                        }}
                    >
                        {stage.tagline}
                    </h3>

                    {/* ── Body text ── */}
                    <p
                        className="text-sm md:text-base tracking-tight leading-relaxed max-w-md mb-5"
                        style={{
                            color: 'rgba(255,255,255,0.4)',
                            textShadow: '0 2px 16px rgba(0,0,0,0.9)',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0)' : 'translateY(12px)',
                            transition: 'all 0.8s ease 0.55s',
                        }}
                    >
                        {stage.detail}
                    </p>

                    {/* ── Bottom metadata bar ── */}
                    <div
                        className="flex items-center gap-4"
                        style={{
                            opacity: visible ? 1 : 0,
                            transition: 'opacity 0.8s ease 0.7s',
                        }}
                    >
                        <span
                            style={{
                                ...MONO,
                                fontSize: '10px',
                                color: 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {stage.meta}
                        </span>
                    </div>

                    {/* ── Ambient stage-specific visual ── */}
                    <StageVisual stageId={stage.id} accent={stage.accent} visible={visible} />
                </div>
            </div>

            {/* ── Vertical progress line ── */}
            {index < total - 1 && (
                <div
                    className="absolute left-1/2 bottom-0 w-px"
                    style={{
                        height: '60px',
                        transform: 'translateX(-50%)',
                        background: `linear-gradient(to bottom, ${stage.accent}30 0%, transparent 100%)`,
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 1s ease 0.8s',
                    }}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   CornerBrackets — Film viewfinder corner brackets
   ═══════════════════════════════════════════════════════════════ */
function CornerBrackets({ color, visible }: { color: string; visible: boolean }) {
    const corners = [
        { top: '-1px', left: '-1px', borderTop: true, borderLeft: true },
        { top: '-1px', right: '-1px', borderTop: true, borderRight: true },
        { bottom: '-1px', left: '-1px', borderBottom: true, borderLeft: true },
        { bottom: '-1px', right: '-1px', borderBottom: true, borderRight: true },
    ];

    return (
        <>
            {corners.map((c, i) => {
                const pos: React.CSSProperties = {};
                if (c.top !== undefined) pos.top = c.top;
                if (c.bottom !== undefined) pos.bottom = c.bottom;
                if (c.left !== undefined) pos.left = c.left;
                if (c.right !== undefined) pos.right = c.right;

                return (
                    <div
                        key={i}
                        className="absolute pointer-events-none"
                        style={{
                            ...pos,
                            width: '16px',
                            height: '16px',
                            borderTop: c.borderTop ? `2px solid ${color}60` : 'none',
                            borderBottom: c.borderBottom ? `2px solid ${color}60` : 'none',
                            borderLeft: c.borderLeft ? `2px solid ${color}60` : 'none',
                            borderRight: c.borderRight ? `2px solid ${color}60` : 'none',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'scale(1)' : 'scale(0.5)',
                            transition: `all 0.5s ease ${0.2 + i * 0.08}s`,
                        }}
                    />
                );
            })}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════
   StageVisual — Ambient background visual per stage
   ═══════════════════════════════════════════════════════════════ */
function StageVisual({
    stageId,
    accent,
    visible,
}: {
    stageId: string;
    accent: string;
    visible: boolean;
}) {
    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 1.2s ease 0.5s',
                zIndex: -1,
            }}
        >
            {stageId === 'screenplay' && <ScreenplayVisual accent={accent} />}
            {stageId === 'world-gen' && <WorldGenVisual accent={accent} />}
            {stageId === 'staging' && <StagingVisual accent={accent} />}
            {stageId === 'orchestration' && <OrchestrationVisual accent={accent} />}
        </div>
    );
}

/* ── Screenplay: streaming text fragments ── */
function ScreenplayVisual({ accent }: { accent: string }) {
    return (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.08]">
            {Array.from({ length: 7 }, (_, i) => (
                <div
                    key={i}
                    className="mb-1"
                    style={{
                        height: '2px',
                        width: `${40 + Math.random() * 80}px`,
                        background: accent,
                        animation: `pipeline-text-scan 2.5s ease-in-out ${i * 0.3}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

/* ── World Gen: radial grid pulse ── */
function WorldGenVisual({ accent }: { accent: string }) {
    return (
        <>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        top: '50%',
                        left: '50%',
                        width: `${100 + i * 80}px`,
                        height: `${100 + i * 80}px`,
                        transform: 'translate(-50%, -50%)',
                        border: `1px solid ${accent}`,
                        opacity: 0.04 - i * 0.01,
                        animation: `pipeline-ring-pulse 4s ease-in-out ${i * 0.6}s infinite`,
                    }}
                />
            ))}
        </>
    );
}

/* ── Staging: viewfinder grid ── */
function StagingVisual({ accent }: { accent: string }) {
    return (
        <>
            {/* Rule of thirds grid — very faint */}
            <div
                className="absolute inset-0"
                style={{ opacity: 0.04 }}
            >
                <div className="absolute top-1/3 left-0 right-0 h-px" style={{ background: accent }} />
                <div className="absolute top-2/3 left-0 right-0 h-px" style={{ background: accent }} />
                <div className="absolute left-1/3 top-0 bottom-0 w-px" style={{ background: accent }} />
                <div className="absolute left-2/3 top-0 bottom-0 w-px" style={{ background: accent }} />
            </div>
            {/* Center focus reticle */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ opacity: 0.06 }}
            >
                <div className="w-6 h-6 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px" style={{ background: accent }} />
                    <div className="absolute left-1/2 top-0 h-full w-px" style={{ background: accent }} />
                </div>
            </div>
        </>
    );
}

/* ── Orchestration: connecting node constellation ── */
function OrchestrationVisual({ accent }: { accent: string }) {
    const points = [
        { x: 80, y: 25 },
        { x: 90, y: 55 },
        { x: 75, y: 75 },
        { x: 60, y: 40 },
        { x: 95, y: 35 },
    ];
    const lines = [
        [0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 1],
    ];

    return (
        <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            style={{ opacity: 0.06 }}
        >
            {lines.map(([a, b], i) => (
                <line
                    key={`l-${i}`}
                    x1={points[a].x}
                    y1={points[a].y}
                    x2={points[b].x}
                    y2={points[b].y}
                    stroke={accent}
                    strokeWidth="0.4"
                    style={{ animation: `pipeline-line-draw 3s ease ${i * 0.2}s infinite` }}
                />
            ))}
            {points.map((p, i) => (
                <circle
                    key={`c-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r="1.5"
                    fill={accent}
                    style={{ animation: `pipeline-node-pulse 3s ease ${i * 0.3}s infinite` }}
                />
            ))}
        </svg>
    );
}
