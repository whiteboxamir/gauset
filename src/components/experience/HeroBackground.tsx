'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const VIDEOS = [
    { src: '/video/hero-bg-1.mp4', alt: 'Film production set with director and crew' },
    { src: '/video/hero-bg-2.mp4', alt: 'Cinematic night city with neon lights' },
    { src: '/video/hero-bg-3.mp4', alt: 'Actors filming a scene on set' },
];

const CYCLE_INTERVAL = 12000; // 12 seconds per video
const CROSSFADE_DURATION = 2000; // 2 second crossfade

export function HeroBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null]);
    const [parallax, setParallax] = useState({ x: 0, y: 0 });
    const [activeIndex, setActiveIndex] = useState(0);
    const [videosReady, setVideosReady] = useState<boolean[]>([false, false, false]);

    // Subtle parallax on mouse move
    useEffect(() => {
        const handleMouse = (e: MouseEvent) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;
            setParallax({ x: dx * -4, y: dy * -3 });
        };
        window.addEventListener('mousemove', handleMouse, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouse);
    }, []);

    // Mark a video as ready
    const handleVideoReady = useCallback((index: number) => {
        setVideosReady(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
    }, []);

    // Start all videos on mount (muted autoplay is allowed)
    useEffect(() => {
        videoRefs.current.forEach((video) => {
            if (video) {
                video.play().catch(() => { });
            }
        });
    }, []);

    // Cycle through videos
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % VIDEOS.length);
        }, CYCLE_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    // When active index changes, restart that video for a clean transition
    useEffect(() => {
        const video = videoRefs.current[activeIndex];
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => { });
        }
    }, [activeIndex]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            style={{ zIndex: 0, backgroundColor: '#050510' }}
        >
            {/* Three stacked video elements — crossfade by opacity */}
            {VIDEOS.map((scene, i) => (
                <video
                    key={scene.src}
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={scene.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={i === 0 ? 'auto' : 'metadata'}
                    onCanPlayThrough={() => handleVideoReady(i)}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        opacity: activeIndex === i && videosReady[i] ? 1 : 0,
                        transition: `opacity ${CROSSFADE_DURATION}ms ease-in-out`,
                        transform: `translate(${parallax.x}px, ${parallax.y}px)`,
                        animation: 'hero-drift 30s ease-in-out infinite',
                        willChange: 'opacity, transform',
                    }}
                />
            ))}

            {/* Haze / volumetric light overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 120% 80% at 40% 45%, rgba(255,240,200,0.06) 0%, transparent 60%)',
                    animation: 'hero-haze 12s ease-in-out infinite',
                    willChange: 'opacity, transform',
                }}
            />

            {/* Vignette overlay — strong to preserve text contrast */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(0,0,0,0.85) 100%)',
                }}
            />

            {/* Bottom fade for text + form readability */}
            <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                    height: '55%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                }}
            />

            {/* Top fade for nav readability */}
            <div
                className="absolute inset-x-0 top-0 pointer-events-none"
                style={{
                    height: '20%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)',
                }}
            />

            {/* Extra darkening behind center content area for form readability */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(0,0,0,0.55) 0%, transparent 75%)',
                }}
            />
        </div>
    );
}
