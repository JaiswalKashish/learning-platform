"use client";

import { useState, Suspense, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, Stars, Float, Text, MeshReflectorMaterial, ContactShadows, Sparkles, useProgress, Html } from "@react-three/drei";
import { 
  View, 
  Play,
  Pause,
  Maximize,
  Minimize,
  Info,
  X,
  Atom,
  FlaskConical,
  Heart,
  Rocket,
  Settings,
  Volume2,
  VolumeX,
  ChevronRight,
  Lightbulb,
  MousePointer,
  Loader2,
  Bot,
  Send,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as THREE from "three";

interface VRScene {
  id: string;
  title: string;
  subject: string;
  subjectIcon: React.ElementType;
  description: string;
  image: string;
  color: string;
  hotspots: {
    name: string;
    description: string;
    position: [number, number, number];
  }[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const vrScenes: Record<string, VRScene[]> = {
  physics: [
    {
      id: "forces-motion",
      title: "Forces & Motion Lab",
      subject: "Physics",
      subjectIcon: Atom,
      description: "Roller coaster simulation for acceleration, friction, and energy",
      image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&h=400&fit=crop",
      color: "#6c5ce7",
      hotspots: [
        { name: "Kinetic Energy Zone", description: "Maximum speed at lowest point", position: [-2, 0, 0] },
        { name: "Potential Energy Peak", description: "Maximum height, minimum speed", position: [0, 2, 0] },
        { name: "Friction Surface", description: "Energy loss due to friction", position: [2, 0, 0] },
        { name: "Acceleration Point", description: "Change in velocity direction", position: [0, 0, 2] },
      ]
    },
    {
      id: "magnetic-fields",
      title: "Magnetic Fields",
      subject: "Physics",
      subjectIcon: Atom,
      description: "Explore 3D magnets and field lines",
      image: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=600&h=400&fit=crop",
      color: "#6c5ce7",
      hotspots: [
        { name: "North Pole", description: "Field lines exit here", position: [0, 1.5, 0] },
        { name: "South Pole", description: "Field lines enter here", position: [0, -1.5, 0] },
        { name: "Field Line", description: "Path of magnetic force", position: [1, 0, 1] },
      ]
    },
    {
      id: "sound-waves",
      title: "Sound Waves",
      subject: "Physics",
      subjectIcon: Atom,
      description: "Visualize wave propagation in 3D",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop",
      color: "#6c5ce7",
      hotspots: [
        { name: "Source", description: "Origin of sound waves", position: [0, 0, 0] },
        { name: "Compression", description: "High pressure region", position: [1, 0, 0] },
        { name: "Rarefaction", description: "Low pressure region", position: [2, 0, 0] },
      ]
    },
  ],
  chemistry: [
    {
      id: "molecule-lab",
      title: "Molecule Interaction Lab",
      subject: "Chemistry",
      subjectIcon: FlaskConical,
      description: "See bonding and reactions in 3D",
      image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop",
      color: "#00cec9",
      hotspots: [
        { name: "Reactant A", description: "Starting molecule", position: [-2, 0, 0] },
        { name: "Reactant B", description: "Second reactant", position: [2, 0, 0] },
        { name: "Transition State", description: "Bond breaking/forming", position: [0, 1, 0] },
        { name: "Product", description: "Final molecule", position: [0, -1, 0] },
      ]
    },
    {
      id: "acid-base",
      title: "Acid-Base Reactions",
      subject: "Chemistry",
      subjectIcon: FlaskConical,
      description: "Interactive chemical reaction visualization",
      image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&h=400&fit=crop",
      color: "#00cec9",
      hotspots: [
        { name: "Acid (HCl)", description: "Donates H+ ions", position: [-1.5, 0, 0] },
        { name: "Base (NaOH)", description: "Donates OH- ions", position: [1.5, 0, 0] },
        { name: "Neutralization", description: "H+ + OH- → H2O", position: [0, 0, 0] },
      ]
    },
  ],
  biology: [
    {
      id: "human-body",
      title: "Human Body Exploration",
      subject: "Biology",
      subjectIcon: Heart,
      description: "Circulatory, respiratory, digestive systems",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      color: "#e84393",
      hotspots: [
        { name: "Heart", description: "Pumps blood throughout body", position: [0, 1, 0.5] },
        { name: "Lungs", description: "Gas exchange occurs here", position: [0, 1.2, -0.5] },
        { name: "Stomach", description: "Digests food with enzymes", position: [0, 0, 0.5] },
        { name: "Brain", description: "Control center of the body", position: [0, 2, 0] },
      ]
    },
    {
      id: "microscopic-world",
      title: "Microscopic World",
      subject: "Biology",
      subjectIcon: Heart,
      description: "Scale-up cells, bacteria, viruses",
      image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop",
      color: "#e84393",
      hotspots: [
        { name: "Cell Membrane", description: "Protective barrier", position: [0, 0, 1.2] },
        { name: "Nucleus", description: "Contains DNA", position: [0, 0, 0] },
        { name: "Mitochondria", description: "Energy production", position: [0.5, 0.3, 0] },
        { name: "Ribosome", description: "Protein synthesis", position: [-0.5, -0.3, 0] },
      ]
    },
  ],
  space: [
    {
      id: "solar-system-tour",
      title: "Solar System Tour",
      subject: "Space Science",
      subjectIcon: Rocket,
      description: "Fly through planets, moons, and asteroid belt",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&h=400&fit=crop",
      color: "#00b894",
      hotspots: [
        { name: "Sun", description: "Our star - 99.86% of solar mass", position: [0, 0, 0] },
        { name: "Earth", description: "Our home planet", position: [3, 0, 0] },
        { name: "Mars", description: "The Red Planet", position: [4.5, 0, 0] },
        { name: "Jupiter", description: "Largest planet", position: [8, 0, 0] },
        { name: "Asteroid Belt", description: "Between Mars and Jupiter", position: [6, 0, 0] },
      ]
    },
    {
      id: "earth-mars",
      title: "Earth vs Mars Comparison",
      subject: "Space Science",
      subjectIcon: Rocket,
      description: "Surface and environment differences",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
      color: "#00b894",
      hotspots: [
        { name: "Earth Atmosphere", description: "78% N2, 21% O2", position: [-2, 1, 0] },
        { name: "Mars Atmosphere", description: "95% CO2, very thin", position: [2, 1, 0] },
        { name: "Earth Surface", description: "71% water", position: [-2, -1, 0] },
        { name: "Mars Surface", description: "Iron oxide (rust) red", position: [2, -1, 0] },
      ]
    },
    {
      id: "constellation-explorer",
      title: "Constellation Explorer",
      subject: "Space Science",
      subjectIcon: Rocket,
      description: "Stars and constellations in 3D",
      image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop",
      color: "#00b894",
      hotspots: [
        { name: "Orion", description: "The Hunter constellation", position: [-2, 1, -3] },
        { name: "Big Dipper", description: "Part of Ursa Major", position: [2, 2, -3] },
        { name: "Polaris", description: "The North Star", position: [0, 3, -4] },
      ]
    },
  ],
  engineering: [
    {
      id: "bridge-structures",
      title: "Bridge / Building Structures",
      subject: "Engineering",
      subjectIcon: Settings,
      description: "Stress analysis visualization",
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=400&fit=crop",
      color: "#fdcb6e",
      hotspots: [
        { name: "Tension Zone", description: "Material being pulled apart", position: [0, -0.5, 0] },
        { name: "Compression Zone", description: "Material being pushed together", position: [0, 0.5, 0] },
        { name: "Support Point", description: "Load transfer to ground", position: [-2, -1, 0] },
      ]
    },
    {
      id: "wind-tunnel",
      title: "Wind Tunnel Experiment",
      subject: "Engineering",
      subjectIcon: Settings,
      description: "Airflow over objects visualization",
      image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&h=400&fit=crop",
      color: "#fdcb6e",
      hotspots: [
        { name: "Laminar Flow", description: "Smooth, parallel air layers", position: [-2, 0, 0] },
        { name: "Turbulence", description: "Chaotic air movement", position: [2, 0, 0] },
        { name: "Drag Force", description: "Resistance to motion", position: [0, 0, 0] },
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
        <div className="text-sm text-white mb-2">Loading Environment</div>
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

function PhysicsEnvironment({ id }: { id: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  if (id === "forces-motion") {
    return (
      <group ref={groupRef}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[4, 0.15, 32, 100]} />
          <meshStandardMaterial color="#6c5ce7" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, Math.PI / 2, 0]}>
          <torusGeometry args={[4, 0.15, 32, 100]} />
          <meshStandardMaterial color="#a29bfe" metalness={0.8} roughness={0.2} />
        </mesh>
        <Float speed={3} rotationIntensity={0} floatIntensity={0.5}>
          <mesh position={[4, 0, 0]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#ff7675" emissive="#ff7675" emissiveIntensity={0.5} />
          </mesh>
        </Float>
        <Float speed={3} rotationIntensity={0} floatIntensity={0.5}>
          <mesh position={[-4, 0, 0]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#74b9ff" emissive="#74b9ff" emissiveIntensity={0.5} />
          </mesh>
        </Float>
        {[...Array(20)].map((_, i) => (
          <mesh key={i} position={[Math.sin(i * 0.5) * 3, Math.cos(i * 0.3) * 2, Math.sin(i * 0.7) * 3]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffeaa7" emissive="#ffeaa7" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
    );
  }

  if (id === "magnetic-fields") {
    return (
      <group>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />
          <meshStandardMaterial color="#3498db" metalness={0.7} roughness={0.3} />
        </mesh>
        {[...Array(12)].map((_, i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 6, 0]}>
            <torusGeometry args={[2.5 + (i % 3) * 0.5, 0.02, 16, 100]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3 - (i % 3) * 0.08} />
          </mesh>
        ))}
        <Sparkles count={100} scale={8} size={2} speed={0.5} color="#74b9ff" />
      </group>
    );
  }

  if (id === "sound-waves") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.5, 2]} />
          <meshStandardMaterial color="#6c5ce7" emissive="#6c5ce7" emissiveIntensity={0.8} />
        </mesh>
        {[...Array(8)].map((_, i) => (
          <Float key={i} speed={2} rotationIntensity={0} floatIntensity={0.2}>
            <mesh position={[0, 0, 0]} scale={1 + i * 0.5}>
              <ringGeometry args={[1.8, 2, 64]} />
              <meshBasicMaterial color="#a29bfe" transparent opacity={0.4 - i * 0.04} side={THREE.DoubleSide} />
            </mesh>
          </Float>
        ))}
        <Sparkles count={50} scale={10} size={1} speed={1} color="#ffeaa7" />
      </group>
    );
  }

  return (
    <mesh>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshStandardMaterial color="#6c5ce7" metalness={0.5} roughness={0.3} />
    </mesh>
  );
}

function ChemistryEnvironment({ id }: { id: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  if (id === "molecule-lab") {
    return (
      <group ref={groupRef}>
        <mesh position={[-2, 0, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-2.8, 0.5, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#ecf0f1" />
        </mesh>
        <mesh position={[-1.2, 0.5, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#ecf0f1" />
        </mesh>
        
        <mesh position={[2, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#2d3436" metalness={0.4} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[2 + Math.cos(i * Math.PI / 2) * 0.8, Math.sin(i * Math.PI / 2) * 0.8, 0]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial color="#ecf0f1" />
          </mesh>
        ))}
        
        <Float speed={2}>
          <mesh position={[0, 1.5, 0]}>
            <tetrahedronGeometry args={[0.5]} />
            <meshStandardMaterial color="#f1c40f" transparent opacity={0.7} />
          </mesh>
        </Float>
        
        <Sparkles count={80} scale={8} size={2} speed={0.3} color="#00cec9" />
      </group>
    );
  }

  if (id === "acid-base") {
    return (
      <group>
        <mesh position={[-2, 0, 0]}>
          <coneGeometry args={[0.8, 2, 32]} />
          <meshStandardMaterial color="#e74c3c" transparent opacity={0.7} />
        </mesh>
        <mesh position={[-2, -1.2, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        
        <mesh position={[2, 0, 0]}>
          <coneGeometry args={[0.8, 2, 32]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
        </mesh>
        <mesh position={[2, -1.2, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        
        <Float speed={3}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial color="#00cec9" transparent opacity={0.5} emissive="#00cec9" emissiveIntensity={0.3} />
          </mesh>
        </Float>
        
        <Sparkles count={60} scale={6} size={3} speed={0.5} color="#f1c40f" />
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <mesh>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#00cec9" metalness={0.5} roughness={0.3} />
      </mesh>
      <Sparkles count={50} scale={5} size={2} speed={0.4} color="#74b9ff" />
    </group>
  );
}

function BiologyEnvironment({ id }: { id: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });

  if (id === "human-body") {
    return (
      <group ref={groupRef}>
        <mesh position={[0, 0.8, 0.3]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#c0392b" roughness={0.6} />
        </mesh>
        <mesh position={[-0.5, 0.8, 0.3]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0.5, 0.8, 0.3]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        <mesh position={[-0.8, 1.2, -0.3]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#e84393" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0.8, 1.2, -0.3]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#e84393" transparent opacity={0.7} />
        </mesh>
        
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="#fd79a8" />
        </mesh>
        
        <mesh position={[0, -0.5, 0.3]}>
          <capsuleGeometry args={[0.4, 0.8, 16, 32]} />
          <meshStandardMaterial color="#e17055" />
        </mesh>
        
        {[...Array(10)].map((_, i) => (
          <Float key={i} speed={2} floatIntensity={0.3}>
            <mesh position={[Math.random() * 3 - 1.5, Math.random() * 3, Math.random() * 2 - 1]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
            </mesh>
          </Float>
        ))}
      </group>
    );
  }

  if (id === "microscopic-world") {
    return (
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshStandardMaterial color="#e84393" transparent opacity={0.2} roughness={0} side={THREE.DoubleSide} />
        </mesh>
        
        <mesh position={[0.3, 0.2, 0]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="#9b59b6" roughness={0.4} />
        </mesh>
        
        {[[-0.8, 0.3, 0.3], [-0.6, -0.4, -0.2], [0.7, -0.3, 0.4], [0.5, 0.5, -0.3], [-0.3, -0.6, 0.5]].map((pos, i) => (
          <Float key={i} speed={2} floatIntensity={0.3}>
            <mesh position={pos as [number, number, number]}>
              <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
              <meshStandardMaterial color="#e74c3c" />
            </mesh>
          </Float>
        ))}
        
        {[...Array(20)].map((_, i) => (
          <Float key={i} speed={3} floatIntensity={0.5}>
            <mesh position={[Math.random() * 3 - 1.5, Math.random() * 3 - 1.5, Math.random() * 3 - 1.5]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.8} />
            </mesh>
          </Float>
        ))}
        
        <Sparkles count={100} scale={6} size={1} speed={0.2} color="#fd79a8" />
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color="#e84393" transparent opacity={0.3} />
      </mesh>
      <Float speed={2} rotationIntensity={1}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#9b59b6" emissive="#9b59b6" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

function SpaceEnvironment({ id }: { id: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  if (id === "solar-system-tour") {
    const planets = [
      { name: "Mercury", distance: 2, size: 0.15, color: "#95a5a6", speed: 4 },
      { name: "Venus", distance: 3, size: 0.2, color: "#e67e22", speed: 3 },
      { name: "Earth", distance: 4, size: 0.22, color: "#3498db", speed: 2.5 },
      { name: "Mars", distance: 5, size: 0.18, color: "#e74c3c", speed: 2 },
      { name: "Jupiter", distance: 7, size: 0.6, color: "#d35400", speed: 1 },
      { name: "Saturn", distance: 9, size: 0.5, color: "#f1c40f", speed: 0.8 },
    ];

    return (
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={1.5} />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={3} color="#f1c40f" distance={20} />
        
        {planets.map((planet) => (
          <group key={planet.name}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[planet.distance, 0.02, 16, 100]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
            </mesh>
            <Float speed={planet.speed} rotationIntensity={0}>
              <mesh position={[planet.distance, 0, 0]}>
                <sphereGeometry args={[planet.size, 32, 32]} />
                <meshStandardMaterial color={planet.color} />
              </mesh>
              {planet.name === "Saturn" && (
                <mesh position={[planet.distance, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
                  <torusGeometry args={[0.8, 0.15, 2, 64]} />
                  <meshStandardMaterial color="#dfe6e9" transparent opacity={0.6} />
                </mesh>
              )}
            </Float>
          </group>
        ))}
      </group>
    );
  }

  if (id === "earth-mars") {
    return (
      <group>
        <mesh position={[-3, 0, 0]}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        <mesh position={[-3, 0, 0]}>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshStandardMaterial color="#ecf0f1" transparent opacity={0.2} />
        </mesh>
        
        <mesh position={[3, 0, 0]}>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[3, 0, 0]}>
          <sphereGeometry args={[1.25, 32, 32]} />
          <meshStandardMaterial color="#d35400" transparent opacity={0.1} />
        </mesh>
        
        <Float speed={2}>
          <Text position={[-3, 2.5, 0]} fontSize={0.4} color="white" anchorX="center">
            Earth
          </Text>
        </Float>
        <Float speed={2}>
          <Text position={[3, 2.2, 0]} fontSize={0.4} color="white" anchorX="center">
            Mars
          </Text>
        </Float>
      </group>
    );
  }

  if (id === "constellation-explorer") {
    const stars = [
      { pos: [-3, 2, -5], size: 0.15 },
      { pos: [-2.5, 1, -5], size: 0.12 },
      { pos: [-2, 0, -5], size: 0.18 },
      { pos: [-2.5, -1, -5], size: 0.1 },
      { pos: [-3, -2, -5], size: 0.14 },
      { pos: [2, 3, -6], size: 0.2 },
      { pos: [2.5, 2.5, -6], size: 0.15 },
      { pos: [3, 2, -6], size: 0.12 },
      { pos: [3.5, 1.5, -6], size: 0.18 },
      { pos: [4, 2, -6], size: 0.1 },
      { pos: [0, 4, -8], size: 0.25 },
    ];

    return (
      <group>
        {stars.map((star, i) => (
          <Float key={i} speed={0.5} floatIntensity={0.1}>
            <mesh position={star.pos as [number, number, number]}>
              <sphereGeometry args={[star.size, 16, 16]} />
              <meshStandardMaterial color="#ffeaa7" emissive="#ffeaa7" emissiveIntensity={1} />
            </mesh>
          </Float>
        ))}
        
        <Sparkles count={500} scale={30} size={1} speed={0.1} color="#ffffff" />
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial color="#00b894" emissive="#00b894" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function EngineeringEnvironment({ id }: { id: string }) {
  if (id === "bridge-structures") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[12, 0.3, 2]} />
          <meshStandardMaterial color="#636e72" metalness={0.6} />
        </mesh>
        
        {[...Array(7)].map((_, i) => (
          <group key={i} position={[(i - 3) * 2, 0, 0]}>
            <mesh position={[0, 1, 0.8]}>
              <boxGeometry args={[0.15, 2, 0.15]} />
              <meshStandardMaterial color="#dfe6e9" metalness={0.5} />
            </mesh>
            <mesh position={[0, 1, -0.8]}>
              <boxGeometry args={[0.15, 2, 0.15]} />
              <meshStandardMaterial color="#dfe6e9" metalness={0.5} />
            </mesh>
            {i < 6 && (
              <>
                <mesh position={[1, 1.5, 0.8]} rotation={[0, 0, Math.PI / 4]}>
                  <boxGeometry args={[0.1, 2.8, 0.1]} />
                  <meshStandardMaterial color="#b2bec3" />
                </mesh>
                <mesh position={[1, 0.5, 0.8]} rotation={[0, 0, -Math.PI / 4]}>
                  <boxGeometry args={[0.1, 2.8, 0.1]} />
                  <meshStandardMaterial color="#b2bec3" />
                </mesh>
              </>
            )}
          </group>
        ))}
        
        <mesh position={[-7, -0.5, 0]}>
          <boxGeometry args={[2, 1.5, 2.5]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh position={[7, -0.5, 0]}>
          <boxGeometry args={[2, 1.5, 2.5]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
      </group>
    );
  }

  if (id === "wind-tunnel") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2, 2, 8, 32, 1, true]} />
          <meshStandardMaterial color="#636e72" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.3, 1.5, 16, 32]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.5} />
        </mesh>
        
        {[...Array(20)].map((_, i) => (
          <Float key={i} speed={5} floatIntensity={0.1}>
            <mesh position={[-3 + i * 0.3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2]}>
              <boxGeometry args={[0.5, 0.02, 0.02]} />
              <meshBasicMaterial color="#74b9ff" transparent opacity={0.5} />
            </mesh>
          </Float>
        ))}
        
        <Sparkles count={100} scale={[8, 4, 4]} size={1} speed={2} color="#ffffff" />
      </group>
    );
  }

  return (
    <group>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#fdcb6e" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

function VREnvironment({ scene, showHotspots }: { scene: VRScene; showHotspots: boolean }) {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={100} scale={30} size={1} speed={0.2} color="#ffffff" opacity={0.1} />
      
      <group position={[0, 0, 0]}>
        {scene.subject === "Physics" && <PhysicsEnvironment id={scene.id} />}
        {scene.subject === "Chemistry" && <ChemistryEnvironment id={scene.id} />}
        {scene.subject === "Biology" && <BiologyEnvironment id={scene.id} />}
        {scene.subject === "Space Science" && <SpaceEnvironment id={scene.id} />}
        {scene.subject === "Engineering" && <EngineeringEnvironment id={scene.id} />}
      </group>

      {showHotspots && scene.hotspots.map((hotspot) => {
        const dir = new THREE.Vector3(...hotspot.position).normalize();
        const labelOffset: [number, number, number] = [
          dir.x * 0.5,
          dir.y * 0.5 + 0.5,
          dir.z * 0.5
        ];

        return (
          <Float key={hotspot.name} speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group position={hotspot.position}>
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial 
                  color="#00cec9"
                  emissive="#00cec9"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.25, 32]} />
                <meshBasicMaterial color="#00cec9" transparent opacity={0.5} />
              </mesh>
              
              <mesh position={[labelOffset[0]/2, labelOffset[1]/2, labelOffset[2]/2]} 
                    rotation={[Math.atan2(labelOffset[1], Math.sqrt(labelOffset[0]**2 + labelOffset[2]**2)) + Math.PI/2, 0, Math.atan2(labelOffset[0], labelOffset[2])]}>
                <cylinderGeometry args={[0.003, 0.003, new THREE.Vector3(...labelOffset).length(), 8]} />
                <meshBasicMaterial color="#00cec9" transparent opacity={0.2} />
              </mesh>

              <Html 
                distanceFactor={15} 
                position={labelOffset}
                occlude
                center
                style={{
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: 1,
                }}
              >
                <div className="glass px-3 py-1.5 rounded-xl text-xs whitespace-nowrap pointer-events-none border border-edu-cyan/30 shadow-[0_0_15px_rgba(0,206,201,0.2)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-edu-cyan shadow-[0_0_8px_#00cec9]" />
                    <span className="font-bold tracking-wide text-white drop-shadow-md">{hotspot.name}</span>
                  </div>
                </div>
              </Html>
            </group>
          </Float>
        );
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
        />
      </mesh>

      <ContactShadows 
        position={[0, -1.99, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
      />
      
      <gridHelper args={[50, 50, "#6c5ce7", "#2d2d44"]} position={[0, -1.98, 0]} />
    </>
  );
}

function VRSceneCanvas({ scene, showHotspots }: { scene: VRScene; showHotspots: boolean }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 8]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#6c5ce7" />
      <spotLight position={[0, 10, 0]} intensity={0.5} color="#00cec9" angle={0.5} />
      <VREnvironment scene={scene} showHotspots={showHotspots} />
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate 
        autoRotate 
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.5}
        minDistance={3}
        maxDistance={20}
      />
      <Environment preset="night" />
    </>
  );
}

function AITutorChat({ scene, isOpen, onClose }: { scene: VRScene | null; isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Detect mobile/tablet screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (scene && isOpen) {
      setMessages([{
        id: "1",
        role: "assistant",
        content: `Welcome to the ${scene.title}! I'm EduChat, your AI tutor. Ask me anything about what you're seeing - I can explain the science behind ${scene.subject.toLowerCase()} concepts shown here. I can answer ANY question you have!`,
      }]);
    }
  }, [scene?.id, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !scene) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/educhat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          context: `VR Environment: ${scene.title} (${scene.subject}). Interactive elements: ${scene.hotspots.map(h => h.name).join(", ")}`,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Parse the format: 0:"content"
          const match = chunk.match(/0:"(.*)"/);
          if (match) {
            // Unescape the content
            const unescaped = match[1]
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
            fullContent = unescaped;
            setStreamingContent(unescaped);
          }
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullContent || "I apologize, but I couldn't generate a response. Please try again.",
      }]);
      setStreamingContent("");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      
      console.error("EduChat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I'm having trouble connecting right now. ${(error as Error).message || "Please try again in a moment."}`,
      }]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, scene, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  if (!isOpen) return null;

  // Desktop layout
  if (!isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute top-4 right-4 bottom-4 w-80 glass rounded-2xl flex flex-col overflow-hidden z-20"
      >
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">EduChat AI Tutor</h3>
              <p className="text-[10px] text-muted-foreground">Ask any question!</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-edu-purple to-edu-cyan text-white"
                    : "bg-white/10"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {streamingContent && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="max-w-[85%] rounded-xl px-3 py-2 text-xs bg-white/10 whitespace-pre-wrap">
                {streamingContent}
              </div>
            </div>
          )}

          {isLoading && !streamingContent && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any science question..."
              className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-edu-cyan"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 p-0 bg-gradient-to-r from-edu-teal to-edu-green"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
          {scene && (
            <div className="flex flex-wrap gap-1 mt-2">
              {scene.hotspots.slice(0, 3).map((hotspot) => (
                <button
                  key={hotspot.name}
                  onClick={() => setInput(`Explain ${hotspot.name} in detail`)}
                  className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] hover:bg-white/10 transition-colors"
                >
                  {hotspot.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Mobile drawer layout
  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      className="fixed inset-0 z-20 flex flex-col bg-black/80 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-black/40 to-black/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold">EduChat AI Tutor</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Ask any question about {scene?.subject}</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10 p-0 flex-shrink-0">
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base whitespace-pre-wrap break-words ${
                message.role === "user"
                  ? "bg-gradient-to-r from-edu-purple to-edu-cyan text-white rounded-br-none"
                  : "bg-white/10 rounded-bl-none"
              }`}
            >
              {message.content}
            </div>
          </motion.div>
        ))}

        {streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 sm:gap-3"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="max-w-[85%] sm:max-w-[80%] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 whitespace-pre-wrap break-words">
              {streamingContent}
            </div>
          </motion.div>
        )}

        {isLoading && !streamingContent && (
          <div className="flex gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="bg-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span className="text-xs sm:text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 sm:p-5 border-t border-white/10 bg-gradient-to-r from-black/40 to-black/20 space-y-3 sm:space-y-4">
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask any science question..."
            className="flex-1 bg-white/5 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-edu-cyan placeholder-white/50"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-10 sm:h-12 w-10 sm:w-12 p-0 bg-gradient-to-r from-edu-teal to-edu-green hover:shadow-lg hover:shadow-edu-cyan/50 flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Quick topic buttons */}
        {scene && scene.hotspots.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-white/60">Quick topics:</p>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {scene.hotspots.slice(0, 4).map((hotspot) => (
                <button
                  key={hotspot.name}
                  onClick={() => setInput(`Explain ${hotspot.name} in detail`)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 text-[11px] sm:text-xs font-medium transition-all hover:ring-1 hover:ring-edu-cyan"
                >
                  {hotspot.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function VRPage() {
  const [activeSubject, setActiveSubject] = useState("physics");
  const [selectedScene, setSelectedScene] = useState<VRScene | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const subjects = [
    { id: "physics", name: "Physics", icon: Atom, color: "edu-purple" },
    { id: "chemistry", name: "Chemistry", icon: FlaskConical, color: "edu-cyan" },
    { id: "biology", name: "Biology", icon: Heart, color: "edu-pink" },
    { id: "space", name: "Space Science", icon: Rocket, color: "edu-teal" },
    { id: "engineering", name: "Engineering", icon: Settings, color: "edu-orange" },
  ];

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <View className="w-4 h-4 text-edu-cyan" />
            <span className="text-sm text-muted-foreground">Virtual Reality</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Immersive <span className="gradient-text">VR Experiences</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Walk through 3D environments, explore interactive scenes, and learn 
            through immersive virtual reality experiences.
          </p>
        </motion.div>

        <Tabs value={activeSubject} onValueChange={setActiveSubject} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 glass h-auto p-1">
            {subjects.map((subject) => (
              <TabsTrigger
                key={subject.id}
                value={subject.id}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-edu-cyan data-[state=active]:to-edu-teal"
              >
                <subject.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{subject.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => (
            <TabsContent key={subject.id} value={subject.id} className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vrScenes[subject.id]?.map((scene, index) => (
                  <motion.button
                    key={scene.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedScene(scene)}
                    className={`group text-left glass rounded-2xl overflow-hidden hover:bg-white/5 transition-all ${
                      selectedScene?.id === scene.id ? "ring-2 ring-edu-cyan" : ""
                    }`}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={scene.image}
                        alt={scene.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full glass text-xs mb-1">
                          <scene.subjectIcon className="w-3 h-3" />
                          {scene.subject}
                        </div>
                        <h3 className="text-sm font-medium text-white">{scene.title}</h3>
                        <p className="text-xs text-white/70 mt-1 line-clamp-1">{scene.description}</p>
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
            <div 
              ref={canvasContainerRef}
              className={`glass rounded-3xl overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
            >
              <div className={`relative bg-black ${isFullscreen ? "h-full" : "aspect-video"}`}>
                {selectedScene ? (
                  <div className="absolute inset-0">
                    <Canvas>
                      <Suspense fallback={<LoadingProgress />}>
                        <VRSceneCanvas scene={selectedScene} showHotspots={showHotspots} />
                      </Suspense>
                    </Canvas>
                    
                    <AnimatePresence>
                      <AITutorChat 
                        scene={selectedScene} 
                        isOpen={showChat} 
                        onClose={() => setShowChat(false)} 
                      />
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <View className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a VR experience to begin</p>
                    </div>
                  </div>
                )}

                {selectedScene && (
                  <>
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className="glass px-4 py-2 rounded-full">
                        <span className="text-sm font-medium">{selectedScene.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowChat(!showChat)}
                          className={`glass border-0 ${showChat ? "bg-edu-teal/20" : ""}`}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          AI Tutor
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowInfo(!showInfo)}
                          className="glass border-0"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={toggleFullscreen}
                          className="glass border-0"
                        >
                          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="glass border-0"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsMuted(!isMuted)}
                          className="glass border-0"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowHotspots(!showHotspots)}
                          className={`glass border-0 ${showHotspots ? "bg-edu-cyan/20" : ""}`}
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Hotspots
                        </Button>
                      </div>
                      <div className="glass px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                        <MousePointer className="w-3 h-3" />
                        Drag to look around
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedScene && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedScene.color }}
                  />
                  <span className="text-sm text-muted-foreground">{selectedScene.subject}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedScene.title}</h2>
                <p className="text-muted-foreground mb-6">{selectedScene.description}</p>

                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-edu-cyan" />
                  Interactive Points
                </h3>
                <div className="space-y-2">
                  {selectedScene.hotspots.map((hotspot, index) => (
                    <button
                      key={hotspot.name}
                      onClick={() => setActiveHotspot(activeHotspot === index ? null : index)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeHotspot === index ? "bg-edu-cyan/20" : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-edu-cyan" />
                          <span className="font-medium text-sm">{hotspot.name}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${activeHotspot === index ? "rotate-90" : ""}`} />
                      </div>
                      <AnimatePresence>
                        {activeHotspot === index && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-xs text-muted-foreground mt-2 pl-5"
                          >
                            {hotspot.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">VR Controls</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <MousePointer className="w-4 h-4" />
                  <span>Drag to look around</span>
                </div>
                <div className="flex items-center gap-3">
                  <View className="w-4 h-4" />
                  <span>Scroll to zoom in/out</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-4 h-4" />
                  <span>Click hotspots for info</span>
                </div>
                <div className="flex items-center gap-3">
                  <Maximize className="w-4 h-4" />
                  <span>Fullscreen for immersion</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4" />
                  <span>AI Tutor for explanations</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-edu-teal" />
                AI Tutor Help
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the &quot;AI Tutor&quot; button above the VR view to ask questions about what you&apos;re seeing.
              </p>
              <Button 
                onClick={() => setShowChat(true)}
                disabled={!selectedScene}
                className="w-full bg-gradient-to-r from-edu-teal to-edu-green"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Open AI Tutor Chat
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showInfo && selectedScene && (
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
                  <h2 className="text-2xl font-bold">{selectedScene.title}</h2>
                  <Button size="sm" variant="ghost" onClick={() => setShowInfo(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <img
                  src={selectedScene.image}
                  alt={selectedScene.title}
                  className="w-full rounded-xl mb-4"
                />
                <p className="text-muted-foreground mb-6">{selectedScene.description}</p>
                <h3 className="font-semibold mb-3">What You&apos;ll Learn:</h3>
                <ul className="space-y-2">
                  {selectedScene.hotspots.map((hotspot) => (
                    <li key={hotspot.name} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-edu-cyan mt-1.5" />
                      <div>
                        <span className="font-medium">{hotspot.name}:</span>{" "}
                        <span className="text-muted-foreground">{hotspot.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
