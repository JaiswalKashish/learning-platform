/**
 * Central Model Configuration for EduVerse AR/VR Modules
 * 
 * This file contains URLs for high-fidelity educational 3D models.
 * Sources prioritized:
 * - Sketchfab Education (Human Anatomy, Biology)
 * - NASA 3D Resources (Solar System, Space Science)
 * - Smithsonian 3D (Physics, History artifacts)
 * - Artec 3D (High-precision Science & Education scans)
 * 
 * To add a new model:
 * 1. Find a .glb or .gltf model from the sources above
 * 2. Download the "Autoconverted format (glTF)" or GLB version
 * 3. Place in /public/models/ directory
 * 4. Add entry to the appropriate category below
 * 5. Change source from 'placeholder' to actual source
 * 
 * Model Requirements:
 * - Format: .glb (preferred) or .gltf
 * - Size: Under 50MB recommended for web performance
 * - License: Ensure CC-BY or educational use license
 * 
 * IMPORTANT: Models with source: 'placeholder' will automatically
 * use procedural Three.js fallback models for visualization.
 */

export interface ModelConfig {
  id: string;
  name: string;
  path: string;
  source: 'sketchfab' | 'nasa' | 'smithsonian' | 'artec' | 'custom' | 'placeholder';
  sourceUrl?: string;
  license?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  hotspots?: {
    name: string;
    description: string;
    position: [number, number, number];
  }[];
}

export interface ModelCategory {
  id: string;
  name: string;
  models: ModelConfig[];
}

/**
 * Physics Models
 * Sources: Smithsonian 3D, Sketchfab Education
 * 
 * To replace with real models:
 * 1. Download from Sketchfab: https://sketchfab.com/search?q=physics+education&type=models
 * 2. Save to: public/models/physics/[model-name].glb
 * 3. Update path and change source to 'sketchfab'
 */
export const physicsModels: ModelConfig[] = [
  {
    id: "human-eye",
    name: "Human Eye & Lens",
    path: "/models/physics/human-eye.glb",
    source: "placeholder",
    sourceUrl: "https://sketchfab.com/3d-models/human-eye-anatomy",
    license: "CC-BY-4.0",
    scale: 1,
    hotspots: [
      { name: "Cornea", description: "Transparent front layer that refracts light", position: [0, 0, 1.2] },
      { name: "Iris", description: "Colored part that controls light entry", position: [0, 0, 0.8] },
      { name: "Lens", description: "Focuses light onto the retina", position: [0, 0, 0.3] },
      { name: "Retina", description: "Light-sensitive layer with photoreceptors", position: [0, 0, -0.8] },
    ]
  },
  {
    id: "simple-machines",
    name: "Simple Machines",
    path: "/models/physics/simple-machines.glb",
    source: "placeholder",
    sourceUrl: "https://sketchfab.com/3d-models/simple-machines",
    scale: 1,
    hotspots: [
      { name: "Lever", description: "Rigid bar rotating around fulcrum", position: [-1, 0, 0] },
      { name: "Pulley", description: "Wheel with groove for rope", position: [1.5, 1, 0] },
      { name: "Inclined Plane", description: "Sloped surface reduces force", position: [0, -0.5, 1] },
    ]
  },
  {
    id: "electric-circuits",
    name: "Electric Circuits",
    path: "/models/physics/electric-circuits.glb",
    source: "placeholder",
    scale: 1,
    hotspots: [
      { name: "Battery", description: "Source of electrical energy", position: [-1.5, 0, 0] },
      { name: "Switch", description: "Controls current flow", position: [0, 0.5, 0] },
      { name: "Light Bulb", description: "Converts electricity to light", position: [1.5, 0, 0] },
    ]
  },
  {
    id: "magnet-compass",
    name: "Magnet & Compass",
    path: "/models/physics/magnet-compass.glb",
    source: "placeholder",
    scale: 1,
    hotspots: [
      { name: "North Pole", description: "Magnetic north end", position: [0, 0, 1] },
      { name: "South Pole", description: "Magnetic south end", position: [0, 0, -1] },
      { name: "Field Lines", description: "Invisible lines of magnetic force", position: [0, 0.5, 0] },
    ]
  },
];

/**
 * Chemistry Models
 * Sources: Sketchfab Education, Custom molecular visualizations
 * 
 * To replace with real models:
 * 1. Download from Sketchfab: https://sketchfab.com/search?q=molecule+chemistry&type=models
 * 2. Save to: public/models/chemistry/[model-name].glb
 * 3. Update path and change source to 'sketchfab'
 */
