'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorldProps {
    visibility: Float32Array;
    progress: Float32Array;
    index: number;
}

const PARTICLE_COUNT = 3000;

export function VoidWorld({ visibility, progress, index }: WorldProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate stable particle positions
    const particles = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);
        const scales = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

            // Slow Brownian drift velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.002;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;

            scales[i] = 0.01 + Math.random() * 0.03;
        }
        return { positions, velocities, scales };
    }, []);

    useFrame((state, delta) => {
        const vis = visibility[index];
        if (vis <= 0 || !meshRef.current || !groupRef.current) return;

        groupRef.current.visible = true;

        const time = state.clock.elapsedTime;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3;

            // Drift particles
            particles.positions[ix] += particles.velocities[ix];
            particles.positions[ix + 1] += particles.velocities[ix + 1];
            particles.positions[ix + 2] += particles.velocities[ix + 2];

            // Subtle oscillation
            const ox = Math.sin(time * 0.1 + i * 0.1) * 0.003;
            const oy = Math.cos(time * 0.08 + i * 0.2) * 0.003;

            dummy.position.set(
                particles.positions[ix] + ox,
                particles.positions[ix + 1] + oy,
                particles.positions[ix + 2]
            );
            dummy.scale.setScalar(particles.scales[i]);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;

        // Fade opacity based on visibility
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.opacity = vis * 0.6;
    });

    return (
        <group ref={groupRef}>
            {/* Amber key light — distant, upper-right */}
            <directionalLight
                position={[20, 15, 10]}
                intensity={0.4}
                color="#D4A04A"
            />

            {/* No ambient — true darkness */}
            <ambientLight intensity={0.02} color="#1a1a2e" />

            {/* Micro-particles — interstellar dust */}
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, PARTICLE_COUNT]}
                frustumCulled={false}
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color="#D4A04A"
                    emissive="#D4A04A"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.6}
                    roughness={0.9}
                />
            </instancedMesh>
        </group>
    );
}
