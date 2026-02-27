'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorldProps {
    visibility: Float32Array;
    progress: Float32Array;
    index: number;
}

const GRID_SEGMENTS = 30;
const BIO_LINE_COUNT = 12;

export function HorizonWorld({ visibility, progress, index }: WorldProps) {
    const groupRef = useRef<THREE.Group>(null);
    const terrainRef = useRef<THREE.Mesh>(null);
    const gridRef = useRef<THREE.Mesh>(null);
    const bioLinesRef = useRef<THREE.Group>(null);

    // Generate bioluminescent line positions
    const bioLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i < BIO_LINE_COUNT; i++) {
            lines.push({
                x: (Math.random() - 0.5) * 40,
                z: -10 - Math.random() * 20,
                length: 5 + Math.random() * 15,
                angle: (Math.random() - 0.5) * 0.5,
                speed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
            });
        }
        return lines;
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

        // Terrain opacity
        if (terrainRef.current) {
            const mat = terrainRef.current.material as THREE.MeshStandardMaterial;
            mat.opacity = vis * 0.9;
        }

        // Wireframe grid fades in at edges
        if (gridRef.current) {
            const gridMat = gridRef.current.material as THREE.MeshBasicMaterial;
            gridMat.opacity = vis * 0.15 * (0.3 + prog * 0.7);
        }

        // Animate bioluminescent lines
        if (bioLinesRef.current) {
            bioLinesRef.current.children.forEach((child, i) => {
                const line = bioLines[i];
                const mesh = child as THREE.Mesh;
                const mat = mesh.material as THREE.MeshBasicMaterial;

                // Pulse glow
                const pulse = Math.sin(time * line.speed + line.phase) * 0.5 + 0.5;
                mat.opacity = vis * pulse * 0.6;
            });
        }

        // Slow push-in via group Z offset
        if (groupRef.current) {
            groupRef.current.position.z = prog * -3;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Golden hour sun — low angle */}
            <directionalLight
                position={[-15, 4, -20]}
                intensity={1.8}
                color="#D4A04A"
            />

            {/* Sky hemisphere light */}
            <hemisphereLight
                args={['#4A7FB5', '#2A2520', 0.4]}
            />

            {/* Warm ambient */}
            <ambientLight intensity={0.1} color="#E0A0A0" />

            {/* Anamorphic lens flare hint — bright point */}
            <pointLight
                position={[-20, 3, -30]}
                intensity={2}
                color="#D4A04A"
                distance={50}
            />

            {/* Terrain — large rolling plane */}
            <mesh
                ref={terrainRef}
                position={[0, -5, -15]}
                rotation={[-Math.PI / 2.5, 0, 0]}
            >
                <planeGeometry args={[60, 40, GRID_SEGMENTS, GRID_SEGMENTS]} />
                <meshStandardMaterial
                    color="#2A2520"
                    roughness={0.8}
                    metalness={0.1}
                    transparent
                    opacity={0.9}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Wireframe grid at terrain edges — world boundaries */}
            <mesh
                ref={gridRef}
                position={[0, -4.9, -15]}
                rotation={[-Math.PI / 2.5, 0, 0]}
            >
                <planeGeometry args={[60, 40, GRID_SEGMENTS, GRID_SEGMENTS]} />
                <meshBasicMaterial
                    color="#00ff9d"
                    wireframe
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Sky dome — gradient */}
            <mesh position={[0, 10, -30]}>
                <sphereGeometry args={[50, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshBasicMaterial
                    color="#1a2a40"
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Horizon glow */}
            <mesh position={[0, -2, -35]}>
                <planeGeometry args={[80, 15]} />
                <meshBasicMaterial
                    color="#D4A04A"
                    transparent
                    opacity={0.08}
                />
            </mesh>

            {/* Bioluminescent lines — neural pathways in the terrain */}
            <group ref={bioLinesRef}>
                {bioLines.map((line, i) => (
                    <mesh
                        key={i}
                        position={[line.x, -4.7, line.z]}
                        rotation={[-Math.PI / 2.5, line.angle, 0]}
                    >
                        <planeGeometry args={[0.05, line.length]} />
                        <meshBasicMaterial
                            color="#00ff9d"
                            transparent
                            opacity={0.4}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
}
