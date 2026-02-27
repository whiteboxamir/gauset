'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorldProps {
    visibility: Float32Array;
    progress: Float32Array;
    index: number;
}

const SHARD_COUNT = 40;

// Generate shard data once
function generateShards() {
    const shards = [];
    for (let i = 0; i < SHARD_COUNT; i++) {
        const basePos = new THREE.Vector3(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20 - 5
        );
        const scale = 0.3 + Math.random() * 1.5;
        const rotation = new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        const speed = 0.2 + Math.random() * 0.5;
        const phase = Math.random() * Math.PI * 2;
        // Color temperature — some warm, some cold
        const temp = Math.random();
        const color = temp > 0.6
            ? new THREE.Color('#B8C4E0') // cool blue-white  
            : temp > 0.3
                ? new THREE.Color('#6B4C9A') // violet
                : new THREE.Color('#4A5568');  // cold gray

        shards.push({ basePos, scale, rotation, speed, phase, color });
    }
    return shards;
}

export function FractureWorld({ visibility, progress, index }: WorldProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const shards = useMemo(() => generateShards(), []);

    // Wireframe edges for some shards using separate wireframe meshes
    const edgesRef = useRef<THREE.InstancedMesh>(null);

    useFrame((state) => {
        const vis = visibility[index];
        if (!groupRef.current) return;

        if (vis <= 0) {
            groupRef.current.visible = false;
            return;
        }
        groupRef.current.visible = true;

        const time = state.clock.elapsedTime;
        const prog = progress[index]; // 0-1 within this world

        if (!meshRef.current) return;

        for (let i = 0; i < SHARD_COUNT; i++) {
            const shard = shards[i];

            // Float with sine offsets
            const floatY = Math.sin(time * shard.speed + shard.phase) * 0.5;
            const floatX = Math.cos(time * shard.speed * 0.7 + shard.phase) * 0.3;

            // Lateral drift driven by scroll progress
            const scrollDrift = prog * 3;

            dummy.position.set(
                shard.basePos.x + floatX - scrollDrift,
                shard.basePos.y + floatY,
                shard.basePos.z
            );

            dummy.rotation.set(
                shard.rotation.x + time * 0.05,
                shard.rotation.y + time * 0.03,
                shard.rotation.z
            );

            dummy.scale.setScalar(shard.scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Edges mirror positions
            if (edgesRef.current) {
                edgesRef.current.setMatrixAt(i, dummy.matrix);
            }
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (edgesRef.current) {
            edgesRef.current.instanceMatrix.needsUpdate = true;
        }

        // Fade materials
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = vis * 0.7;

        if (edgesRef.current) {
            const edgeMat = edgesRef.current.material as THREE.MeshBasicMaterial;
            edgeMat.opacity = vis * 0.3;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Cold, clinical point lights — scattered, conflicting hues */}
            <pointLight position={[-8, 5, -3]} intensity={0.5} color="#B8C4E0" distance={30} />
            <pointLight position={[6, -3, -5]} intensity={0.4} color="#6B4C9A" distance={25} />
            <pointLight position={[0, 8, -8]} intensity={0.3} color="#4A7FB5" distance={20} />
            <pointLight position={[-5, -6, 2]} intensity={0.3} color="#B8C4E0" distance={20} />
            <pointLight position={[10, 2, -10]} intensity={0.25} color="#8B5CF6" distance={25} />
            <pointLight position={[-3, 0, 5]} intensity={0.2} color="#06B6D4" distance={15} />

            {/* Frosted glass shards */}
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, SHARD_COUNT]}
                frustumCulled={false}
            >
                <boxGeometry args={[1, 1.6, 0.08]} />
                <meshStandardMaterial
                    color="#1A1A2E"
                    metalness={0.3}
                    roughness={0.2}
                    transparent
                    opacity={0.7}
                    envMapIntensity={0.5}
                />
            </instancedMesh>

            {/* Wireframe overlay on shards — suggests incomplete renders */}
            <instancedMesh
                ref={edgesRef}
                args={[undefined, undefined, SHARD_COUNT]}
                frustumCulled={false}
            >
                <boxGeometry args={[1.01, 1.61, 0.09]} />
                <meshBasicMaterial
                    color="#4A5568"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </instancedMesh>

            {/* Localized cold fog between fragments */}
            <mesh position={[0, 0, -8]}>
                <planeGeometry args={[60, 30]} />
                <meshBasicMaterial
                    color="#1A1A2E"
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}