export const chemistryModels: ModelConfig[] = [
  {
    id: "water-molecule",
    name: "Water Molecule (H₂O)",
    path: "/models/chemistry/water-molecule.glb",
    source: "placeholder",
    sourceUrl: "https://sketchfab.com/3d-models/water-molecule",
    scale: 2,
    hotspots: [
      { name: "Oxygen", description: "Central oxygen atom (red)", position: [0, 0, 0] },
      { name: "Hydrogen 1", description: "First hydrogen atom", position: [-0.8, 0.6, 0] },
      { name: "Hydrogen 2", description: "Second hydrogen atom", position: [0.8, 0.6, 0] },
      { name: "Bond Angle", description: "104.5° angle between H-O-H", position: [0, 0.3, 0] },
    ]
  },
  {
    id: "carbon-compounds",
    name: "Carbon Compounds (Methane)",
    path: "/models/chemistry/methane.glb",
    source: "placeholder",
    scale: 2,
    hotspots: [
      { name: "Carbon", description: "Central carbon (sp³ hybridized)", position: [0, 0, 0] },
      { name: "Hydrogen Atoms", description: "Four hydrogen atoms bonded", position: [0.5, 0.5, 0.5] },
      { name: "Tetrahedral", description: "109.5° bond angles", position: [0.25, 0.25, 0.25] },
    ]
  },
  {
    id: "periodic-elements",
    name: "Atomic Structure",
    path: "/models/chemistry/atom-structure.glb",
    source: "placeholder",
    scale: 1.5,
    hotspots: [
      { name: "Nucleus", description: "Protons and neutrons", position: [0, 0, 0] },
      { name: "Electron Shell 1", description: "First energy level", position: [0.8, 0, 0] },
      { name: "Electron Shell 2", description: "Second energy level", position: [1.2, 0, 0] },
    ]
  },
  {
    id: "crystal-structures",
    name: "Crystal Lattice (NaCl)",
    path: "/models/chemistry/nacl-crystal.glb",
    source: "placeholder",
    scale: 1,
    hotspots: [
      { name: "Sodium Ion", description: "Na⁺ cation", position: [0, 0, 0] },
      { name: "Chloride Ion", description: "Cl⁻ anion", position: [1, 0, 0] },
      { name: "Ionic Bond", description: "Electrostatic attraction", position: [0.5, 0, 0] },
    ]
  },
];

/**
 * Biology Models
 * Sources: Sketchfab Education (Anatomy), NIH 3D Print Exchange
 * 
 * To replace with real models:
 * 1. Download from Sketchfab: https://sketchfab.com/search?q=human+anatomy&type=models
 * 2. Or NIH 3D: https://3dprint.nih.gov/discover
 * 3. Save to: public/models/biology/[model-name].glb
 * 4. Update path and change source to 'sketchfab'
 */
export const biologyModels: ModelConfig[] = [
  {
    id: "human-heart",
    name: "Human Heart",
    path: "/models/biology/human-heart.glb",
    source: "placeholder",
    sourceUrl: "https://sketchfab.com/3d-models/human-heart-anatomy",
    license: "CC-BY-4.0",
    scale: 1.5,
    hotspots: [
      { name: "Left Atrium", description: "Receives oxygenated blood from lungs", position: [-0.5, 0.5, 0] },
      { name: "Right Atrium", description: "Receives deoxygenated blood", position: [0.5, 0.5, 0] },
      { name: "Left Ventricle", description: "Pumps blood to body", position: [-0.5, -0.5, 0] },
      { name: "Aorta", description: "Main artery from heart", position: [0, 1, 0] },
    ]
  },
  {
    id: "lungs",
    name: "Human Lungs",
    path: "/models/biology/human-lungs.glb",
    source: "placeholder",
    scale: 1.2,
    hotspots: [
      { name: "Trachea", description: "Windpipe carrying air", position: [0, 1, 0] },
      { name: "Bronchi", description: "Main airways to lungs", position: [0, 0.5, 0] },
      { name: "Alveoli", description: "Air sacs for gas exchange", position: [0, -0.5, 0] },
    ]
  },
  {
    id: "plant-cell",
    name: "Plant Cell",
    path: "/models/biology/plant-cell.glb",
    source: "placeholder",
    scale: 2,
    hotspots: [
      { name: "Cell Wall", description: "Rigid outer layer", position: [0, 0, 1.2] },
      { name: "Nucleus", description: "Contains genetic material", position: [0, 0, 0] },
      { name: "Chloroplast", description: "Photosynthesis site", position: [-0.5, 0.3, 0] },
      { name: "Vacuole", description: "Storage compartment", position: [0, -0.3, 0] },
    ]
  },
  {
    id: "digestive-system",
    name: "Digestive System",
    path: "/models/biology/digestive-system.glb",
    source: "placeholder",
    scale: 0.8,
    hotspots: [
      { name: "Esophagus", description: "Tube to stomach", position: [0, 1, 0] },
      { name: "Stomach", description: "Breaks down food", position: [0, 0.3, 0] },
      { name: "Small Intestine", description: "Absorbs nutrients", position: [0, -0.3, 0] },
      { name: "Large Intestine", description: "Absorbs water", position: [0, -0.8, 0] },
    ]
  },
];

