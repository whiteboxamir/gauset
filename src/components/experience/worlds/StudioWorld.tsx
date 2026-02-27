'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorldProps {
    visibility: Float32Array;
    progress: Float32Array;
    index: number;
}

export function StudioWorld({ visibility, progress, index }: WorldProps) {
    const groupRef = useRef<THREE.Group>(null);
    const floorRef = useRef<THREE.Mesh>(null);
    const wallsRef = useRef<(THREE.Mesh | null)[]>([]);

    // LED wall emissive color shifts
    const wallColors = useMemo(() => [
        new THREE.Color('#1A8F8F'), // teal
        new THREE.Color('#E07020'), // orange
        new THREE.Color('#1A8F8F'), // teal
    ], []);

    const tempColor = useMemo(() => new THREE.Color(), []);

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

        // Animate LED wall colors — slow shift between teal and orange
        wallsRef.current.forEach((wall, i) => {
            if (!wall) return;
            const mat = wall.material as THREE.MeshStandardMaterial;
            const shift = Math.sin(time * 0.3 + i * 2.1) * 0.5 + 0.5;
            tempColor.lerpColors(wallColors[0], wallColors[1], shift);
            mat.emissive.copy(tempColor);
            mat.emissiveIntensity = 0.3 + shift * 0.3;
            mat.opacity = vis * 0.85;
        });

        // Floor reflectivity
        if (floorRef.current) {
            const floorMat = floorRef.current.material as THREE.MeshStandardMaterial;
            floorMat.opacity = vis * 0.9;
        }

        // Camera crane-up effect via group Y offset
        if (groupRef.current) {
            groupRef.current.position.y = -prog * 2;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Overhead practical light */}
            <spotLight
                position={[0, 12, -5]}
                angle={0.6}
                penumbra={0.8}
                intensity={1.5}
                color="#F0F0F0"
                distance={40}
                castShadow={false}
            />

            {/* Teal spill from left wall */}
            <pointLight position={[-12, 3, -8]} intensity={0.6} color="#1A8F8F" distance={20} />
            {/* Orange spill from right wall */}
            <pointLight position={[12, 3, -8]} intensity={0.5} color="#E07020" distance={20} />

            <ambientLight intensity={0.05} color="#0A0A0A" />

            {/* Floor — wet matte black with reflections */}
            <mesh
                ref={floorRef}
                position={[0, -4, -8]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[30, 20]} />
                <meshStandardMaterial
                    color="#0A0A0A"
                    metalness={0.8}
                    roughness={0.3}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Left LED wall */}
            <mesh
                ref={el => { wallsRef.current[0] = el; }}
                position={[-12, 2, -8]}
                rotation={[0, Math.PI / 6, 0]}
            >
                <planeGeometry args={[8, 12]} />
                <meshStandardMaterial
                    color="#0A0A0A"
                    emissive="#1A8F8F"
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.85}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Center LED wall */}
            <mesh
                ref={el => { wallsRef.current[1] = el; }}
                position={[0, 2, -15]}
            >
                <planeGeometry args={[20, 12]} />
                <meshStandardMaterial
                    color="#0A0A0A"
                    emissive="#E07020"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.85}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Right LED wall */}
            <mesh
                ref={el => { wallsRef.current[2] = el; }}
                position={[12, 2, -8]}
                rotation={[0, -Math.PI / 6, 0]}
            >
                <planeGeometry args={[8, 12]} />
                <meshStandardMaterial
                    color="#0A0A0A"
                    emissive="#1A8F8F"
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.85}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Scan line overlay on center wall */}
            <mesh position={[0, 2, -14.9]}>
                <planeGeometry args={[20, 12]} />
                <meshBasicMaterial
                    color="#F0F0F0"
                    wireframe
                    transparent
                    opacity={0.03}
                />
            </mesh>

            {/* Equipment silhouettes — camera rig */}
            <mesh position={[-6, -1, 2]}>
                <boxGeometry args={[0.3, 4, 0.3]} />
                <meshStandardMaterial color="#0A0A0A" roughness={1} />
            </mesh>
            <mesh position={[-6, 1, 2]}>
                <boxGeometry args={[1.5, 0.8, 0.8]} />
                <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.5} />
            </mesh>

            {/* Light stand silhouette */}
            <mesh position={[7, -1, 0]}>
                <boxGeometry args={[0.2, 5, 0.2]} />
                <meshStandardMaterial color="#0A0A0A" roughness={1} />
            </mesh>
            <mesh position={[7, 2, 0]}>
                <boxGeometry args={[2, 0.1, 1]} />
                <meshStandardMaterial color="#111111" roughness={0.9} />
            </mesh>
        </group>
    );
}
