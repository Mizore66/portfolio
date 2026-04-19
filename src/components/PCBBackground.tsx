"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function PCBTrace({
  points,
  color,
  speed,
}: {
  points: THREE.Vector3[];
  color: string;
  speed: number;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const glowRef = useRef<THREE.Line>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  const geometry = useMemo(() => {
    const pts = curve.getPoints(80);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [curve]);

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * speed) % 1;
    if (pulseRef.current) {
      const pos = curve.getPoint(progressRef.current);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* Base trace */}
      {/* @ts-expect-error R3F line vs SVG Line */}
      <line ref={lineRef as any} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.3} linewidth={1} />
      </line>
      {/* Glow trace */}
      {/* @ts-expect-error R3F line vs SVG Line */}
      <line ref={glowRef as any} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.1} linewidth={3} />
      </line>
      {/* Pulse dot */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function PCBNode({
  position,
  label,
  color,
  size = 1,
}: {
  position: [number, number, number];
  label: string;
  color: string;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -state.clock.elapsedTime * 0.15;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.22 * size, 0.28 * size, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner node */}
      <mesh ref={meshRef}>
        <circleGeometry args={[0.15 * size, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.05 * size, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function GridLines() {
  const lines = useMemo(() => {
    const group: React.ReactNode[] = [];
    const gridSize = 10;
    const step = 0.8;

    for (let i = -gridSize; i <= gridSize; i++) {
      const x = i * step;
      // Vertical lines
      const vGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, -gridSize * step, 0),
        new THREE.Vector3(x, gridSize * step, 0),
      ]);
      group.push(
        // @ts-expect-error R3F line vs SVG Line type clash
        <line key={`v${i}`} geometry={vGeom}>
          <lineBasicMaterial color="#00ffaa" transparent opacity={0.04} />
        </line>
      );
      // Horizontal lines
      const hGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-gridSize * step, x, 0),
        new THREE.Vector3(gridSize * step, x, 0),
      ]);
      group.push(
        // @ts-expect-error R3F line vs SVG Line type clash
        <line key={`h${i}`} geometry={hGeom}>
          <lineBasicMaterial color="#00ffaa" transparent opacity={0.04} />
        </line>
      );
    }
    return group;
  }, []);

  return <group position={[0, 0, -0.1]}>{lines}</group>;
}

function PCBScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // Nodes clustered for a cooler look on the right side
  const nodes: { pos: [number, number, number]; label: string; color: string }[] = [
    { pos: [-3, 2, 0], label: "About", color: "#00ffaa" },
    { pos: [3, 2.2, 0], label: "Projects", color: "#00ccff" },
    { pos: [-3.5, -2, 0], label: "Skills", color: "#aa55ff" },
    { pos: [3.5, -2.2, 0], label: "Contact", color: "#ff5599" },
    { pos: [-5, 0.5, 0], label: "ML", color: "#ffaa00" },
    { pos: [5, -0.5, 0], label: "Infra", color: "#44ddff" },
    { pos: [0, 3, 0], label: "Cloud", color: "#00ccff" },
    { pos: [0, -3, 0], label: "Data", color: "#aa55ff" },
  ];

  const center = new THREE.Vector3(0, 0, 0);

  const traces = nodes.map((node, i) => {
    const target = new THREE.Vector3(...node.pos);
    const mid1 = new THREE.Vector3(
      center.x + (target.x - center.x) * 0.3,
      center.y,
      0
    );
    const mid2 = new THREE.Vector3(
      target.x,
      center.y + (target.y - center.y) * 0.5,
      0
    );
    return {
      points: [center, mid1, mid2, target],
      color: node.color,
      speed: 0.3 + i * 0.08,
    };
  });

  const crossTraces = [
    {
      points: [
        new THREE.Vector3(...nodes[0].pos),
        new THREE.Vector3(-2, 0.8, 0),
        new THREE.Vector3(-2.8, -0.5, 0),
        new THREE.Vector3(...nodes[2].pos),
      ],
      color: "#00ffaa",
      speed: 0.2,
    },
    {
      points: [
        new THREE.Vector3(...nodes[1].pos),
        new THREE.Vector3(2.5, 0.8, 0),
        new THREE.Vector3(3, -0.5, 0),
        new THREE.Vector3(...nodes[3].pos),
      ],
      color: "#00ccff",
      speed: 0.25,
    },
    {
      points: [
        new THREE.Vector3(...nodes[4].pos),
        new THREE.Vector3(-4, 1.5, 0),
        new THREE.Vector3(-3.5, 2, 0),
        new THREE.Vector3(...nodes[0].pos),
      ],
      color: "#ffaa00",
      speed: 0.18,
    },
    {
      points: [
        new THREE.Vector3(...nodes[5].pos),
        new THREE.Vector3(4.5, -1.5, 0),
        new THREE.Vector3(4, -2, 0),
        new THREE.Vector3(...nodes[3].pos),
      ],
      color: "#44ddff",
      speed: 0.22,
    },
  ];

  return (
    <group ref={groupRef}>
      <GridLines />
      <PCBNode position={[0, 0, 0]} label="CPU" color="#00ffaa" size={1.2} />
      {nodes.map((node, i) => (
        <PCBNode key={i} position={node.pos} label={node.label} color={node.color} />
      ))}
      {traces.map((trace, i) => (
        <PCBTrace key={`main-${i}`} {...trace} />
      ))}
      {crossTraces.map((trace, i) => (
        <PCBTrace key={`cross-${i}`} {...trace} />
      ))}
    </group>
  );
}

export default function PCBBackground() {
  return (
    <div className="absolute inset-y-0 right-0 w-full lg:w-[60%] z-0 overflow-hidden pointer-events-none opacity-80 mt-16 scale-90 lg:scale-100 origin-right">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <PCBScene />
      </Canvas>
    </div>
  );
}
