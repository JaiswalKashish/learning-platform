"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useGLTF, useProgress, Html, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ModelConfig } from "@/lib/model-config";

interface GLTFModelProps {
  config: ModelConfig;
  showLabels?: boolean;
  isExploded?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function ModelLoader() {
  const { progress, active } = useProgress();
  
  if (!active) return null;
  
  return (
    <Html center>
      <div className="glass px-6 py-4 rounded-2xl text-center min-w-[200px]">
        <div className="text-sm text-white mb-2">Loading Model</div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-edu-purple to-edu-cyan h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-white/70">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
}

export function GLTFModel({ 
  config, 
  showLabels = true, 
  isExploded = false, 
  onLoad, 
  onError 
}: GLTFModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validPath = useMemo(() => {
    if (!config?.path) return null;
    if (!config.path.startsWith('/')) return null;
    if (!config.path.endsWith('.glb') && !config.path.endsWith('.gltf')) return null;
    return config.path;
  }, [config?.path]);

  const handleLoadError = useCallback((error: Error) => {
    console.warn(`Model load failed for ${config?.id || 'unknown'}, using fallback:`, error.message);
    setLoadFailed(true);
    setIsLoading(false);
    onError?.(error);
  }, [config?.id, onError]);

  if (!config || !validPath || loadFailed || config.source === 'placeholder') {
    return (
      <ProceduralFallbackModel 
        config={config} 
        showLabels={showLabels} 
        isExploded={isExploded} 
      />
    );
  }

  return (
    <GLTFModelInner
      config={config}
      validPath={validPath}
      showLabels={showLabels}
      isExploded={isExploded}
      onLoad={onLoad}
      onError={handleLoadError}
      setLoadFailed={setLoadFailed}
      setIsLoading={setIsLoading}
      isLoading={isLoading}
    />
  );
}

function GLTFModelInner({
  config,
  validPath,
  showLabels,
  isExploded,
  onLoad,
  onError,
  setLoadFailed,
  setIsLoading,
  isLoading,
}: {
  config: ModelConfig;
  validPath: string;
  showLabels: boolean;
  isExploded: boolean;
  onLoad?: () => void;
  onError: (error: Error) => void;
  setLoadFailed: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  isLoading: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  let gltf: ReturnType<typeof useGLTF> | null = null;
  
  try {
    gltf = useGLTF(validPath, true);
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Failed to load GLTF model");
    onError(err);
    return (
      <ProceduralFallbackModel 
        config={config} 
        showLabels={showLabels} 
        isExploded={isExploded} 
      />
    );
  }

  const { processedScene, center } = useMemo(() => {
    if (!gltf?.scene) {
      return { processedScene: null, center: new THREE.Vector3() };
    }
    
    try {
      const clonedScene = gltf.scene.clone(true);
      
      const box = new THREE.Box3().setFromObject(clonedScene);
      const boxCenter = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim === 0) {
        throw new Error("Model has zero dimensions");
      }
      
      const targetSize = 3;
      const autoScale = targetSize / maxDim;
      const finalScale = (config.scale || 1) * autoScale;
      
      clonedScene.scale.setScalar(finalScale);
      clonedScene.position.sub(boxCenter.clone().multiplyScalar(finalScale));
      
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      return { processedScene: clonedScene, center: boxCenter };
    } catch (error) {
      console.error("Error processing GLTF scene:", error);
      return { processedScene: null, center: new THREE.Vector3() };
    }
  }, [gltf?.scene, config.scale]);

  useEffect(() => {
    if (processedScene) {
      setIsLoading(false);
      onLoad?.();
    } else if (gltf && !processedScene) {
      setLoadFailed(true);
    }
  }, [processedScene, gltf, onLoad, setIsLoading, setLoadFailed]);

  useEffect(() => {
    if (!groupRef.current || !processedScene) return;
    
    const explodeOffset = isExploded ? 0.5 : 0;
    
    processedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!child.userData.originalPosition) {
          child.userData.originalPosition = child.position.clone();
        }
        
        const originalPosition = child.userData.originalPosition as THREE.Vector3;
        
        if (isExploded) {
          const direction = originalPosition.clone();
          if (direction.length() > 0.01) {
            direction.normalize();
            child.position.copy(originalPosition.clone().add(direction.multiplyScalar(explodeOffset)));
          }
        } else {
          child.position.copy(originalPosition);
        }
      }
    });
  }, [isExploded, processedScene]);

  if (!processedScene) {
    return (
      <ProceduralFallbackModel 
        config={config} 
        showLabels={showLabels} 
        isExploded={isExploded} 
      />
    );
  }

  const explodeOffset = isExploded ? 1.5 : 1;

  return (
    <group ref={groupRef}>
      <primitive object={processedScene} dispose={null} />
      
      {showLabels && config.hotspots?.map((hotspot) => {
        const explodeFactor = isExploded ? 1.5 : 1;
        const position: [number, number, number] = [
          hotspot.position[0] * explodeFactor,
          hotspot.position[1] * explodeFactor,
          hotspot.position[2] * explodeFactor
        ];
        
        // Calculate dynamic label position to avoid overlap
        const dir = new THREE.Vector3(...hotspot.position).normalize();
        const labelOffset: [number, number, number] = [
          dir.x * 0.4,
          dir.y * 0.4 + 0.2,
          dir.z * 0.4
        ];
        
        return (
          <Float key={hotspot.name} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
            <group position={position}>
              <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial 
                  color="#00cec9"
                  emissive="#00cec9"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.1, 0.12, 32]} />
                <meshBasicMaterial color="#00cec9" transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
              
              {/* Connecting Line */}
              <mesh position={[labelOffset[0]/2, labelOffset[1]/2, labelOffset[2]/2]} 
                    rotation={[Math.atan2(labelOffset[1], Math.sqrt(labelOffset[0]**2 + labelOffset[2]**2)) + Math.PI/2, 0, Math.atan2(labelOffset[0], labelOffset[2])]}>
                <cylinderGeometry args={[0.005, 0.005, new THREE.Vector3(...labelOffset).length(), 8]} />
                <meshBasicMaterial color="#00cec9" transparent opacity={0.3} />
              </mesh>

              <Html 
                distanceFactor={10} 
                position={labelOffset}
                occlude
                center
                style={{
                  transition: 'opacity 0.5s',
                  opacity: 1,
                }}
              >
                <div className="glass px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none border border-edu-cyan/30 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-edu-cyan animate-pulse" />
                  <span className="font-medium text-white">{hotspot.name}</span>
                </div>
              </Html>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

interface ProceduralFallbackModelProps {
  config?: ModelConfig;
  showLabels?: boolean;
  isExploded?: boolean;
}

function ProceduralFallbackModel({ 
  config, 
  showLabels = true, 
  isExploded = false 
}: ProceduralFallbackModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const explodeOffset = isExploded ? 1.5 : 1;
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });
  
  const { color, secondaryColor, modelType } = useMemo(() => {
    const categoryColors: Record<string, { primary: string; secondary: string }> = {
      physics: { primary: "#6c5ce7", secondary: "#a29bfe" },
      chemistry: { primary: "#00cec9", secondary: "#81ecec" }, 
      biology: { primary: "#e84393", secondary: "#fd79a8" },
      space: { primary: "#00b894", secondary: "#55efc4" },
      engineering: { primary: "#fdcb6e", secondary: "#ffeaa7" },
    };
    
    const getCategory = () => {
      if (!config?.path) return "physics";
      if (config.path.includes("physics")) return "physics";
      if (config.path.includes("chemistry")) return "chemistry";
      if (config.path.includes("biology")) return "biology";
      if (config.path.includes("space")) return "space";
      if (config.path.includes("engineering")) return "engineering";
      return "physics";
    };
    
    const category = getCategory();
    const colors = categoryColors[category] || categoryColors.physics;
    
    return { 
      color: colors.primary, 
      secondaryColor: colors.secondary,
      modelType: category 
    };
  }, [config?.path]);

  const renderCategoryModel = () => {
    switch (modelType) {
      case "chemistry":
        return (
          <>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.6, 32, 32]} />
              <meshStandardMaterial color="#e74c3c" metalness={0.3} roughness={0.4} />
            </mesh>
            <mesh position={[-0.8 * explodeOffset, 0.6 * explodeOffset, 0]}>
              <sphereGeometry args={[0.35, 32, 32]} />
              <meshStandardMaterial color="#ecf0f1" metalness={0.2} roughness={0.5} />
            </mesh>
            <mesh position={[0.8 * explodeOffset, 0.6 * explodeOffset, 0]}>
              <sphereGeometry args={[0.35, 32, 32]} />
              <meshStandardMaterial color="#ecf0f1" metalness={0.2} roughness={0.5} />
            </mesh>
            <mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, 0.5]}>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
              <meshStandardMaterial color="#dfe6e9" />
            </mesh>
            <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, -0.5]}>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
              <meshStandardMaterial color="#dfe6e9" />
            </mesh>
          </>
        );
      
      case "biology":
        return (
          <>
            <mesh>
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshStandardMaterial color="#e84393" transparent opacity={0.3} />
            </mesh>
            <mesh position={[0.2 * explodeOffset, 0.1 * explodeOffset, 0]}>
              <sphereGeometry args={[0.4, 32, 32]} />
              <meshStandardMaterial color="#9b59b6" roughness={0.4} />
            </mesh>
            {[[-0.5, 0.3, 0.2], [-0.3, -0.4, -0.1], [0.4, -0.2, 0.3]].map((pos, i) => (
              <mesh key={i} position={[pos[0] * explodeOffset, pos[1] * explodeOffset, pos[2] * explodeOffset]}>
                <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
                <meshStandardMaterial color="#e74c3c" />
              </mesh>
            ))}
          </>
        );
      
      case "space":
        return (
          <>
            <mesh>
              <sphereGeometry args={[0.6, 64, 64]} />
              <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.8} />
            </mesh>
            <pointLight position={[0, 0, 0]} intensity={1} color="#f1c40f" distance={5} />
            {[
              { distance: 1.2, size: 0.12, color: "#3498db" },
              { distance: 1.8, size: 0.1, color: "#e74c3c" },
              { distance: 2.4, size: 0.25, color: "#d35400" },
            ].map((planet, i) => (
              <group key={i}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[planet.distance * explodeOffset, 0.01, 16, 100]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
                </mesh>
                <mesh position={[planet.distance * explodeOffset, 0, 0]}>
                  <sphereGeometry args={[planet.size, 32, 32]} />
                  <meshStandardMaterial color={planet.color} />
                </mesh>
              </group>
            ))}
          </>
        );
      
      case "engineering":
        return (
          <>
            <mesh>
              <boxGeometry args={[2, 0.2, 1]} />
              <meshStandardMaterial color="#636e72" metalness={0.6} />
            </mesh>
            {[-1, 0, 1].map((x, i) => (
              <group key={i}>
                <mesh position={[x * explodeOffset, 0.5 * explodeOffset, 0.3]}>
                  <boxGeometry args={[0.1, 1, 0.1]} />
                  <meshStandardMaterial color="#dfe6e9" metalness={0.5} />
                </mesh>
                <mesh position={[x * explodeOffset, 0.5 * explodeOffset, -0.3]}>
                  <boxGeometry args={[0.1, 1, 0.1]} />
                  <meshStandardMaterial color="#dfe6e9" metalness={0.5} />
                </mesh>
              </group>
            ))}
          </>
        );
      
      default:
        return (
          <>
            <mesh>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[1.5 * explodeOffset, 0.03, 16, 100]} />
              <meshStandardMaterial color={secondaryColor} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.3 * explodeOffset, 0.02, 16, 100]} />
              <meshStandardMaterial color={secondaryColor} transparent opacity={0.5} />
            </mesh>
          </>
        );
    }
  };

  return (
    <group ref={groupRef}>
      {renderCategoryModel()}
      
      {showLabels && config?.hotspots?.map((hotspot) => {
        const explodeFactor = isExploded ? 1.5 : 1;
        const position: [number, number, number] = [
          hotspot.position[0] * explodeFactor,
          hotspot.position[1] * explodeFactor,
          hotspot.position[2] * explodeFactor
        ];
        
        // Calculate dynamic label position to avoid overlap
        const dir = new THREE.Vector3(...hotspot.position).normalize();
        const labelOffset: [number, number, number] = [
          dir.x * 0.4,
          dir.y * 0.4 + 0.2,
          dir.z * 0.4
        ];
        
        return (
          <Float key={hotspot.name} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
            <group position={position}>
              <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial 
                  color="#00cec9"
                  emissive="#00cec9"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.1, 0.12, 32]} />
                <meshBasicMaterial color="#00cec9" transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>

              {/* Connecting Line */}
              <mesh position={[labelOffset[0]/2, labelOffset[1]/2, labelOffset[2]/2]} 
                    rotation={[Math.atan2(labelOffset[1], Math.sqrt(labelOffset[0]**2 + labelOffset[2]**2)) + Math.PI/2, 0, Math.atan2(labelOffset[0], labelOffset[2])]}>
                <cylinderGeometry args={[0.005, 0.005, new THREE.Vector3(...labelOffset).length(), 8]} />
                <meshBasicMaterial color="#00cec9" transparent opacity={0.3} />
              </mesh>

              <Html 
                distanceFactor={10} 
                position={labelOffset}
                occlude
                center
                style={{
                  transition: 'opacity 0.5s',
                  opacity: 1,
                }}
              >
                <div className="glass px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none border border-edu-cyan/30 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-edu-cyan animate-pulse" />
                  <span className="font-medium text-white">{hotspot.name}</span>
                </div>
              </Html>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

export function useModelProgress() {
  return useProgress();
}

export { ProceduralFallbackModel };
export default GLTFModel;
