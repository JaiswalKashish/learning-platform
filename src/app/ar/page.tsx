"use client";

import { useState, useRef, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, Html, Float, useProgress, ContactShadows, Stars, Sparkles } from "@react-three/drei";
import { 
  Glasses, 
  Camera, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Tag, 
  Eye, 
  EyeOff,
  Atom,
  FlaskConical,
  Heart,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as THREE from "three";
import { 
  physicsModels, 
  chemistryModels, 
  biologyModels, 
  spaceModels,
  type ModelConfig 
} from "@/lib/model-config";

interface ModelPart {
  name: string;
  description: string;
  position: [number, number, number];
  color: string;
}

interface ARModel {
  id: string;
  title: string;
  subject: string;
  subjectIcon: React.ElementType;
  description: string;
  image: string;
  color: string;
  parts: ModelPart[];
  modelConfig?: ModelConfig;
}

const arModels: Record<string, ARModel[]> = {
  physics: [
    {
      id: "human-eye",
      title: "Human Eye & Lens",
      subject: "Physics",
      subjectIcon: Atom,
      description: "Visualize lens, retina, and light refraction in the human eye",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop",
      color: "#6c5ce7",
      modelConfig: physicsModels.find(m => m.id === "human-eye"),
      parts: [
        { name: "Cornea", description: "Transparent front layer that refracts light", position: [0, 0, 1.2], color: "#74b9ff" },
        { name: "Iris", description: "Colored part that controls light entry", position: [0, 0, 0.8], color: "#0984e3" },
        { name: "Pupil", description: "Opening that allows light to enter", position: [0, 0, 0.7], color: "#2d3436" },
        { name: "Lens", description: "Focuses light onto the retina", position: [0, 0, 0.3], color: "#dfe6e9" },
        { name: "Retina", description: "Light-sensitive layer with photoreceptors", position: [0, 0, -0.8], color: "#fdcb6e" },
        { name: "Optic Nerve", description: "Transmits visual information to brain", position: [0, -0.3, -1.2], color: "#e17055" },
      ]
    },
    {
      id: "simple-machines",
      title: "Simple Machines",
      subject: "Physics",
      subjectIcon: Atom,
      description: "Explore lever, pulley, and inclined plane mechanics",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
      color: "#6c5ce7",
      modelConfig: physicsModels.find(m => m.id === "simple-machines"),
      parts: [
        { name: "Lever Arm", description: "Rigid bar that rotates around fulcrum", position: [-1, 0, 0], color: "#74b9ff" },
        { name: "Fulcrum", description: "Pivot point of the lever", position: [0, -0.5, 0], color: "#fdcb6e" },
        { name: "Pulley Wheel", description: "Wheel with groove for rope", position: [1.5, 1, 0], color: "#a29bfe" },
        { name: "Inclined Plane", description: "Sloped surface reduces force needed", position: [0, -0.5, 1], color: "#00b894" },
      ]
    },
    {
      id: "electric-circuits",
      title: "Electric Circuits",
      subject: "Physics",
      subjectIcon: Atom,
      description: "Battery, wires, bulbs, and switches in 3D",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
      color: "#6c5ce7",
      modelConfig: physicsModels.find(m => m.id === "electric-circuits"),
      parts: [
        { name: "Battery", description: "Source of electrical energy", position: [-1.5, 0, 0], color: "#fdcb6e" },
        { name: "Switch", description: "Controls current flow", position: [0, 0.5, 0], color: "#74b9ff" },
        { name: "Light Bulb", description: "Converts electricity to light", position: [1.5, 0, 0], color: "#ffeaa7" },
        { name: "Wires", description: "Conducts electricity", position: [0, 0, 0], color: "#e17055" },
      ]
    },
    {
      id: "magnet-compass",
      title: "Magnet & Compass",
      subject: "Physics",
      subjectIcon: Atom,
      description: "Magnetic field lines visualized in 3D",
      image: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400&h=300&fit=crop",
      color: "#6c5ce7",
      modelConfig: physicsModels.find(m => m.id === "magnet-compass"),
      parts: [
        { name: "North Pole", description: "Magnetic north end", position: [0, 0, 1], color: "#e74c3c" },
        { name: "South Pole", description: "Magnetic south end", position: [0, 0, -1], color: "#3498db" },
        { name: "Field Lines", description: "Invisible lines of magnetic force", position: [0, 0.5, 0], color: "#9b59b6" },
        { name: "Compass Needle", description: "Aligns with magnetic field", position: [1.5, 0, 0], color: "#2ecc71" },
      ]
    },
  ],
  chemistry: [
    {
      id: "water-molecule",
      title: "Water Molecule (H₂O)",
      subject: "Chemistry",
      subjectIcon: FlaskConical,
      description: "Bond angles, rotation, and color-coded atoms",
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop",
      color: "#00cec9",
      modelConfig: chemistryModels.find(m => m.id === "water-molecule"),
      parts: [
        { name: "Oxygen Atom", description: "Central oxygen atom (red)", position: [0, 0, 0], color: "#e74c3c" },
        { name: "Hydrogen 1", description: "First hydrogen atom (white)", position: [-0.8, 0.6, 0], color: "#ecf0f1" },
        { name: "Hydrogen 2", description: "Second hydrogen atom (white)", position: [0.8, 0.6, 0], color: "#ecf0f1" },
        { name: "Covalent Bond", description: "Shared electron pairs", position: [0, 0.3, 0], color: "#3498db" },
      ]
    },
    {
      id: "carbon-compounds",
      title: "Carbon Compounds",
      subject: "Chemistry",
      subjectIcon: FlaskConical,
      description: "sp² vs sp³ hybridization, methane, ethane",
      image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop",
      color: "#00cec9",
      modelConfig: chemistryModels.find(m => m.id === "carbon-compounds"),
      parts: [
        { name: "Carbon (sp³)", description: "Tetrahedral geometry", position: [0, 0, 0], color: "#2d3436" },
        { name: "Hydrogen Atoms", description: "Four hydrogen atoms bonded", position: [0.5, 0.5, 0.5], color: "#ecf0f1" },
        { name: "C-H Bond", description: "Single covalent bond", position: [0.25, 0.25, 0.25], color: "#74b9ff" },
      ]
    },
    {
      id: "periodic-elements",
      title: "Periodic Table Elements",
      subject: "Chemistry",
      subjectIcon: FlaskConical,
      description: "Atomic structure 3D view",
      image: "https://images.unsplash.com/photo-1628863353691-0071c8c1874c?w=400&h=300&fit=crop",
      color: "#00cec9",
      modelConfig: chemistryModels.find(m => m.id === "periodic-elements"),
      parts: [
        { name: "Nucleus", description: "Contains protons and neutrons", position: [0, 0, 0], color: "#e74c3c" },
        { name: "Electron Shell 1", description: "First energy level", position: [0, 0, 0.8], color: "#3498db" },
        { name: "Electron Shell 2", description: "Second energy level", position: [0, 0, 1.2], color: "#9b59b6" },
        { name: "Electrons", description: "Negatively charged particles", position: [0.5, 0.5, 0.8], color: "#f1c40f" },
      ]
    },
    {
      id: "crystal-structures",
      title: "Crystal Structures",
      subject: "Chemistry",
      subjectIcon: FlaskConical,
      description: "NaCl, diamond, and graphite structures",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
      color: "#00cec9",
      modelConfig: chemistryModels.find(m => m.id === "crystal-structures"),
      parts: [
        { name: "Sodium Ion", description: "Na⁺ cation", position: [0, 0, 0], color: "#9b59b6" },
        { name: "Chloride Ion", description: "Cl⁻ anion", position: [1, 0, 0], color: "#2ecc71" },
        { name: "Ionic Bond", description: "Electrostatic attraction", position: [0.5, 0, 0], color: "#f1c40f" },
        { name: "Crystal Lattice", description: "Repeating 3D pattern", position: [0, 1, 0], color: "#3498db" },
      ]
    },
  ],
  biology: [
    {
      id: "human-heart",
      title: "Human Heart",
      subject: "Biology",
      subjectIcon: Heart,
      description: "Chambers, valves, and blood flow visualization",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      color: "#e84393",
      modelConfig: biologyModels.find(m => m.id === "human-heart"),
      parts: [
        { name: "Left Atrium", description: "Receives oxygenated blood from lungs", position: [-0.5, 0.5, 0], color: "#e74c3c" },
        { name: "Right Atrium", description: "Receives deoxygenated blood", position: [0.5, 0.5, 0], color: "#3498db" },
        { name: "Left Ventricle", description: "Pumps blood to body", position: [-0.5, -0.5, 0], color: "#c0392b" },
        { name: "Right Ventricle", description: "Pumps blood to lungs", position: [0.5, -0.5, 0], color: "#2980b9" },
        { name: "Aorta", description: "Main artery from heart", position: [0, 1, 0], color: "#e74c3c" },
        { name: "Valves", description: "Prevent backflow of blood", position: [0, 0, 0.3], color: "#f1c40f" },
      ]
    },
    {
      id: "lungs",
      title: "Lungs",
      subject: "Biology",
      subjectIcon: Heart,
      description: "Alveoli, bronchial tree, oxygen exchange",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop",
      color: "#e84393",
      modelConfig: biologyModels.find(m => m.id === "lungs"),
      parts: [
        { name: "Trachea", description: "Windpipe carrying air", position: [0, 1, 0], color: "#ecf0f1" },
        { name: "Bronchi", description: "Main airways to lungs", position: [0, 0.5, 0], color: "#bdc3c7" },
        { name: "Bronchioles", description: "Smaller airways", position: [-0.5, 0, 0], color: "#95a5a6" },
        { name: "Alveoli", description: "Air sacs for gas exchange", position: [0, -0.5, 0], color: "#e84393" },
        { name: "Capillaries", description: "Blood vessels around alveoli", position: [0.3, -0.5, 0.2], color: "#e74c3c" },
      ]
    },
    {
      id: "plant-cell",
      title: "Plant Cell & Animal Cell",
      subject: "Biology",
      subjectIcon: Heart,
      description: "Organelles in 3D comparison",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop",
      color: "#e84393",
      modelConfig: biologyModels.find(m => m.id === "plant-cell"),
      parts: [
        { name: "Cell Wall", description: "Rigid outer layer (plant only)", position: [0, 0, 1.2], color: "#27ae60" },
        { name: "Cell Membrane", description: "Controls what enters/exits", position: [0, 0, 1], color: "#f1c40f" },
        { name: "Nucleus", description: "Contains genetic material", position: [0, 0, 0], color: "#9b59b6" },
        { name: "Mitochondria", description: "Powerhouse of the cell", position: [0.5, 0.3, 0], color: "#e74c3c" },
        { name: "Chloroplast", description: "Photosynthesis (plant only)", position: [-0.5, 0.3, 0], color: "#2ecc71" },
        { name: "Vacuole", description: "Storage compartment", position: [0, -0.3, 0], color: "#3498db" },
      ]
    },
    {
      id: "digestive-system",
      title: "Digestive System",
      subject: "Biology",
      subjectIcon: Heart,
      description: "Stomach, intestines, enzyme action",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      color: "#e84393",
      modelConfig: biologyModels.find(m => m.id === "digestive-system"),
      parts: [
        { name: "Esophagus", description: "Tube to stomach", position: [0, 1, 0], color: "#e84393" },
        { name: "Stomach", description: "Breaks down food with acid", position: [0, 0.3, 0], color: "#e74c3c" },
        { name: "Small Intestine", description: "Absorbs nutrients", position: [0, -0.3, 0], color: "#f39c12" },
        { name: "Large Intestine", description: "Absorbs water", position: [0, -0.8, 0], color: "#8e44ad" },
        { name: "Liver", description: "Produces bile", position: [-0.7, 0.3, 0], color: "#c0392b" },
        { name: "Pancreas", description: "Produces enzymes", position: [0.7, 0.1, 0], color: "#f1c40f" },
      ]
    },
  ],
  space: [
    {
      id: "solar-system",
      title: "Solar System",
      subject: "Space Science",
      subjectIcon: Rocket,
      description: "Planets with orbiting paths",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=300&fit=crop",
      color: "#00b894",
      modelConfig: spaceModels.find(m => m.id === "solar-system"),
      parts: [
        { name: "Sun", description: "Center star of our system", position: [0, 0, 0], color: "#f1c40f" },
        { name: "Mercury", description: "Closest planet to Sun", position: [0.5, 0, 0], color: "#95a5a6" },
        { name: "Venus", description: "Hottest planet", position: [0.8, 0, 0], color: "#e67e22" },
        { name: "Earth", description: "Our home planet", position: [1.2, 0, 0], color: "#3498db" },
        { name: "Mars", description: "The red planet", position: [1.6, 0, 0], color: "#e74c3c" },
        { name: "Jupiter", description: "Largest planet", position: [2.2, 0, 0], color: "#d35400" },
      ]
    },
    {
      id: "moon-phases",
      title: "Moon Phases",
      subject: "Space Science",
      subjectIcon: Rocket,
      description: "Waxing, waning, eclipse visualization",
      image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=400&h=300&fit=crop",
      color: "#00b894",
      modelConfig: spaceModels.find(m => m.id === "moon-phases"),
      parts: [
        { name: "New Moon", description: "Moon not visible", position: [-1.5, 0, 0], color: "#2d3436" },
        { name: "Waxing Crescent", description: "Growing crescent", position: [-0.8, 0.5, 0], color: "#636e72" },
        { name: "First Quarter", description: "Half moon visible", position: [0, 0.8, 0], color: "#b2bec3" },
        { name: "Full Moon", description: "Entire face lit", position: [0.8, 0.5, 0], color: "#dfe6e9" },
        { name: "Waning Gibbous", description: "Shrinking from full", position: [1.5, 0, 0], color: "#b2bec3" },
      ]
    },
    {
      id: "earth-layers",
      title: "Earth Layers",
      subject: "Space Science",
      subjectIcon: Rocket,
      description: "Core, mantle, crust exploded view",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
      color: "#00b894",
      modelConfig: spaceModels.find(m => m.id === "earth-layers"),
      parts: [
        { name: "Inner Core", description: "Solid iron center", position: [0, 0, 0], color: "#f1c40f" },
        { name: "Outer Core", description: "Liquid iron layer", position: [0, 0, 0.3], color: "#e67e22" },
        { name: "Lower Mantle", description: "Hot, dense rock", position: [0, 0, 0.6], color: "#e74c3c" },
        { name: "Upper Mantle", description: "Partially molten rock", position: [0, 0, 0.85], color: "#d35400" },
        { name: "Crust", description: "Thin outer shell", position: [0, 0, 1], color: "#27ae60" },
        { name: "Atmosphere", description: "Gases surrounding Earth", position: [0, 0, 1.2], color: "#3498db" },
      ]
    },
  ],
};

function LoadingProgress() {
  const { progress, active } = useProgress();
  
  if (!active) return null;
  
  return (
    <Html center>
      <div className="glass px-6 py-4 rounded-2xl text-center min-w-[200px]">
        <Loader2 className="w-8 h-8 text-edu-cyan animate-spin mx-auto mb-2" />
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

function RealisticModel3D({ model, showLabels, isExploded }: { model: ARModel; showLabels: boolean; isExploded: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const explodeOffset = isExploded ? 1.8 : 1;
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const categoryConfig: Record<string, { primary: string; secondary: string; accent: string }> = {
    Physics: { primary: "#6c5ce7", secondary: "#a29bfe", accent: "#74b9ff" },
    Chemistry: { primary: "#00cec9", secondary: "#81ecec", accent: "#74b9ff" },
    Biology: { primary: "#e84393", secondary: "#fd79a8", accent: "#fab1a0" },
    "Space Science": { primary: "#00b894", secondary: "#55efc4", accent: "#ffeaa7" },
  };

  const colors = categoryConfig[model.subject] || categoryConfig.Physics;

  const renderSubjectModel = () => {
    switch (model.subject) {
      case "Physics":
        return <PhysicsModel modelId={model.id} colors={colors} isExploded={isExploded} />;
      case "Chemistry":
        return <ChemistryModel modelId={model.id} colors={colors} isExploded={isExploded} />;
      case "Biology":
        return <BiologyModel modelId={model.id} colors={colors} isExploded={isExploded} />;
      case "Space Science":
        return <SpaceModel modelId={model.id} colors={colors} isExploded={isExploded} />;
      default:
        return <DefaultModel colors={colors} />;
    }
  };

  return (
    <group ref={groupRef}>
      {renderSubjectModel()}
      
      {showLabels && model.parts.map((part, index) => {
        const explodeFactor = isExploded ? 1.8 : 1.2;
        const position: [number, number, number] = [
          part.position[0] * explodeFactor,
          part.position[1] * explodeFactor,
          part.position[2] * explodeFactor
        ];
        
        // Calculate label offset to push it further out
        const dir = new THREE.Vector3(...part.position).normalize();
        const labelOffset: [number, number, number] = [
          dir.x * 0.4,
          dir.y * 0.4 + 0.2,
          dir.z * 0.4
        ];
        
        return (
          <Float key={part.name} speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
            <group position={position}>
              <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial
                  color="#00cec9"
                  emissive="#00cec9"
                  emissiveIntensity={1}
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
                  <span className="font-medium text-white">{part.name}</span>
                </div>
              </Html>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

function PhysicsModel({ modelId, colors, isExploded }: { modelId: string; colors: { primary: string; secondary: string; accent: string }; isExploded: boolean }) {
  const offset = isExploded ? 0.5 : 0;

  if (modelId === "human-eye") {
    return (
      <group>
        <mesh position={[0, 0, -0.5 - offset]}>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.8 + offset]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#74b9ff" transparent opacity={0.8} roughness={0} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.6 + offset * 0.5]}>
          <ringGeometry args={[0.15, 0.4, 64]} />
          <meshStandardMaterial color="#0984e3" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.65 + offset * 0.5]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#dfe6e9" transparent opacity={0.6} roughness={0} />
        </mesh>
        <mesh position={[0, -0.3, -1.2 - offset]}>
          <cylinderGeometry args={[0.15, 0.1, 0.8, 16]} />
          <meshStandardMaterial color="#e17055" />
        </mesh>
        {[...Array(12)].map((_, i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 6) * 0.8, Math.sin(i * Math.PI / 6) * 0.8, -0.5]} rotation={[0, 0, i * Math.PI / 6]}>
            <boxGeometry args={[0.02, 0.3, 0.02]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        ))}
      </group>
    );
  }

  if (modelId === "magnet-compass") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 2, 0.4]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, -1.2 - offset, 0]}>
          <boxGeometry args={[0.8, 0.4, 0.4]} />
          <meshStandardMaterial color="#3498db" metalness={0.6} roughness={0.3} />
        </mesh>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * Math.PI / 4]}>
            <torusGeometry args={[1.5 + i * 0.15, 0.015, 16, 100]} />
            <meshBasicMaterial color={colors.accent} transparent opacity={0.3 - i * 0.03} />
          </mesh>
        ))}
        <group position={[2.5 + offset, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
            <meshStandardMaterial color="#f5f5f5" metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.5, 8]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.08, 0.5, 8]} />
            <meshStandardMaterial color="#ecf0f1" />
          </mesh>
        </group>
      </group>
    );
  }

  if (modelId === "electric-circuits") {
    return (
      <group>
        <mesh position={[-1.5 - offset, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
          <meshStandardMaterial color="#2d3436" metalness={0.5} />
        </mesh>
        <mesh position={[-1.5 - offset, 0.45, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color="#fdcb6e" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.5 + offset * 0.5, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.2]} />
          <meshStandardMaterial color="#636e72" />
        </mesh>
        <mesh position={[1.5 + offset, 0, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#ffeaa7" transparent opacity={0.8} emissive="#ffeaa7" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[1.5 + offset, -0.5, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.3, 16]} />
          <meshStandardMaterial color="#636e72" metalness={0.6} />
        </mesh>
        {[[-1.5, 0.5], [-0.5, 0.5], [0.5, 0.5], [1.5, 0.5], [1.5, -0.3], [-1.5, -0.3]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <torusGeometry args={[0.05, 0.02, 8, 16]} />
            <meshStandardMaterial color="#e17055" />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={colors.primary} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.5, 0.03, 16, 100]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
    </group>
  );
}

function ChemistryModel({ modelId, colors, isExploded }: { modelId: string; colors: { primary: string; secondary: string; accent: string }; isExploded: boolean }) {
  const offset = isExploded ? 0.4 : 0;

  if (modelId === "water-molecule") {
    const bondAngle = 104.5 * (Math.PI / 180);
    const bondLength = 1 + offset;
    
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[-Math.sin(bondAngle / 2) * bondLength, Math.cos(bondAngle / 2) * bondLength, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#ecf0f1" metalness={0.2} roughness={0.5} />
        </mesh>
        <mesh position={[Math.sin(bondAngle / 2) * bondLength, Math.cos(bondAngle / 2) * bondLength, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#ecf0f1" metalness={0.2} roughness={0.5} />
        </mesh>
        <mesh position={[-Math.sin(bondAngle / 2) * bondLength * 0.5, Math.cos(bondAngle / 2) * bondLength * 0.5, 0]} rotation={[0, 0, bondAngle / 2]}>
          <cylinderGeometry args={[0.08, 0.08, bondLength * 0.9, 8]} />
          <meshStandardMaterial color="#dfe6e9" />
        </mesh>
        <mesh position={[Math.sin(bondAngle / 2) * bondLength * 0.5, Math.cos(bondAngle / 2) * bondLength * 0.5, 0]} rotation={[0, 0, -bondAngle / 2]}>
          <cylinderGeometry args={[0.08, 0.08, bondLength * 0.9, 8]} />
          <meshStandardMaterial color="#dfe6e9" />
        </mesh>
        <Sparkles count={30} scale={3} size={1} speed={0.3} color="#74b9ff" />
      </group>
    );
  }

  if (modelId === "carbon-compounds") {
    const tetrahedralAngle = 109.5 * (Math.PI / 180);
    const bondLength = 1.2 + offset;
    
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#2d3436" metalness={0.4} roughness={0.3} />
        </mesh>
        {[
          [0, bondLength, 0],
          [bondLength * Math.sin(tetrahedralAngle), -bondLength * 0.33, 0],
          [-bondLength * Math.sin(tetrahedralAngle) * 0.5, -bondLength * 0.33, bondLength * Math.cos(tetrahedralAngle) * 0.866],
          [-bondLength * Math.sin(tetrahedralAngle) * 0.5, -bondLength * 0.33, -bondLength * Math.cos(tetrahedralAngle) * 0.866],
        ].map((pos, i) => (
          <group key={i}>
            <mesh position={pos as [number, number, number]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial color="#ecf0f1" metalness={0.2} roughness={0.5} />
            </mesh>
            <mesh position={[pos[0] * 0.5, pos[1] * 0.5, pos[2] * 0.5]} 
                  rotation={[Math.atan2(Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]), pos[1]), 0, Math.atan2(pos[0], pos[2])]}>
              <cylinderGeometry args={[0.06, 0.06, bondLength * 0.8, 8]} />
              <meshStandardMaterial color="#95a5a6" />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (modelId === "periodic-elements") {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.3} />
        </mesh>
        {[1, 1.8, 2.6].map((radius, i) => (
          <group key={i}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius + offset * i * 0.3, 0.02, 16, 100]} />
              <meshBasicMaterial color={["#3498db", "#9b59b6", "#1abc9c"][i]} transparent opacity={0.6} />
            </mesh>
            {[...Array(i + 2)].map((_, j) => (
              <Float key={j} speed={3 - i} rotationIntensity={0}>
                <mesh position={[
                  Math.cos(j * Math.PI * 2 / (i + 2)) * (radius + offset * i * 0.3),
                  0,
                  Math.sin(j * Math.PI * 2 / (i + 2)) * (radius + offset * i * 0.3)
                ]}>
                  <sphereGeometry args={[0.12, 16, 16]} />
                  <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.5} />
                </mesh>
              </Float>
            ))}
          </group>
        ))}
      </group>
    );
  }

  return (
    <group>
      <mesh>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={colors.primary} metalness={0.4} roughness={0.3} />
      </mesh>
      <Sparkles count={50} scale={4} size={2} speed={0.4} color={colors.accent} />
    </group>
  );
}

function BiologyModel({ modelId, colors, isExploded }: { modelId: string; colors: { primary: string; secondary: string; accent: string }; isExploded: boolean }) {
  const offset = isExploded ? 0.5 : 0;

  if (modelId === "human-heart") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial color="#c0392b" roughness={0.6} />
        </mesh>
        <mesh position={[-0.4 - offset * 0.5, 0.6 + offset * 0.3, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#e74c3c" roughness={0.5} />
        </mesh>
        <mesh position={[0.4 + offset * 0.5, 0.6 + offset * 0.3, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#3498db" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.5 + offset, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[-0.5 - offset * 0.3, 1.3 + offset * 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0.5 + offset * 0.3, 1.3 + offset * 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[
            Math.cos(i * Math.PI / 4) * 1.3,
            Math.sin(i * Math.PI / 4) * 0.3 - 0.2,
            Math.sin(i * Math.PI / 4) * 0.5
          ]}>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
            <meshStandardMaterial color="#c0392b" />
          </mesh>
        ))}
      </group>
    );
  }

  if (modelId === "plant-cell") {
    return (
      <group>
        <mesh>
          <boxGeometry args={[3, 2, 2]} />
          <meshStandardMaterial color="#27ae60" transparent opacity={0.2} />
        </mesh>
        <mesh>
          <boxGeometry args={[2.8 - offset * 0.2, 1.8 - offset * 0.2, 1.8 - offset * 0.2]} />
          <meshStandardMaterial color="#f1c40f" transparent opacity={0.15} />
        </mesh>
        <mesh position={[0.3 + offset * 0.3, 0.2 + offset * 0.2, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#9b59b6" roughness={0.4} />
        </mesh>
        {[[-0.8, 0.3, 0.3], [-0.6, -0.4, -0.2], [0.7, -0.3, 0.4], [0.5, 0.5, -0.3]].map((pos, i) => (
          <mesh key={i} position={[pos[0] * (1 + offset * 0.3), pos[1] * (1 + offset * 0.3), pos[2] * (1 + offset * 0.3)]}>
            <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        ))}
        {[[-0.9, 0, 0.5], [-0.7, 0.5, -0.4], [0.9, -0.2, 0.3]].map((pos, i) => (
          <mesh key={i} position={[pos[0] * (1 + offset * 0.3), pos[1] * (1 + offset * 0.3), pos[2] * (1 + offset * 0.3)]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#2ecc71" />
          </mesh>
        ))}
        <mesh position={[-0.5 - offset * 0.4, -0.3 - offset * 0.3, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial color={colors.primary} transparent opacity={0.3} roughness={0} />
      </mesh>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color={colors.secondary} emissive={colors.secondary} emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

function SpaceModel({ modelId, colors, isExploded }: { modelId: string; colors: { primary: string; secondary: string; accent: string }; isExploded: boolean }) {
  const offset = isExploded ? 0.5 : 0;

  if (modelId === "solar-system") {
    const planets = [
      { name: "Mercury", distance: 1.5, size: 0.1, color: "#95a5a6", speed: 4 },
      { name: "Venus", distance: 2, size: 0.15, color: "#e67e22", speed: 3 },
      { name: "Earth", distance: 2.5, size: 0.16, color: "#3498db", speed: 2.5 },
      { name: "Mars", distance: 3, size: 0.12, color: "#e74c3c", speed: 2 },
      { name: "Jupiter", distance: 4, size: 0.4, color: "#d35400", speed: 1 },
    ];

    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={1} />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={2} color="#f1c40f" distance={10} />
        
        {planets.map((planet, i) => (
          <group key={planet.name}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[planet.distance + offset * i * 0.2, 0.01, 16, 100]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
            </mesh>
            <Float speed={planet.speed} rotationIntensity={0}>
              <mesh position={[planet.distance + offset * i * 0.2, 0, 0]}>
                <sphereGeometry args={[planet.size, 32, 32]} />
                <meshStandardMaterial color={planet.color} />
              </mesh>
            </Float>
          </group>
        ))}
        <Stars radius={15} depth={10} count={1000} factor={2} saturation={0} fade speed={0.5} />
      </group>
    );
  }

  if (modelId === "earth-layers") {
    const layers = [
      { name: "Inner Core", radius: 0.4, color: "#f1c40f" },
      { name: "Outer Core", radius: 0.7, color: "#e67e22" },
      { name: "Mantle", radius: 1.2, color: "#e74c3c" },
      { name: "Crust", radius: 1.4, color: "#27ae60" },
    ];

    return (
      <group>
        {layers.map((layer, i) => (
          <mesh key={layer.name} position={[0, offset * i * 0.4, 0]}>
            <sphereGeometry args={[layer.radius, 64, 64, 0, Math.PI * 2, 0, Math.PI * (isExploded ? 0.6 : 1)]} />
            <meshStandardMaterial 
              color={layer.color} 
              side={THREE.DoubleSide}
              transparent={i > 0}
              opacity={i === 0 ? 1 : 0.8}
            />
          </mesh>
        ))}
        <mesh position={[0, offset * 4 * 0.4 + 0.1, 0]}>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.2} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color={colors.primary} emissive={colors.primary} emissiveIntensity={0.5} />
      </mesh>
      <Stars radius={10} depth={5} count={500} factor={2} saturation={0} fade speed={1} />
    </group>
  );
}

function DefaultModel({ colors }: { colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <group>
      <mesh>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={colors.primary} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.5, 0.03, 16, 100]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
    </group>
  );
}

function Scene({ model, showLabels, isExploded }: { model: ARModel; showLabels: boolean; isExploded: boolean }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 5]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00cec9" />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.5} penumbra={1} />
      
      <RealisticModel3D model={model} showLabels={showLabels} isExploded={isExploded} />
      
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate 
        autoRotate 
        autoRotateSpeed={0.5}
        minDistance={2}
        maxDistance={10}
      />
      <Environment preset="city" />
    </>
  );
}

export default function ARPage() {
  const [activeSubject, setActiveSubject] = useState("physics");
  const [selectedModel, setSelectedModel] = useState<ARModel | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const subjects = [
    { id: "physics", name: "Physics", icon: Atom, color: "edu-purple" },
    { id: "chemistry", name: "Chemistry", icon: FlaskConical, color: "edu-cyan" },
    { id: "biology", name: "Biology", icon: Heart, color: "edu-pink" },
    { id: "space", name: "Space Science", icon: Rocket, color: "edu-teal" },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      console.log("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Glasses className="w-4 h-4 text-edu-purple" />
            <span className="text-sm text-muted-foreground">Augmented Reality</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Explore <span className="gradient-text">3D Models</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scan textbook diagrams or select a model to view interactive 3D visualizations 
            with rotate, zoom, exploded view, and part-wise labeling.
          </p>
        </motion.div>

        <Tabs value={activeSubject} onValueChange={setActiveSubject} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 glass h-auto p-1">
            {subjects.map((subject) => (
              <TabsTrigger
                key={subject.id}
                value={subject.id}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-edu-purple data-[state=active]:to-edu-cyan"
              >
                <subject.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{subject.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => (
            <TabsContent key={subject.id} value={subject.id} className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {arModels[subject.id]?.map((model, index) => (
                  <motion.button
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedModel(model)}
                    className={`group text-left glass rounded-2xl overflow-hidden hover:bg-white/5 transition-all ${
                      selectedModel?.id === model.id ? "ring-2 ring-edu-cyan" : ""
                    }`}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={model.image}
                        alt={model.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full glass text-xs mb-1">
                          <model.subjectIcon className="w-3 h-3" />
                          {model.subject}
                        </div>
                        <h3 className="text-sm font-medium text-white">{model.title}</h3>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl overflow-hidden">
              <div className="relative aspect-video bg-black/50">
                {cameraActive && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                
                {selectedModel ? (
                  <div className="absolute inset-0">
                    <Canvas>
                      <Suspense fallback={<LoadingProgress />}>
                        <Scene model={selectedModel} showLabels={showLabels} isExploded={isExploded} />
                      </Suspense>
                    </Canvas>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Glasses className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a model to view in 3D</p>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!cameraActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={startCamera}
                        className="glass border-0"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={stopCamera}
                        className="glass border-0"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Stop Camera
                      </Button>
                    )}
                  </div>
                  
                  {selectedModel && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowInfo(!showInfo)}
                      className="glass border-0"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {selectedModel && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowLabels(!showLabels)}
                        className="glass border-0"
                      >
                        {showLabels ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                        Labels
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsExploded(!isExploded)}
                        className="glass border-0"
                      >
                        <Layers className="w-4 h-4 mr-2" />
                        {isExploded ? "Collapse" : "Explode"}
                      </Button>
                    </div>
                    <div className="glass px-3 py-1.5 rounded-full text-xs">
                      Drag to rotate • Scroll to zoom
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedModel && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedModel.color }}
                  />
                  <span className="text-sm text-muted-foreground">{selectedModel.subject}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedModel.title}</h2>
                <p className="text-muted-foreground mb-6">{selectedModel.description}</p>

                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-edu-cyan" />
                  Parts & Labels
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedModel.parts.map((part) => (
                    <div
                      key={part.name}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: part.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{part.name}</p>
                        <p className="text-xs text-muted-foreground">{part.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Controls</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4" />
                  <span>Drag to rotate</span>
                </div>
                <div className="flex items-center gap-3">
                  <ZoomIn className="w-4 h-4" />
                  <span>Scroll or pinch to zoom</span>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4" />
                  <span>Toggle exploded view</span>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4" />
                  <span>Toggle labels on/off</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showInfo && selectedModel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowInfo(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-3xl p-8 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedModel.title}</h2>
                  <Button size="sm" variant="ghost" onClick={() => setShowInfo(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground mb-6">{selectedModel.description}</p>
                <div className="space-y-4">
                  {selectedModel.parts.map((part) => (
                    <div key={part.name} className="flex items-start gap-3">
                      <div
                        className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: part.color }}
                      />
                      <div>
                        <p className="font-medium">{part.name}</p>
                        <p className="text-sm text-muted-foreground">{part.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