/**
 * Space Science Models
 * Sources: NASA 3D Resources (Primary), Smithsonian 3D
 * 
 * To replace with real models:
 * 1. Download from NASA 3D: https://nasa3d.arc.nasa.gov/models
 * 2. Save to: public/models/space/[model-name].glb
 * 3. Update path and change source to 'nasa'
 */
export const spaceModels: ModelConfig[] = [
  {
    id: "solar-system",
    name: "Solar System",
    path: "/models/space/solar-system.glb",
    source: "placeholder",
    sourceUrl: "https://nasa3d.arc.nasa.gov/models",
    license: "Public Domain",
    scale: 0.5,
    hotspots: [
      { name: "Sun", description: "Our star - 99.86% of solar mass", position: [0, 0, 0] },
      { name: "Earth", description: "Our home planet", position: [3, 0, 0] },
      { name: "Mars", description: "The Red Planet", position: [4.5, 0, 0] },
      { name: "Jupiter", description: "Largest planet", position: [8, 0, 0] },
    ]
  },
  {
    id: "moon-phases",
    name: "Moon Phases",
    path: "/models/space/moon.glb",
    source: "placeholder",
    sourceUrl: "https://nasa3d.arc.nasa.gov/detail/moon",
    license: "Public Domain",
    scale: 1,
    hotspots: [
      { name: "New Moon", description: "Moon not visible", position: [-1.5, 0, 0] },
      { name: "Full Moon", description: "Entire face lit", position: [1.5, 0, 0] },
    ]
  },
  {
    id: "earth-layers",
    name: "Earth Layers",
    path: "/models/space/earth-layers.glb",
    source: "placeholder",
    sourceUrl: "https://nasa3d.arc.nasa.gov/detail/earth",
    scale: 1.2,
    hotspots: [
      { name: "Inner Core", description: "Solid iron center", position: [0, 0, 0] },
      { name: "Outer Core", description: "Liquid iron layer", position: [0, 0, 0.3] },
      { name: "Mantle", description: "Hot, dense rock", position: [0, 0, 0.6] },
      { name: "Crust", description: "Thin outer shell", position: [0, 0, 1] },
    ]
  },
];

/**
 * Engineering Models
 * Sources: Smithsonian 3D, Sketchfab Education
 * 
 * To replace with real models:
 * 1. Download from Sketchfab: https://sketchfab.com/search?q=engineering+bridge&type=models
 * 2. Save to: public/models/engineering/[model-name].glb
 * 3. Update path and change source to 'sketchfab'
 */
export const engineeringModels: ModelConfig[] = [
  {
    id: "bridge-structures",
    name: "Bridge Structures",
    path: "/models/engineering/bridge.glb",
    source: "placeholder",
    scale: 0.5,
    hotspots: [
      { name: "Tension", description: "Material being pulled", position: [0, -0.5, 0] },
      { name: "Compression", description: "Material being pushed", position: [0, 0.5, 0] },
      { name: "Support", description: "Load transfer point", position: [-2, -1, 0] },
    ]
  },
  {
    id: "wind-tunnel",
    name: "Wind Tunnel",
    path: "/models/engineering/wind-tunnel.glb",
    source: "placeholder",
    scale: 0.8,
    hotspots: [
      { name: "Laminar Flow", description: "Smooth air layers", position: [-2, 0, 0] },
      { name: "Turbulence", description: "Chaotic movement", position: [2, 0, 0] },
      { name: "Drag", description: "Resistance force", position: [0, 0, 0] },
    ]
  },
];

export const allModels: ModelCategory[] = [
  { id: "physics", name: "Physics", models: physicsModels },
  { id: "chemistry", name: "Chemistry", models: chemistryModels },
  { id: "biology", name: "Biology", models: biologyModels },
  { id: "space", name: "Space Science", models: spaceModels },
  { id: "engineering", name: "Engineering", models: engineeringModels },
];

export function getModelById(id: string): ModelConfig | undefined {
  for (const category of allModels) {
    const model = category.models.find(m => m.id === id);
    if (model) return model;
  }
  return undefined;
}

export function getModelsByCategory(categoryId: string): ModelConfig[] {
  const category = allModels.find(c => c.id === categoryId);
  return category?.models || [];
}

export function isModelAvailable(config: ModelConfig): boolean {
  return config.source !== 'placeholder';
}

export function getDefaultFallbackConfig(category: string): ModelConfig {
  return {
    id: `fallback-${category}`,
    name: `${category} Model`,
    path: `/models/${category}/default.glb`,
    source: 'placeholder',
    scale: 1,
    hotspots: [],
  };
}
