'use client';

import { motion } from 'framer-motion';

// ── Director View label ──
// Minimal, static, semi-transparent film-monitor overlay
// Positioned in top-right corner, not distracting

export function DirectorOverlay() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 4.0, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-20 right-6 md:right-10 pointer-events-none"
            style={{ zIndex: 40 }}
        >
            <div
                style={{
                    fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
                    fontSize: '9px',
                    letterSpacing: '0.15em',
                    lineHeight: '1.8',
                    color: 'rgba(255, 255, 255, 0.25)',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                }}
            >
                {/* REC indicator */}
                <div className="flex items-center gap-2 justify-end mb-1">
                    <div
                        className="w-[5px] h-[5px] rounded-full"
                        style={{
                            backgroundColor: '#ef4444',
                            boxShadow: '0 0 4px rgba(239,68,68,0.5)',
                            animation: 'glow-pulse 2s ease-in-out infinite',
                        }}
                    />
                    <span>Director View</span>
                </div>

                <div style={{ color: 'rgba(255, 255, 255, 0.18)' }}>
                    <div>Lens: 50mm</div>
                    <div>Camera: Dolly</div>
                </div>
            </div>
        </motion.div>
    );
}
