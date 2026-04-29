import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const ParticleSwarm = () => {
  const meshRef = useRef();
  const count = 20000;
  const speedMult = 1;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; // Alias for user code compatibility
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, []);

  // Material & Geom
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  const PARAMS = useMemo(() => ({"scale":150,"orbit":1.2,"pull":6.5,"curl":3.8,"separation":48,"thickness":12}), []);
  const addControl = (id, l, min, max, val) => {
      return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };
  const setInfo = () => {};
  const annotate = () => {};

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;
    const THREE_LIB = THREE;

    if(material.uniforms && material.uniforms.uTime) {
         material.uniforms.uTime.value = time;
    }

    for (let i = 0; i < count; i++) {
        // USER CODE START
        // --- Binary Singularity Control Parameters ---
        const scale = addControl("scale", "System Radius", 40, 260, 150.0);
        const orbitSpeed = addControl("orbit", "Orbit Velocity", 0, 5, 1.2);
        const pull = addControl("pull", "Gravity Intensity", 0, 10, 6.5);
        const curl = addControl("curl", "Plasma Turbulence", 0, 8, 3.8);
        const separation = addControl("separation", "BH Distance", 10, 100, 48.0);
        const thickness = addControl("thickness", "Disk Thickness", 0, 50, 12.0);
        
        const t = time * orbitSpeed;
        const fi = i / (count > 0 ? count : 1);
        
        // 1. Define Binary Orbiting Centers (Dual Singularities)
        // They rotate around the barycenter (0,0,0)
        const bh1X = Math.cos(t) * separation;
        const bh1Y = Math.sin(t) * separation;
        
        const bh2X = -Math.cos(t) * separation;
        const bh2Y = -Math.sin(t) * separation;
        
        // 2. Initial Particle Distribution (Protoplanetary Disk Base)
        const ga = 2.3999632297; // Golden Angle
        const a = i * ga;
        const r0 = Math.pow(fi, 0.5) * scale;
        const phi0 = Math.acos(1.0 - 2.0 * fi);
        
        // Initial Position
        let px = r0 * Math.sin(phi0) * Math.cos(a);
        let py = r0 * Math.sin(phi0) * Math.sin(a);
        let pz = (Math.sin(i * 0.5) * thickness * (1.0 - fi)); 
        
        // 3. Dual Gravitational Field Calculation
        // Distance to Black Hole 1
        const dx1 = px - bh1X;
        const dy1 = py - bh1Y;
        const d1 = Math.sqrt(dx1*dx1 + dy1*dy1 + pz*pz) + 1.0;
        
        // Distance to Black Hole 2
        const dx2 = px - bh2X;
        const dy2 = py - bh2Y;
        const d2 = Math.sqrt(dx2*dx2 + dy2*dy2 + pz*pz) + 1.0;
        
        // Newtonian-inspired Gravitational Pull
        const force1 = pull * 60.0 / (d1 * d1 + 2.0);
        const force2 = pull * 60.0 / (d2 * d2 + 2.0);
        
        // Apply combined vectors to particles
        px -= (dx1 / d1) * force1 + (dx2 / d2) * force2;
        py -= (dy1 / d1) * force1 + (dy2 / d2) * force2;
        pz -= (pz / d1) * force1 + (pz / d2) * force2;
        
        // 4. Fluid Dynamics (Curl Noise Simulation)
        // Adds the "wispy" gaseous texture to the accretion disk
        const s1 = Math.sin(px * 0.03 + t);
        const s2 = Math.sin(py * 0.03 - t);
        px += Math.cos(s2) * curl;
        py += Math.sin(s1) * curl;
        
        // 5. Final Target Assignment
        target.set(px, py, pz);
        
        // --- Shading & Energy Logic ---
        
        // Find the closest singularity to determine local energy
        const minDist = Math.min(d1, d2);
        const energy = 1.0 / (minDist * 0.06 + 1.0);
        
        // Event Horizon Logic: Darkness at the core of both singularities
        const horizon = Math.max(0, Math.min(1, (minDist - 6.0) / (20.0 - 6.0)));
        
        // Multi-Spectrum Palette
        // Core: White/Cyan | Mid: Electric Blue | Outer: Deep Purple
        let hue = (0.62 - energy * 0.35 + 1.0) % 1.0;
        let sat = 0.5 + 0.5 * energy;
        let light = energy * 1.5 * horizon;
        
        color.setHSL(hue, sat, Math.min(light, 1.0));
        
        if (i === 0) {
            setInfo("Binary Singularity System", "A simulation of two orbiting black holes tearing through a common accretion disk. Particles are dynamically re-routed based on dual gravitational vectors.");
        }
        
        // USER CODE END

        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, pColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

export default function ParticleBackground() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
        <fog attach="fog" args={['#000000', 0.01]} />
        <ParticleSwarm />
        <OrbitControls autoRotate={true} enableZoom={false} enablePan={false} />
        <Effects disableGamma>
            <unrealBloomPass threshold={0} strength={1.8} radius={0.4} />
        </Effects>
      </Canvas>
    </div>
  );
}
