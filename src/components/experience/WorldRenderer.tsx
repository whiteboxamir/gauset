'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { VoidWorld } from './worlds/VoidWorld';
import { FractureWorld } from './worlds/FractureWorld';
import { AssemblyWorld } from './worlds/AssemblyWorld';
import { StudioWorld } from './worlds/StudioWorld';
import { HorizonWorld } from './worlds/HorizonWorld';

// Maps scroll offset (0–1) to camera positions and world visibility
const WORLD_COUNT = 5;

// Camera keyframes: [x, y, z] at each world's midpoint
const CAMERA_POSITIONS = [
    new THREE.Vector3(0, 0, 20),       // Void: static, distant
    new THREE.Vector3(5, 0, 15),       // Fracture: lateral offset
    new THREE.Vector3(0, 0, 8),        // Assembly: push in close
    new THREE.Vector3(0, 3, 12),       // Studio: crane up
    new THREE.Vector3(0, 1, 16),       // Horizon: wide, slightly low
];

const CAMERA_LOOK_AT = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -2, 0),
];

export function WorldRenderer() {
    const scroll = useScroll();
    const cameraTarget = useRef(new THREE.Vector3());
    const lookTarget = useRef(new THREE.Vector3());

    // Compute world visibilities and local progress
    const worldState = useMemo(() => ({
        visibility: new Float32Array(WORLD_COUNT),
        progress: new Float32Array(WORLD_COUNT),
    }), []);

    useFrame((state, delta) => {
        const offset = scroll.offset; // 0–1

        // Calculate per-world visibility and local progress
        for (let i = 0; i < WORLD_COUNT; i++) {
            const worldStart = i / WORLD_COUNT;
            const worldEnd = (i + 1) / WORLD_COUNT;
            const worldMid = (worldStart + worldEnd) / 2;
            const worldHalf = (worldEnd - worldStart) / 2;

            // Visibility: 1 at midpoint, fades at edges with overlap
            const dist = Math.abs(offset - worldMid);
            const fadeWidth = worldHalf * 1.3; // slight overlap for crossfade
            worldState.visibility[i] = Math.max(0, 1 - dist / fadeWidth);

            // Local progress within this world (0–1)
            worldState.progress[i] = THREE.MathUtils.clamp(
                (offset - worldStart) / (worldEnd - worldStart),
                0, 1
            );
        }

        // Interpolate camera position based on scroll
        const exactWorld = offset * WORLD_COUNT;
        const worldIndex = Math.min(Math.floor(exactWorld), WORLD_COUNT - 1);
        const nextIndex = Math.min(worldIndex + 1, WORLD_COUNT - 1);
        const t = exactWorld - worldIndex;
        const eased = t * t * (3 - 2 * t); // smoothstep

        cameraTarget.current.lerpVectors(
            CAMERA_POSITIONS[worldIndex],
            CAMERA_POSITIONS[nextIndex],
            eased
        );

        lookTarget.current.lerpVectors(
            CAMERA_LOOK_AT[worldIndex],
            CAMERA_LOOK_AT[nextIndex],
            eased
        );

        // Smooth camera movement
        state.camera.position.lerp(cameraTarget.current, 1 - Math.exp(-3 * delta));
        const currentLook = new THREE.Vector3();
        currentLook.copy(lookTarget.current);
        state.camera.lookAt(currentLook);
    });

    return (
        <group>
            <VoidWorld
                visibility={worldState.visibility}
                progress={worldState.progress}
                index={0}
            />
            <FractureWorld
                visibility={worldState.visibility}
                progress={worldState.progress}
                index={1}
            />
            <AssemblyWorld
                visibility={worldState.visibility}
                progress={worldState.progress}
                index={2}
            />
            <StudioWorld
                visibility={worldState.visibility}
                progress={worldState.progress}
                index={3}
            />
            <HorizonWorld
                visibility={worldState.visibility}
                progress={worldState.progress}
                index={4}
            />
        </group>
    );
}
