/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Custom vertex/fragment shader mapping for liquid chrome mirror waves
const LiquidVertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // Sino-wave complex 3D deformation pattern representing fluid mercury waves
  float calculateDisplacement(vec3 pos, float time) {
    // Normalizing portal progress stretch: ramps up wave height as scroll progress speeds up
    float stretchFactor = max(0.0, (uScrollProgress - 0.2) / 0.35);
    float amplitude = 0.12 + (stretchFactor * 0.42); 
    float frequency = 1.3 + (stretchFactor * 4.2);
    
    // Low frequency organic motion
    float waveValue = sin(pos.x * frequency + time * 1.8) * 
                      cos(pos.y * frequency + time * 1.4) * 
                      sin(pos.z * frequency + time * 2.2);
                  
    // High frequency micro-vibrations representing surface tension breakdown
    waveValue += 0.35 * sin(pos.y * (frequency * 2.2) - time * 2.5) * 
                       cos(pos.x * (frequency * 2.5) + time * 3.0);
                       
    return waveValue * amplitude;
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    float displacement = calculateDisplacement(position, uTime);
    vec3 displacedPosition = position + normal * displacement;
    
    vec4 modelViewPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    vViewPosition = -modelViewPosition.xyz;
    
    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

const LiquidFragmentShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uInverted; // 0.0 before, 1.0 after portal breach
  uniform vec3 uBaseColor; // Glow purple color pre-portal
  uniform vec3 uInvertColor; // Deep slate ink post-portal

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Fresnel factor for sleek reflection edges
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.8);
    
    // Specular highlight representing dark sky mirror reflex
    float specular = max(dot(reflect(-viewDir, normal), vec3(0.0, 1.0, 0.2)), 0.0);
    specular = pow(specular, 24.0);
    
    // Dynamic chrome wave color bands
    float pattern = sin(vWorldPosition.y * 2.5 + uTime * 0.8) * cos(vWorldPosition.x * 2.0 - uTime * 0.6);
    pattern = (pattern + 1.0) * 0.5;
    
    // Phase 1 Chrome Mirror: glowing neon purple reflections running on black
    vec3 reflectionPre = mix(vec3(0.01, 0.005, 0.03), uBaseColor, pattern * 0.6 + fresnel * 0.85);
    reflectionPre += vec3(1.0, 0.92, 1.0) * specular * 0.8;
    
    // Phase 3 Inverted Crystal/Ink Mirror: high contrast platinum silver reflecting dark ink lines
    vec3 reflectionPost = mix(vec3(0.96, 0.96, 0.97), uInvertColor, (1.0 - pattern) * 0.45 + fresnel * 0.35);
    reflectionPost += vec3(0.18, 0.18, 0.22) * specular;
    
    // Intercept transition mixing
    vec3 finalColor = mix(reflectionPre, reflectionPost, uInverted);
    
    // Base glow pre-portal
    float glow = 1.0 - max(dot(normal, viewDir), 0.0);
    glow = pow(glow, 4.0) * (1.0 - uInverted) * 0.45;
    finalColor += uBaseColor * glow;
    
    // Add glowing perimeter rings post-portal
    float peripheralRing = pow(1.0 - max(dot(normal, viewDir), 0.0), 6.0) * uInverted * 0.25;
    finalColor = mix(finalColor, uBaseColor, peripheralRing);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface BlobProps {
  scrollProgress: number;
  isInverted: boolean;
}

const LiquidBlobMesh: React.FC<BlobProps> = ({ scrollProgress, isInverted }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Memoize custom ShaderMaterial uniforms to prevent re-instantiations
  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0.0 },
      uScrollProgress: { value: 0.0 },
      uInverted: { value: 0.0 },
      uBaseColor: { value: new THREE.Color("#A855F7") }, // Vibrant Neon Purple
      uInvertColor: { value: new THREE.Color("#0A0A0C") }, // Deep Ink Black
    };
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    // Update basic uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed;
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
      
      // Interpolate inversion state smoothly inside shader
      const targetInversion = isInverted ? 1.0 : 0.0;
      materialRef.current.uniforms.uInverted.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uInverted.value,
        targetInversion,
        0.15
      );
    }

    if (meshRef.current) {
      // Idle rotations
      meshRef.current.rotation.y = elapsed * 0.15;
      meshRef.current.rotation.x = elapsed * 0.08;

      // Calculate exponential scale factor
      // 1. Pre-Breach Phase (0.00 to 0.55): Blob size grows slowly, then shoots exponentially to fill screen.
      // 2. Post-Breach Showcase (0.56 to 1.00): Recedes and anchors dynamically to support the typography grid.
      let targetScale = 1.0;
      let targetYOffset = 0.0;

      if (scrollProgress <= 0.55) {
        const breachProgress = Math.max(0, (scrollProgress - 0.2) / 0.35); // normalize 0.20-0.55
        const expScale = Math.pow(breachProgress, 4.5) * 44.0; // Exponential speed-up
        targetScale = 1.0 + expScale;
      } else {
        // Post portal Showroom background: float into background gracefully
        const exitProgress = Math.min(1.0, (scrollProgress - 0.55) / 0.45); // normalize 0.55-1.0
        // Scale settles down to be a beautiful ambient moving graphic in the middle right
        targetScale = THREE.MathUtils.lerp(45.0, 1.25, Math.pow(exitProgress, 0.5));
        
        // Push the organic background shape slightly to the right to frame portfolio text
        targetYOffset = THREE.MathUtils.lerp(0.0, 0.4, exitProgress);
      }

      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.12)
      );

      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetYOffset,
        0.08
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* Dynamic 128x128 segment geometry creates highly responsive sub-vertex waves */}
      <sphereGeometry args={[1.65, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={LiquidVertexShader}
        fragmentShader={LiquidFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={true}
        depthTest={true}
      />
    </mesh>
  );
};

interface CanvasProps {
  scrollProgress: number;
  isInverted: boolean;
}

export const LiquidBlobCanvas: React.FC<CanvasProps> = ({ scrollProgress, isInverted }) => {
  return (
    <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2.0} />
        <directionalLight position={[-5, -5, -2]} intensity={0.5} />
        <LiquidBlobMesh scrollProgress={scrollProgress} isInverted={isInverted} />
      </Canvas>
    </div>
  );
};
