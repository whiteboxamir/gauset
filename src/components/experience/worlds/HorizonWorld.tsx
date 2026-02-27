'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorldProps {
    visibility: Float32Array;
    progress: Float32Array;
    index: number;
}

const CLOUD_COUNT = 12;

// Bright, expansive, cinematic future — golden hour, hopeful
export function HorizonWorld({ visibility, progress, index }: WorldProps) {
    const groupRef = useRef<THREE.Group>(null);
    const terrainRef = useRef<THREE.Mesh>(null);
    const skyRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Group>(null);
    const sunGlowRef = useRef<THREE.Mesh>(null);

    // Cloud positions
    const clouds = useMemo(() => {
        const data = [];
        for (let i = 0; i < CLOUD_COUNT; i++) {
            data.push({
                x: (Math.random() - 0.5) * 80,
                y: 8 + Math.random() * 15,
                z: -20 - Math.random() * 40,
                scaleX: 5 + Math.random() * 12,
                scaleY: 1 + Math.random() * 2,
                speed: 0.01 + Math.random() * 0.03,
                opacity: 0.1 + Math.random() * 0.15,
            });
        }
        return data;
    }, []);

    useFrame((state) => {
        const vis = visibility[index];
        if (!groupRef.current) return;

        if (vis <= 0) {
            groupRef.current.visible = false;
            return;
        }
        groupRef.current.visible = true;

        const time = state.clock.elapsedTime;
        const prog = progress[index];

        // Terrain fade
        if (terrainRef.current) {
            const mat = terrainRef.current.material as THREE.MeshStandardMaterial;
            mat.opacity = vis * 0.95;
        }

        // Sky dome brightness
        if (skyRef.current) {
            const skyMat = skyRef.current.material as THREE.MeshBasicMaterial;
            skyMat.opacity = vis * 0.6;
        }

        // Sun glow pulse
        if (sunGlowRef.current) {
            const sunMat = sunGlowRef.current.material as THREE.MeshBasicMaterial;
            sunMat.opacity = vis * (0.3 + Math.sin(time * 0.2) * 0.05);
        }

        // Animate clouds — slow drift
        if (cloudsRef.current) {
            cloudsRef.current.children.forEach((child, i) => {
                const cloud = clouds[i];
                const mesh = child as THREE.Mesh;
                const mat = mesh.material as THREE.MeshBasicMaterial;
                mesh.position.x = cloud.x + time * cloud.speed * 10;
                // Wrap clouds
                if (mesh.position.x > 50) mesh.position.x -= 100;
                mat.opacity = vis * cloud.opacity;
            });
        }

        // Slow push-in
        if (groupRef.current) {
            groupRef.current.position.z = prog * -3;
        }
    });

    return (
        <group ref={groupRef}>
            {/* ═══ LIGHTING — Golden hour / sunrise ═══ */}

            {/* Golden sun — low angle from horizon */}
            <directionalLight
                position={[-20, 5, -30]}
                intensity={2.5}
                color="#FFB347"
            />

            {/* Sky hemisphere — warm blue/amber */}
            <hemisphereLight args={['#87CEEB', '#D4A04A', 0.5]} />

            {/* Warm ambient — bright scene */}
            <ambientLight intensity={0.15} color="#FFE4B5" />

            {/* Sun point source */}
            <pointLight
                position={[-25, 5, -40]}
                intensity={3}
                color="#FFB347"
                distance={60}
            />

            {/* ═══ TERRAIN — Expansive landscape ═══ */}
            <mesh
                ref={terrainRef}
                position={[0, -5, -15]}
                rotation={[-Math.PI / 2.3, 0, 0]}
            >
                <planeGeometry args={[100, 60, 40, 40]} />
                <meshStandardMaterial
                    color="#8B7355"
                    roughness={0.85}
                    metalness={0.05}
                    transparent
                    opacity={0.95}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* ═══ SKY DOME — Warm gradient ═══ */}
            <mesh
                ref={skyRef}
                position={[0, 15, -30]}
            >
                <sphereGeometry args={[70, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshBasicMaterial
                    color="#4A7FB5"
                    transparent
                    opacity={0.6}
                    side={THREE.BackSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Horizon warm gradient band */}
            <mesh position={[0, 0, -50]}>
                <planeGeometry args={[120, 20]} />
                <meshBasicMaterial
                    color="#FFB347"
                    transparent
                    opacity={0.12}
                    depthWrite={false}
                />
            </mesh>

            {/* ═══ SUN GLOW ═══ */}
            <mesh ref={sunGlowRef} position={[-25, 5, -55]}>
                <sphereGeometry args={[8, 16, 16]} />
                <meshBasicMaterial
                    color="#FFD700"
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                />
            </mesh>

            {/* Sun core — bright point */}
            <mesh position={[-25, 5, -55]}>
                <sphereGeometry args={[2, 12, 12]} />
                <meshBasicMaterial color="#FFF8DC" transparent opacity={0.8} depthWrite={false} />
            </mesh>

            {/* ═══ CLOUDS — Slow drifting ═══ */}
            <group ref={cloudsRef}>
                {clouds.map((cloud, i) => (
                    <mesh
                        key={i}
                        position={[cloud.x, cloud.y, cloud.z]}
                        scale={[cloud.scaleX, cloud.scaleY, 1]}
                    >
                        <planeGeometry args={[1, 1]} />
                        <meshBasicMaterial
                            color="#FFFFFF"
                            transparent
                            opacity={cloud.opacity}
                            side={THREE.DoubleSide}
                            depthWrite={false}
                        />
                    </mesh>
                ))}
            </group>

            {/* ═══ SCALE INDICATORS — Distant structures ═══ */}
            {/* Distant buildings/structures on horizon */}
            {[[-30, -20], [-15, -25], [20, -30], [35, -22]].map(([x, z], i) => (
                <mesh key={i} position={[x!, -3, z! - 15]}>
                    <boxGeometry args={[1 + Math.random(), 3 + Math.random() * 5, 1 + Math.random()]} />
                    <meshStandardMaterial
                        color="#6B5B4A"
                        roughness={0.9}
                        transparent
                        opacity={0.4}
                    />
                </mesh>
            ))}

            {/* Distant figure for scale — tiny silhouette on terrain */}
            <mesh position={[8, -3.5, -12]}>
                <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
                <meshStandardMaterial color="#3a3028" roughness={0.9} />
            </mesh>
            <mesh position={[8, -2.9, -12]}>
                <sphereGeometry args={[0.1, 6, 6]} />
                <meshStandardMaterial color="#3a3028" roughness={0.9} />
            </mesh>
        </group>
    );
}
