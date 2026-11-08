import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, Float } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const SCREENS = [
  { top: "ELECTRIFY SCORE", big: "87", unit: "/100", sub: "SPEED DEMON", color: "#ff8a2a" },
  { top: "PACK OVERVIEW", big: "402.1", unit: "V", sub: "SOC 78%", color: "#4fe3d2" },
  { top: "BATTERY HEALTH", big: "92", unit: "%", sub: "DEGRADATION 8%", color: "#4fe3d2" },
  { top: "12V SYSTEM", big: "13.8", unit: "V", sub: "HEALTHY", color: "#4fe3d2" },
  { top: "RANGE", big: "241", unit: "mi", sub: "RATED 272", color: "#ff8a2a" },
];

function drawScreen(ctx: CanvasRenderingContext2D, i: number, t: number) {
  const s = SCREENS[i]!;
  const W = 512;
  ctx.fillStyle = "#05080a";
  ctx.fillRect(0, 0, W, W);
  // ring gauge
  const p = (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.25 + 0.65;
  ctx.lineWidth = 18;
  ctx.strokeStyle = "#13201f";
  ctx.beginPath(); ctx.arc(256, 256, 214, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
  ctx.strokeStyle = s.color;
  ctx.shadowColor = s.color; ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.arc(256, 256, 214, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * p)); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.textAlign = "center";
  ctx.fillStyle = "#8aa3a0";
  ctx.font = "600 30px monospace";
  ctx.fillText(s.top, 256, 170);
  ctx.fillStyle = s.color;
  ctx.shadowColor = s.color; ctx.shadowBlur = 30;
  ctx.font = "800 128px monospace";
  ctx.fillText(s.big, 256, 300);
  ctx.shadowBlur = 0;
  ctx.font = "600 36px monospace";
  ctx.fillText(s.unit, 256, 345);
  ctx.fillStyle = "#e8f2f0";
  ctx.font = "700 28px monospace";
  ctx.fillText(s.sub, 256, 405);
}

function Dial({ progress, scrolled }: { progress: React.MutableRefObject<number>; scrolled: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const { canvas, tex } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas, tex };
  }, []);
  const ctx = useMemo(() => canvas.getContext("2d")!, [canvas]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const idx = Math.floor(t / 2.6) % SCREENS.length;
    drawScreen(ctx, idx, t);
    tex.needsUpdate = true;
    const g = group.current;
    if (!g) return;
    const p = progress.current;
    const dt = Math.min(delta, 0.05);
    const k = 1 - Math.exp(-4 * dt);
    const targetY = -0.5 + p * Math.PI * 2.2 + state.pointer.x * 0.25;
    const targetRotX = 0.35 - p * 0.6 - state.pointer.y * 0.2;
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetRotX - g.rotation.x) * k;
    // Phones: the view is narrow, so center the dial above the headline and keep it smaller.
    const { width, height } = state.viewport;
    const mobile = width < height * 0.8;
    const swing = mobile ? width * 0.22 : 1.6;
    const targetX = p < 0.15 ? (mobile ? 0 : 1.9) : Math.sin(p * Math.PI * 2) * swing;
    // On phones the dial rides up with the hero as you scroll, so it never sits on the headline.
    const targetPosY = mobile && p < 0.15 ? height * (0.22 + scrolled.current) : 0;
    const targetScale = mobile ? Math.min(0.72, width * (p < 0.15 ? 0.22 : 0.15)) : 0.72;
    g.position.x += (targetX - g.position.x) * k;
    g.position.y += (targetPosY - g.position.y) * k;
    g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * k);
  });

  return (
    <group ref={group} rotation={[0.35, -0.5, 0]} scale={0.72}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* outer grey shell */}
        <mesh castShadow>
          <cylinderGeometry args={[1.62, 1.68, 0.7, 96]} />
          <meshStandardMaterial color="#5d6166" roughness={0.55} metalness={0.3} />
        </mesh>
        {/* orange bezel */}
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.32, 0.14, 32, 128]} />
          <meshPhysicalMaterial color="#ff7a1a" roughness={0.35} clearcoat={1} clearcoatRoughness={0.2} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.2, 96]} />
          <meshPhysicalMaterial color="#ff7a1a" roughness={0.4} clearcoat={0.8} />
        </mesh>
        {/* glass screen */}
        <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.14, 96]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.16, 96]} />
          <meshPhysicalMaterial transparent opacity={0.18} roughness={0} metalness={0} clearcoat={1} color="#ffffff" />
        </mesh>
        {/* connector block */}
        <mesh position={[0, -0.6, -0.9]} castShadow>
          <boxGeometry args={[1.1, 0.6, 0.9]} />
          <meshStandardMaterial color="#111316" roughness={0.6} />
        </mesh>
        {[-0.36, -0.12, 0.12, 0.36].map((x) => (
          <mesh key={x} position={[x, -0.6, -1.36]}>
            <boxGeometry args={[0.14, 0.18, 0.04]} />
            <meshStandardMaterial color="#c9a14a" metalness={1} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* braided cable */}
      <mesh>
        <tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.6, -1.4), new THREE.Vector3(0.4, -1.4, -2.4), new THREE.Vector3(1.6, -2.4, -3.2), new THREE.Vector3(3, -3.4, -3.6)]), 64, 0.07, 12]} />
        <meshStandardMaterial color="#e03a2a" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function DialScene() {
  const progress = useRef(0);
  const scrolled = useRef(0); // scroll distance in viewport heights
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
      scrolled.current = window.scrollY / window.innerHeight;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div ref={wrap} className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7], fov: 38 }}
        gl={{ antialias: true }}
        onCreated={() => wrap.current?.setAttribute("data-scene-ready", "true")}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 5]} intensity={2.2} />
        <pointLight position={[-4, -1, 3]} intensity={30} color="#4fe3d2" />
        <pointLight position={[4, -2, 2]} intensity={20} color="#ff7a1a" />
        <Environment resolution={256}>
          <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
          <Lightformer intensity={1.2} color="#8ff" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
          <Lightformer intensity={1.2} color="#fa6" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[20, 1, 1]} />
        </Environment>
        <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
          <Dial progress={progress} scrolled={scrolled} />
        </Float>
        <ContactShadows position={[0, -2.4, 0]} opacity={0.5} scale={12} blur={2.6} far={4} />
      </Canvas>
    </div>
  );
}
