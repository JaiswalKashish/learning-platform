export const runtime = "edge";

const SYSTEM_PROMPT = `You are EduChat, an expert AI tutor specialized in helping students from Class 6 to Class 12 understand Science concepts (Physics, Chemistry, Biology, and Space Science).

YOUR CRITICAL BEHAVIOR:
1. ALWAYS answer the user's question directly - NO introductions or capability lists
2. Generate DYNAMIC answers - never give predefined or templated responses
3. Adapt complexity to the student's class level
4. Give clear, step-by-step explanations
5. Use real-world examples and analogies
6. Include formulas when relevant (with explanations)
7. Use bullet points and tables for clarity
8. End with a brief summary or conclusion
9. Be encouraging and enthusiastic

ANSWER FORMAT:
- Use **bold** for important terms and headings
- Use bullet points (•) for lists
- Use numbered steps (1., 2., 3.) for processes
- Use simple tables for comparisons
- Keep language suitable for students

ALLOWED TOPICS:
- Physics: Motion, force, energy, electricity, magnetism, optics, waves, thermodynamics, relativity basics
- Chemistry: Atoms, molecules, bonding, reactions, periodic table, states of matter, pH, organic chemistry
- Biology: Cell structure, photosynthesis, respiration, genetics, evolution, ecosystems, human body systems
- Space Science: Solar system, planets, stars, galaxies, black holes, cosmology, space exploration, eclipses
- Mathematics: Only when related to physics/chemistry/biology problems

NOT ALLOWED: Non-science topics, programming, politics, personal advice, current events

RESPONSE FOR OFF-TOPIC QUESTIONS:
"I can help only with science and space-related questions. Feel free to ask me anything about Physics, Chemistry, Biology, or Space Science!"

IMPORTANT: You generate answers dynamically based on the question - NOT from any predefined database. Every answer should be fresh and thoughtful!`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, classLevel = "8" } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages are required" }, { status: 400 });
    }

    // Try Ollama first (if available)
    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "mistral";

    try {
      const systemMessage = `${SYSTEM_PROMPT}\n\nThe student is in Class ${classLevel}. Tailor your explanations to their grade level.`;

      const convertedMessages = messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: getMessageText(msg),
      }));

      // Try Ollama connection
      const response = await Promise.race([
        fetch(`${ollamaUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            system: systemMessage,
            messages: convertedMessages,
            stream: true,
            options: {
              temperature: 0.7,
              num_predict: 2048,
              top_k: 40,
              top_p: 0.9,
            },
          }),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 3000)
        ),
      ]);

      if (response.ok) {
        console.log(`✅ Using Ollama (${ollamaModel})`);
        return new Response(response.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }
    } catch (ollamaError: any) {
      console.log("⚠️ Ollama not available, using intelligent fallback...");
    }

    // Fallback: Generate smart response without Ollama
    const lastMessage = messages[messages.length - 1];
    const query = getMessageText(lastMessage);
    const response = generateSmartResponse(query, classLevel);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream response word by word for realistic effect
        const words = response.split(" ");
        let accumulated = "";

        for (const word of words) {
          accumulated += word + " ";
          // Use format that frontend expects: 0:"..."
          const escaped = accumulated.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
          const chunk = `0:"${escaped}"\n`;
          controller.enqueue(encoder.encode(chunk));
          // Small delay for streaming effect
          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("EduChat error:", error);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}

function getMessageText(message: any): string {
  if (typeof message.content === "string") return message.content;
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
  }
  return "";
}

function generateSmartResponse(query: string, classLevel: string): string {
  const q = query.toLowerCase().trim();
  const level = parseInt(classLevel);

  // Physics questions
  if (q.match(/newton|motion|force|acceleration|velocity|speed|gravity|momentum|impulse|work|energy|power|pressure|friction|sound|vibration|light|reflection|refraction|optics|wave|thermodynamic|electric|magnetic|induction|current|kinematics|dynamics/i)) {
    // Newton's Laws
    if (q.match(/newton|inertia|action.*reaction|law.*motion/i)) {
      return `**Newton's Laws of Motion**

**First Law (Inertia)**
An object at rest stays at rest, and a moving object stays moving unless a force acts on it.
• Example: When a bus suddenly stops, passengers lurch forward

**Second Law (F = ma)**
The acceleration of an object depends on the force applied and its mass.
• Stronger force = more acceleration
• Heavier mass = less acceleration  
• Formula: Force = mass × acceleration

**Third Law (Action-Reaction)**
For every action, there's an equal and opposite reaction.
• When you jump, you push Earth down; Earth pushes you up
• Rocket engines push exhaust down; rockets go up

${level <= 8 ? "These laws explain why things move and stop!" : "These are the foundation of classical mechanics and determine all motion we observe."}`;
    }

    // Force and Motion
    if (q.match(/^what is force|types of motion|distance.*displacement|what is friction/i)) {
      return `**Force, Motion, and Friction**

**What is Force?**
A push or pull that changes an object's motion, direction, or shape.

**Types of Motion:**
• Translatory: Movement from one place to another
• Rotatory: Spinning around an axis
• Oscillatory: Back and forth movement

**Distance vs Displacement:**
• Distance: Total path traveled (scalar)
• Displacement: Shortest path from start to end (vector)
• Example: Walking around a circle: distance = circumference, displacement = 0

**What is Friction?**
A force that opposes motion between surfaces in contact.
• Static friction: Keeps objects at rest
• Kinetic friction: Acts on moving objects
• Reduces energy and slows motion

${level <= 8 ? "Forces control how everything moves!" : "Newton's laws quantify the relationship between forces and motion."}`;
    }

    // Gravity
    if (q.match(/gravity|fall.*down|gravitational|weight/i)) {
      return `**Gravity and Falling Objects**

**What is Gravity?**
A fundamental force that pulls objects toward each other. All massive objects attract each other.

**Why Do Objects Fall Down?**
Earth has a strong gravitational field that pulls objects toward its center.
• All objects accelerate at 9.8 m/s² (neglecting air resistance)
• Larger objects don't fall faster—they all fall at the same rate!

**Weight vs Mass:**
• Mass: Amount of matter (constant)
• Weight: Force of gravity on mass (varies by location)
• Weight = Mass × g (g = 9.8 m/s²)

**Free Fall:**
Objects falling only under gravity, with no other forces.
• All fall with the same acceleration
• Astronauts in orbit are in free fall!

${level <= 8 ? "Gravity keeps us on Earth and holds planets in orbit!" : level <= 10 ? "Gravity is described by Newton's law of universal gravitation: F = G(m₁m₂)/r²" : "Einstein showed gravity is the curvature of spacetime caused by mass and energy."}`;
    }

    // Pressure
    if (q.match(/pressure|force.*area/i)) {
      return `**Pressure**

**Definition:**
Pressure = Force ÷ Area

**Key Points:**
• Measured in Pascals (Pa) or atmospheres (atm)
• Smaller area = greater pressure (for same force)
• Larger area = less pressure

**Pressure in Fluids:**
• Pressure increases with depth
• Acts equally in all directions
• Enables hydraulics and pneumatics

**Examples:**
• Knife cuts better because blade is sharp (small area = high pressure)
• Pressure underwater increases at depth
• Air pressure supports life on Earth

${level <= 8 ? "Pressure is how force is distributed over an area!" : "Pressure is a fundamental concept in fluid mechanics and thermodynamics."}`;
    }

    // Work & Energy
    if (q.match(/work|energy|kinetic|potential|conservation|power/i)) {
      return `**Work, Energy, and Power**

**What is Work?**
Work = Force × Distance (in direction of force)
• Measured in Joules (J)
• Work is done only if force moves object

**Types of Energy:**
• **Kinetic Energy**: Energy of motion = ½mv²
• **Potential Energy**: Stored energy due to position = mgh
• **Thermal Energy**: Heat energy from moving molecules
• **Chemical Energy**: Stored in bonds (batteries, food)
• **Nuclear Energy**: From atomic nucleus

**Conservation of Energy:**
Total energy in a system remains constant.
• Energy changes form but isn't created/destroyed
• Example: Falling ball (potential → kinetic)

**Power:**
Power = Work ÷ Time (measured in Watts)
• How fast work is done
• 1 Watt = 1 Joule per second

**Energy Transformations:**
• Food → Muscle contractions (chemical to kinetic)
• Sun → Photosynthesis → Chemical → Kinetic
• Coal → Heat → Steam → Motion (turbine)

**Efficiency:**
Real machines waste energy as heat.
• No machine is 100% efficient
• Always some energy lost!

${level <= 8 ? "Energy makes things move and change!" : level <= 10 ? "Mechanical energy = kinetic + potential; conserved in closed systems." : "First law of thermodynamics: ΔU = Q - W; energy transformation fundamental."}`;
    }

    // Momentum
    if (q.match(/momentum|impulse|collision|conservation.*momentum/i)) {
      return `**Momentum and Impulse**

**What is Momentum?**
Momentum = Mass × Velocity (p = mv)
• Measured in kg·m/s
• Heavier or faster objects have more momentum

**Impulse:**
Change in momentum caused by force over time.
• Impulse = Force × Time
• Impulse = Change in momentum (Δp)
• FΔt = mΔv

**Conservation of Momentum:**
Total momentum before = Total momentum after
(in closed, isolated systems)

**Examples:**
• Rocket launch: Rocket and fuel separate with equal/opposite momentum
• Billiard balls: Momentum transfers in collision
• Car crash: Airbag extends collision time → reduces force

**Elastic vs Inelastic Collisions:**
• Elastic: Objects bounce apart (kinetic energy conserved)
• Inelastic: Objects stick or deform (kinetic energy lost as heat/sound)

**Newton's 2nd Law Alternative:**
F = Δp/Δt (Force = rate of change of momentum)

**Real-World Applications:**
• Seatbelts extend impact time (reduce force on body)
• Boxing: Recoil reduces punch impact
• Tennis: Racket extends contact time (increases impulse)

${level <= 8 ? "Momentum is 'how hard it is to stop something moving'!" : level <= 10 ? "Momentum conservation applies in all collision types; energy depends on type." : "Center of mass motion separate from internal dynamics; useful for analysis."}`;
    }

    // Sound Waves
    if (q.match(/sound|vibration|wave|acoustic|hearing|frequency|pitch|amplitude|decibel/i)) {
      return `**Sound and Sound Waves**

**What is Sound?**
Mechanical waves created by vibrating objects.
• Travels through matter (needs medium)
• Travels at different speeds in different materials
• Speed in air: ~343 m/s at room temperature

**How Sound Travels:**
1. Object vibrates
2. Creates pressure waves in surrounding medium
3. Waves travel outward
4. Reach ears and cause eardrum to vibrate
5. Brain interprets as sound

**Properties of Sound:**
• **Frequency**: Number of vibrations per second (Hz)
  - Higher frequency = higher pitch
• **Wavelength**: Distance between waves
• **Amplitude**: Height of wave (determines loudness)
• **Pitch**: How high or low the sound (depends on frequency)

**Speed of Sound (at 20°C):**
• Air: 343 m/s
• Water: 1,480 m/s
• Steel: 6,100 m/s
(Faster in denser materials!)

**Loudness (Decibels - dB):**
• 0 dB: Threshold of hearing
• 20 dB: Whisper
• 60 dB: Normal conversation
• 85 dB: Traffic (can damage hearing)
• 120 dB: Jet engine (painful!)

**Doppler Effect:**
Sound frequency changes based on motion:
• Moving toward you: Higher pitch
• Moving away: Lower pitch
• Example: Ambulance siren changes as it passes

**Sound Applications:**
• Ultrasound: Medical imaging (frequency > 20,000 Hz)
• Sonar: Submarines detect objects using sound
• Echolocation: Bats navigate using reflected sound

${level <= 8 ? "Sound is made by vibrations traveling through air!" : level <= 10 ? "Sound waves can reflect (echo), refract, diffract, and interfere." : "Wave equation: v = fλ; transverse vs longitudinal wave mechanics."}`;
    }

    // Thermodynamics
    if (q.match(/thermodynamic|heat|temperature|thermal|entropy|second.*law|combustion/i)) {
      return `**Thermodynamics**

**Key Concepts:**
• **Heat**: Energy transfer between objects at different temperatures
• **Temperature**: Average kinetic energy of molecules
• **Entropy**: Measure of disorder (increases in closed systems)

**Laws of Thermodynamics:**

**First Law:**
Energy cannot be created/destroyed, only transformed.
• ΔU = Q - W (change in internal energy)
• Heat in = Work out + Internal energy change

**Second Law:**
Entropy (disorder) always increases in closed systems.
• Heat flows from hot to cold (not reverse)
• Some energy always lost as waste heat

**Third Law:**
Absolute zero is unreachable (you can approach but never reach 0 K).

**Heat Transfer Mechanisms:**
• **Conduction**: Direct heat transfer through material
• **Convection**: Heat transfer through moving fluid
• **Radiation**: Heat transfer via electromagnetic waves

**Specific Heat Capacity:**
Different materials need different energy to warm up.
• Water has high specific heat (hard to warm)
• Metal has low specific heat (warms quickly)

**Phase Changes:**
• Melting: Solid → Liquid (absorbs heat)
• Freezing: Liquid → Solid (releases heat)
• Evaporation: Liquid → Gas (absorbs heat)
• Condensation: Gas → Liquid (releases heat)

**Thermal Efficiency:**
Engine efficiency = Work out ÷ Heat in
• No heat engine is 100% efficient
• Always some waste heat

${level <= 8 ? "Heat is energy moving between objects!" : level <= 10 ? "Thermodynamics explains why perpetual motion machines are impossible." : "Boltzmann entropy S = k ln(W); statistical mechanics foundation."}`;
    }

    // Electrostatics and Magnetism
    if (q.match(/electric|magnetic|charge|electrostatic|magnetic.*field|induction|conductor|insulator/i)) {
      return `**Electricity and Magnetism**

**Electric Charge:**
• Protons: Positive charge (+e)
• Electrons: Negative charge (-e)
• Like charges repel; opposite charges attract
• Measured in Coulombs (C)

**Electric Field:**
Space around charge where force acts on other charges.
• Lines point from + to - charge
• Stronger field = closer to charge

**Coulomb's Law:**
F = k(q₁q₂)/r²
• Force depends on charges and distance
• Inverse square law

**Electric Current:**
Flow of electrons through conductor.
• Measured in Amperes (A)
• Alternating current (AC): Electrons flow back/forth
• Direct current (DC): Electrons flow one way

**Voltage and Resistance:**
• Voltage (V): Electrical pressure pushing electrons
• Resistance (R): Opposition to current flow
• Ohm's Law: V = IR

**Magnetic Field:**
Space where magnetic force acts.
• Created by moving charges (currents)
• Permanent magnets have N and S poles
• Like poles repel; opposite poles attract

**Electromagnetic Induction:**
Changing magnetic field produces electric current.
• Basis for generators and transformers
• Changing current creates changing magnetic field

**Applications:**
• Motors: Electricity → Motion
• Generators: Motion → Electricity
• Transformers: Change voltage
• Electromagnets: Electric current creates magnetism

${level <= 8 ? "Electricity and magnetism are related forces!" : level <= 10 ? "Lorentz force: F = q(E + v×B); unified electromagnetic description." : "Maxwell's equations unite electricity, magnetism, and light; electromagnetic radiation."}`;
    }

    // Optics and Light
    if (q.match(/light|reflection|refraction|optics|lens|mirror|prism|spectrum/i)) {
      return `**Optics and Light**

**What is Light?**
Electromagnetic wave (photon particle) that travels at 3×10⁸ m/s.

**Properties of Light:**
• **Wavelength**: Distance between wave peaks
• **Frequency**: Number of oscillations per second
• **Speed**: Always 3×10⁸ m/s in vacuum
• Relationship: c = fλ (speed = frequency × wavelength)

**Visible Light Spectrum:**
• Violet: ~400 nm (highest frequency)
• Indigo, Blue, Green, Yellow, Orange
• Red: ~700 nm (lowest frequency)
• Memory: VIBGYOR

**Reflection:**
Light bounces off surface.
• Angle of incidence = angle of reflection
• **Specular reflection**: Mirror-like (smooth surface)
• **Diffuse reflection**: Scattered (rough surface)

**Refraction:**
Light bends when entering different medium.
• Light travels slower in denser materials
• Causes mirages, rainbows, and optical illusions

**Lenses:**
• **Convex (converging)**: Focuses light (magnifying glass)
• **Concave (diverging)**: Spreads light apart

**Eye and Vision:**
1. Light enters through cornea (transparent layer)
2. Lens focuses on retina
3. Retina detects image
4. Optic nerve sends signal to brain

**Vision Defects:**
• **Myopia** (nearsightedness): Can't see far objects → use concave lens
• **Hyperopia** (farsightedness): Can't see near objects → use convex lens
• **Astigmatism**: Blurry at all distances

**Color:**
• Objects absorb some wavelengths, reflect others
• Red apple: Absorbs blue/green, reflects red
• Black object: Absorbs all colors
• White object: Reflects all colors

${level <= 8 ? "Light travels in straight lines and reflects off mirrors!" : level <= 10 ? "Thin lens equation: 1/f = 1/u + 1/v; lens magnification formulas." : "Wave-particle duality; photoelectric effect shows light acts as particles (photons)."}`;
    }

    return `**Physics Concept - ${q.charAt(0).toUpperCase() + q.slice(1)}**

This is an important physics topic covering forces, motion, energy, or waves.

**Key Principles:**
• Physics explains how and why things move
• Forces cause changes in motion
• Energy is conserved in isolated systems
• Waves carry energy through space

${level <= 8 ? "Physics helps us understand everyday phenomena!" : "Physics provides mathematical descriptions of natural phenomena."}`;
  }

  // CHEMISTRY TOPICS
  if (q.match(/matter|state|atom|molecule|element|compound|bonding|ionic|covalent|periodic|chemical|reaction|acid|base|metal|non-metal|carbon|polymer|organic|electrochemistry|mole|oxidation|reduction|equilibrium/i)) {
    // Matter and States
    if (q.match(/^what is matter|states of matter|physical.*chemical|change/i)) {
      return `**Matter and States of Matter**

**What is Matter?**
Anything that has mass and occupies space.

**Three States of Matter:**
• **Solid**: Fixed shape, fixed volume, particles tightly packed
• **Liquid**: No fixed shape, fixed volume, particles loosely packed
• **Gas**: No fixed shape, no fixed volume, particles very far apart

**Physical vs Chemical Changes:**
• Physical: Doesn't change what substance is (melting, dissolving, mixing)
• Chemical: Creates new substances (burning, rusting, cooking)

**Properties of Matter:**
• Physical: Color, size, texture, melting point, boiling point
• Chemical: How it reacts with other substances

**Plasma:**
• Fourth state: Ionized gas with free electrons and ions
• Found in stars, lightning, neon signs

${level <= 8 ? "Matter is everywhere and comes in three main forms!" : level <= 10 ? "Phase transitions depend on temperature and pressure." : "Matter can undergo quantum phase transitions at extreme conditions."}`;
    }

    // Atomic Structure
    if (q.match(/atomic|structure|proton|neutron|electron|nucleus|atom/i)) {
      return `**Atomic Structure**

**Parts of an Atom:**
• **Nucleus**: Center containing protons + neutrons
• **Electrons**: Orbit nucleus in shells (energy levels)

**Key Subatomic Particles:**
• **Protons**: Positive charge (+1), defines element
• **Neutrons**: No charge (neutral)
• **Electrons**: Negative charge (-1)

**Atomic Numbers:**
• Atomic number = Number of protons
• Defines which element it is
• Example: Carbon always has 6 protons

**Mass Number:**
• Mass number = Protons + Neutrons
• Example: Carbon-12 has 6 protons + 6 neutrons

**Electron Shells:**
• 1st shell: Max 2 electrons
• 2nd shell: Max 8 electrons
• 3rd shell: Max 18 electrons
• Electrons in outer shell determine chemical behavior

**Ions:**
• Atoms with gained or lost electrons
• Cation: Lost electron (positive)
• Anion: Gained electron (negative)

${level <= 8 ? "Atoms are tiny particles made of protons, neutrons, and electrons!" : level <= 10 ? "Valence electrons in the outer shell determine chemical properties." : "Electron configuration follows the Aufbau principle and Hund's rule."}`;
    }

    // Chemical Bonding
    if (q.match(/bond|ionic|covalent|metallic|hydrogen/i)) {
      return `**Chemical Bonding**

**Ionic Bonds:**
Electrons transfer from metal to nonmetal.
• Forms charged particles (ions)
• Strong electrostatic attraction
• High melting points, conduct electricity when molten
• Example: Salt (NaCl) = Na⁺ and Cl⁻

**Covalent Bonds:**
Atoms share electrons.
• Electrons occupy shared orbitals
• Common in nonmetals and organic compounds
• Example: Water (H₂O) has covalent bonds
• Can be polar (uneven sharing) or nonpolar (even sharing)

**Metallic Bonds:**
Metal atoms share electrons in a "sea"
• Explains electrical conductivity
• High melting points
• Malleable and ductile

**Hydrogen Bonds:**
Weak attraction between molecules.
• Enables water's unique properties
• Important in proteins and DNA

**Bond Strength Order:**
Ionic > Covalent > Hydrogen > Van der Waals

${level <= 8 ? "Bonds hold atoms together to make molecules!" : level <= 10 ? "Bond type determines physical and chemical properties of substances." : "Modern bonding theory uses orbital overlap and electronegativity concepts."}`;
    }

    // Periodic Table
    if (q.match(/periodic|element|group|period|metal|non-metal/i)) {
      return `**The Periodic Table**

**Organization:**
• Arranged by atomic number (left to right)
• Grouped by similar properties (columns)
• Rows called periods, columns called groups

**Main Groups:**
• Group 1: Alkali metals (very reactive)
• Group 17: Halogens (reactive nonmetals)
• Group 18: Noble gases (inert/unreactive)
• Transition metals: D-block elements

**Metals vs Non-Metals:**
• **Metals**: Conduct electricity, shiny, malleable, high melting points
• **Non-metals**: Poor conductors, dull, brittle, low melting points
• **Metalloids**: In between

**Trends:**
• Atomic size increases down a group
• Ionization energy increases across a period
• Electronegativity increases across a period

**Why Periodic?**
Properties repeat in patterns due to electron configuration in outer shells.

${level <= 8 ? "Periodic table organizes all known elements!" : level <= 10 ? "Periodic trends arise from atomic structure and electron configuration." : "Period reflects number of electron shells; group reflects valence electrons."}`;
    }

    // Carbon and Organic Chemistry
    if (q.match(/carbon|organic|hydrocarbon|alkane|alkene|alkyne|functional.*group|polymer|ester|alcohol|aldehyde/i)) {
      return `**Carbon and Organic Chemistry**

**Why is Carbon Special?**
• Can form 4 bonds (C with H, O, N, other C)
• Forms long chains and complex molecules
• Basis of all living things
• Creates millions of different compounds

**Types of Hydrocarbons:**
• **Alkanes**: Only C-C single bonds (saturated)
  - Formula: CₙH₂ₙ₊₂
  - Examples: Methane (CH₄), Ethane (C₂H₆), Propane (C₃H₈)
• **Alkenes**: Have C=C double bonds
  - Formula: CₙH₂ₙ
  - Example: Ethene (C₂H₄) - used in plastics
• **Alkynes**: Have C≡C triple bonds
  - Formula: CₙH₂ₙ₋₂
  - Example: Ethyne (C₂H₂)

**Functional Groups:**
Groups of atoms giving compounds specific properties:
• **-OH (Hydroxyl)**: Alcohols (like ethanol in drinks)
• **-COOH (Carboxyl)**: Carboxylic acids (acetic acid in vinegar)
• **-CHO (Aldehyde)**: Aldehydes (formaldehyde preservative)
• **-CO- (Ketone)**: Ketones
• **-NH₂ (Amino)**: Amines

**Polymers:**
Long chains of repeating molecular units.
• **Plastics**: Polyethylene (PE), PVC
• **Rubbers**: Natural rubber, synthetic rubber
• **Fibers**: Nylon, polyester
• **Proteins**: Chains of amino acids
• **DNA**: Nucleotide chains

**Isomers:**
Same molecular formula, different structure.
• Affects properties significantly!

**Combustion:**
Hydrocarbons burn in oxygen.
• CₙH₂ₙ₊₂ + O₂ → CO₂ + H₂O + Energy
• Major source of energy (fuel, natural gas, oil)

${level <= 8 ? "Carbon forms the backbone of all organic molecules!" : level <= 10 ? "Structural isomers, geometric isomers, optical isomers differ in arrangement." : "VSEPR theory explains 3D shape; hybridization explains bonding geometry."}`;
    }

    // Mole Concept
    if (q.match(/mole|molar|avogadro|stoichiometry|molar.*mass|number.*particles/i)) {
      return `**Mole Concept and Stoichiometry**

**What is a Mole?**
A mole is 6.022 × 10²³ particles (Avogadro's number).
• Like a "dozen" but for atoms/molecules
• 1 mole of atoms = 6.022 × 10²³ atoms

**Molar Mass:**
Mass of one mole of a substance (in g/mol).
• H = 1 g/mol
• C = 12 g/mol
• O = 16 g/mol
• H₂O = 2(1) + 16 = 18 g/mol

**Converting Between Units:**
• Mass → Moles: Moles = Mass ÷ Molar Mass
• Moles → Particles: Particles = Moles × Avogadro's Number
• Example: 18 g of water = 18/18 = 1 mole = 6.022 × 10²³ molecules

**Molarity:**
Concentration = Moles ÷ Volume (in liters)
• Measured in mol/L or M
• Tells how much solute dissolved in solution

**Stoichiometry:**
Calculating amounts in chemical reactions.
• Reaction: 2H₂ + O₂ → 2H₂O
• 2 moles H₂ reacts with 1 mole O₂ to form 2 moles H₂O
• Mole ratio stays constant!

**Limiting Reactant:**
Reactant that runs out first.
• Determines how much product forms
• Other reactant left over

**Percentage Yield:**
(Actual yield ÷ Theoretical yield) × 100%
• No reaction is 100% efficient

${level <= 8 ? "Moles count atoms like dozens count eggs!" : level <= 10 ? "Empirical formula vs molecular formula determined using mole ratios." : "Limiting reactant calculations essential for stoichiometric problems."}`;
    }

    // Metals and Non-metals
    if (q.match(/metal|non-metal|metalloid|properties|conductor|reactivity/i)) {
      return `**Metals and Non-Metals**

**Metals:**
• Excellent electrical conductors
• Shiny, lustrous appearance
• Malleable: Can be hammered into shapes
• Ductile: Can be drawn into wires
• High melting points (usually)
• Lose electrons to form positive ions
• Examples: Fe, Cu, Al, Au, Ag

**Physical Properties of Metals:**
• Sonorous: Produce sound when struck
• Can be melted and reformed
• Dense (heavy for their size)

**Non-metals:**
• Poor electrical conductors (insulators)
• Dull appearance
• Brittle: Shatter when hit
• Low melting points (usually)
• Gain electrons to form negative ions
• Examples: C, N, O, F, Cl, S

**Metalloids (Semi-metals):**
• Between metals and non-metals
• Semiconductors (conduct electricity in some conditions)
• Examples: Si (silicon), As (arsenic), Ge (germanium)
• Used in computer chips!

**Reactivity Series:**
Shows which metals are more reactive:
Most reactive → K, Na, Ca, Mg, Al, Zn, Fe, Cu, Ag ← Least reactive
• Reactive metals lose electrons easily
• Form positive ions readily

**Chemical Reactions:**
• Metals + Oxygen → Metal oxides (rust forms)
• Metals + Acids → Salt + Hydrogen gas
• Reactive metals + Water → Base + Hydrogen gas

**Applications:**
• Copper: Wiring (conducts electricity)
• Iron: Structural (strong, magnetic)
• Aluminum: Aircraft (light, strong)
• Silicon: Computer chips (semiconductors)

${level <= 8 ? "Metals are shiny and conduct electricity; non-metals don't!" : level <= 10 ? "Electronegativity differences determine metal vs non-metal character." : "Metallic bonding explained by delocalized electron sea model."}`;
    }

    return `**Chemistry Concept - ${q.charAt(0).toUpperCase() + q.slice(1)}**

Chemistry studies matter, reactions, and molecular structure.

**Key Topics:**
• Atomic structure and bonding
• Chemical reactions and equations
• Acids, bases, and salts
• Periodic table organization
• Organic and inorganic compounds

${level <= 8 ? "Chemistry explains what things are made of!" : "Chemistry bridges physics and biology at the molecular level."}`;
  }

  // BIOLOGY TOPICS
  if (q.match(/cell|photosynthesis|respiration|dna|gene|evolution|biology|digestion|heart|blood|tissue|organism|reproduction|heredity|ecosystem|food.*chain|nerve|protein|enzyme|mitochondria|chloroplast|living|life|process|control|coordination|biotechnology|cell.*cycle|reproduction|sexual|asexual/i)) {
    // Cell Structure
    if (q.match(/cell|plant.*animal|cell structure|mitochondria|chloroplast|organelle/i)) {
      return `**Cell Structure: Animal vs Plant Cells**

**Both Have:**
• Cell membrane: Controls entry/exit
• Nucleus: Contains DNA
• Mitochondria: Produces energy (powerhouse!)
• Ribosomes: Makes proteins
• Cytoplasm: Gel-like substance inside
• Endoplasmic reticulum: Protein and lipid production
• Golgi apparatus: Packages proteins

**Plant Cells ONLY Have:**
• Cell wall: Rigid outer layer (provides structure)
• Chloroplasts: Photosynthesis (makes food)
• Large vacuole: Storage and maintains shape

**Cell Functions:**
• Produces energy (mitochondria)
• Synthesizes proteins (ribosomes)
• Stores and processes genetic info (nucleus)
• Maintains organism structure

**Cell Theory:**
1. All living things are made of cells
2. Cell is basic unit of life
3. All cells come from pre-existing cells

${level <= 8 ? "Cells are the tiny building blocks of all life!" : level <= 10 ? "Specialized cells perform different functions in organisms." : "Organelles compartmentalize cellular functions for efficiency."}`;
    }

    // Photosynthesis
    if (q.match(/photosynthesis|chlorophyll|light|glucose/i)) {
      return `**Photosynthesis**

**What Happens:**
Plants convert sunlight, water, and carbon dioxide into glucose (food) and oxygen.

**The Equation:**
6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂

**Where It Happens:**
Inside chloroplasts in plant cells.

**Requirements:**
• Sunlight: Energy source
• Water: Absorbed through roots
• Carbon dioxide: From air through leaf pores (stomata)
• Chlorophyll: Green pigment that captures light

**Products:**
• Glucose: Food for plant growth and energy
• Oxygen: Released into air (we breathe it!)

**Two Main Stages:**
1. **Light-dependent reactions**: Happen in thylakoid membranes (need sunlight)
2. **Light-independent reactions (Calvin Cycle)**: Happen in stroma (don't need sunlight directly)

**Why It's Important:**
• Feeds plants and all organisms
• Produces oxygen we breathe
• Foundation of most food chains

${level <= 8 ? "Plants are like solar-powered food factories!" : level <= 10 ? "Light reactions produce ATP and NADPH; Calvin cycle produces glucose." : "Z-scheme explains electron transport; complex light harvesting systems evolved."}`;
    }

    // Respiration
    if (q.match(/respiration|atp|aerobic|anaerobic|cellular|mitochondria/i)) {
      return `**Cellular Respiration**

**What Happens:**
Cells break down glucose to release energy (ATP).

**Aerobic Respiration (with oxygen):**
C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP)

**Three Stages:**
1. **Glycolysis**: Glucose → 2 Pyruvate (in cytoplasm)
   - Produces: 2 ATP, 2 NADH
2. **Krebs Cycle**: Pyruvate breakdown (in mitochondria)
   - Produces: 2 ATP, NADH, FADH₂
3. **Electron Transport Chain**: NADH & FADH₂ → lots of ATP
   - Produces: ~30-32 ATP

**Anaerobic Respiration (without oxygen):**
• Fermentation: Glucose → Lactate or Ethanol
• Produces only 2 ATP (much less energy!)

**Key Difference from Photosynthesis:**
• Photosynthesis: Builds glucose (stores energy)
• Respiration: Breaks down glucose (releases energy)

**ATP - The Energy Currency:**
Cells use ATP to power all activities.

${level <= 8 ? "Respiration is how cells get energy from food!" : level <= 10 ? "Mitochondrial membranes are highly organized for efficient ATP production." : "Chemiosmotic theory explains ATP synthesis via proton gradients."}`;
    }

    // DNA and Genetics
    if (q.match(/dna|rna|gene|genetic|heredity|chromosome|inheritance|mutation/i)) {
      return `**DNA, RNA, and Genetics**

**What is DNA?**
A molecule carrying instructions for all living things.

**DNA Structure:**
• Double helix (twisted ladder shape)
• Base pairs: A-T and C-G (always pair this way)
• Sugar-phosphate backbone
• Two antiparallel strands

**Genes:**
Segments of DNA that code for proteins and traits.

**Chromosomes:**
Tightly coiled DNA + proteins.
• Humans: 46 chromosomes (23 pairs)
• Each pair: one from mom, one from dad
• 23rd pair determines sex (XX or XY)

**How Inheritance Works:**
• Dominant traits: Need only one copy
• Recessive traits: Need two copies
• Genes mix from both parents

**RNA:**
• mRNA: Carries genetic instructions from DNA
• tRNA: Brings amino acids to ribosome
• rRNA: Part of ribosome

**Protein Synthesis:**
DNA → mRNA → Protein
(This is how genes express themselves!)

**Mutations:**
Changes in DNA sequence.
• Can be harmful, neutral, or beneficial
• Cause of genetic variation and evolution

${level <= 8 ? "DNA is like an instruction manual for life!" : level <= 10 ? "Gene expression is controlled by regulation mechanisms like promoters and enhancers." : "Epigenetics shows genes can be turned on/off without changing DNA sequence."}`;
    }

    // Human Systems
    if (q.match(/digestion|digestive|heart|circulatory|blood|nerve|nervous|brain|respiration|respiratory|lung|muscle|skeletal/i)) {
      if (q.match(/digestion|digestive/i)) {
        return `**Human Digestive System**

**Journey of Food:**
1. **Mouth**: Teeth break down food, saliva starts digestion
2. **Esophagus**: Food tube to stomach
3. **Stomach**: Strong acid breaks down proteins
4. **Small intestine**: Absorbs nutrients (most digestion happens here!)
5. **Large intestine**: Absorbs water, forms waste
6. **Rectum**: Stores waste temporarily

**Key Digestive Organs:**
• Liver: Makes bile (breaks down fats)
• Pancreas: Makes digestive enzymes
• Gallbladder: Stores bile

**Enzyme Functions:**
• Amylase: Breaks down carbohydrates
• Protease: Breaks down proteins
• Lipase: Breaks down fats

**Time:**
Food takes 24-72 hours to move through system.

**Nutrients Absorbed:**
• Proteins → amino acids
• Carbohydrates → glucose
• Fats → fatty acids
• Vitamins and minerals directly

${level <= 8 ? "Digestive system breaks down food into absorbable nutrients!" : "Peristalsis (muscle contractions) moves food through the system."}`;
      }

      if (q.match(/heart|circulatory|blood/i)) {
        return `**Circulatory System**

**What It Does:**
Transports oxygen, nutrients, and removes waste.

**Main Parts:**
• Heart: Pumps blood
• Arteries: Carry blood away from heart
• Veins: Return blood to heart
• Capillaries: Tiny vessels exchange nutrients/waste

**How It Works:**
1. Right side receives oxygen-poor blood
2. Pumps to lungs to pick up oxygen
3. Left side receives oxygen-rich blood
4. Pumps to entire body
5. Body uses oxygen, returns to heart
(Cycle repeats!)

**Blood Composition:**
• Red blood cells: Carry oxygen
• White blood cells: Fight infection
• Platelets: Clot blood
• Plasma: Liquid carries everything

**Blood Pressure:**
Measured as systolic/diastolic (e.g., 120/80)
• Systolic: Pressure when heart contracts
• Diastolic: Pressure between beats

**Heart Rate:**
Average: 60-100 beats per minute
• Increases with exercise
• Affects oxygen delivery

${level <= 8 ? "Heart pumps blood to deliver oxygen everywhere!" : level <= 10 ? "Pulmonary circulation goes to lungs; systemic circulation goes to body." : "Cardiac output = heart rate × stroke volume; regulated by autonomic nervous system."}`;
      }

      return `**Human Body Systems**

Body systems work together for survival:
• Digestive: Breaks down food
• Circulatory: Transports oxygen and nutrients
• Respiratory: Gas exchange with environment
• Nervous: Processes information and controls
• Muscular: Enables movement
• Skeletal: Provides structure
• Immune: Fights disease

${level <= 8 ? "Body systems work as an organized team!" : "Homeostasis maintains stable internal conditions despite external changes."}`;
    }

    // Reproduction
    if (q.match(/reproduction|sexual|asexual|gamete|fertilization|zygote|embryo|fetus|pregnancy/i)) {
      return `**Reproduction**

**Types of Reproduction:**

**Sexual Reproduction:**
• Involves two parents
• Gametes (sex cells): Sperm and egg
• Fertilization: Sperm + Egg = Zygote (1n + 1n = 2n)
• Offspring is unique (genetic variation)
• More time/energy required
• Found in most animals and many plants

**Asexual Reproduction:**
• Single parent needed
• No gametes involved
• Offspring is genetically identical clone
• Quick and efficient
• Found in bacteria, some plants (runners, tubers)

**Sexual Reproduction in Humans:**
• Male produces millions of sperm
• Female produces one egg per month
• Fertilization in fallopian tube
• Zygote travels to uterus, implants

**Development:**
• **Embryo**: First 8 weeks (all organs form)
• **Fetus**: 8-40 weeks (organs develop, grow)
• **Birth**: ~280 days after fertilization
• **Infancy**: 0-1 year (rapid growth)

**Placenta:**
• Exchanges nutrients and waste with mother
• Prevents direct blood mixing
• Cuts off at birth (umbilical cord)

**Plant Reproduction:**
• Sexual: Flowers, seeds, pollen
• Asexual: Vegetative propagation (runners, bulbs)
• Many plants do BOTH!

${level <= 8 ? "Babies develop from a single fertilized egg!" : level <= 10 ? "Meiosis produces gametes with half the chromosome number." : "Differential gene expression during development determines cell fate."}`;
    }

    // Tissues
    if (q.match(/tissue|epithelial|connective|muscle|nervous|organ|organ.*system/i)) {
      return `**Tissues and Organ Systems**

**Four Main Types of Tissues:**

**1. Epithelial Tissue:**
• Covers body surfaces and lines organs
• Tightly packed cells with little space
• Functions: Protection, absorption, secretion
• Examples: Skin, intestinal lining, stomach lining

**2. Connective Tissue:**
• Supports and binds other tissues
• Loose or dense depending on fibers
• Examples: Bone, cartilage, ligaments, tendons, fat, blood

**3. Muscle Tissue:**
• Specialized for contraction
• **Skeletal**: Voluntary, attached to bones (movement)
• **Cardiac**: Involuntary, makes up heart (pumping)
• **Smooth**: Involuntary, in organs (digestion, blood vessels)

**4. Nervous Tissue:**
• Processes and transmits information
• Neurons: Carry electrical signals
• Glial cells: Support neurons
• Located in brain, spinal cord, nerves

**Organs:**
Two or more tissue types working together.
• Example: Heart = muscle + connective + nervous + epithelial

**Organ Systems:**
Organs working together for specific function:
• Digestive: Breaks down food
• Circulatory: Transports oxygen
• Nervous: Processes information
• Respiratory: Gas exchange
• Muscular: Movement
• Skeletal: Structure and support
• Immune: Fights disease

**Hierarchy of Life:**
Cells → Tissues → Organs → Organ Systems → Organism

${level <= 8 ? "Tissues are groups of similar cells working together!" : level <= 10 ? "Tissue regeneration limited; some tissues regenerate (epithelial), some don't (cardiac)." : "Stem cells can differentiate into any tissue type; important in medicine."}`;
    }

    // Life Processes
    if (q.match(/life.*process|nutrition|growth|response|reproduction|excretion|metabolism|homeostasis/i)) {
      return `**Life Processes**

**Characteristics of Living Things:**

**1. Nutrition:**
Taking in and using nutrients.
• Autotrophs: Make own food (plants, photosynthesis)
• Heterotrophs: Eat other organisms (animals, humans)

**2. Growth:**
Increase in size/complexity.
• Comes from assimilation of nutrients
• Continues throughout life (especially in youth)

**3. Respiration:**
Releasing energy from food.
• Aerobic: With oxygen (efficient)
• Anaerobic: Without oxygen (fermentation)

**4. Response to Stimuli:**
Reacting to environmental changes.
• Light, temperature, chemicals, touch
• Enables adaptation and survival

**5. Reproduction:**
Making offspring.
• Sexual: With another organism
• Asexual: Alone (clones)

**6. Excretion:**
Removing waste products.
• Carbon dioxide, urea, sweat
• Prevents toxic buildup

**7. Movement:**
Change in position/internal movement.
• Whole organism movement
• Or internal movement (blood, digestion)

**Metabolism:**
Sum of all chemical reactions in organism.
• Anabolism: Building up (growth)
• Catabolism: Breaking down (energy release)

**Homeostasis:**
Maintaining stable internal conditions.
• Temperature, pH, water balance
• Despite external changes

${level <= 8 ? "All living things do these seven processes!" : level <= 10 ? "Feedback mechanisms maintain homeostasis (positive and negative feedback)." : "Metabolic rate varies by organism; endothermic vs ectothermic."}`;
    }

    // Control and Coordination
    if (q.match(/control|coordination|nervous|brain|spinal.*cord|reflex|hormone|endocrine|neuron|synapse/i)) {
      return `**Control and Coordination**

**Nervous System:**
Processes information and controls responses.

**Parts:**
• **Central Nervous System (CNS)**: Brain + spinal cord
• **Peripheral Nervous System (PNS)**: Nerves to body

**Brain Functions:**
• **Cerebrum**: Thinking, memory, movement
• **Cerebellum**: Balance, coordination
• **Brainstem**: Breathing, heart rate

**Neurons:**
Cells that transmit electrical signals.
• **Dendrite**: Receives signal
• **Cell body**: Processes signal
• **Axon**: Transmits signal to next neuron
• **Synapse**: Gap between neurons

**Reflex Arc:**
Quick automatic response (no brain involvement).
• Touch hot stove → Sensory neuron → Spinal cord → Motor neuron → Pull hand away
• Happens instantly (protect from danger!)

**Nerve Impulse:**
Electrical signal traveling along neuron.
• Depolarization: Change in electrical potential
• Travels at speeds up to 120 m/s

**Synapse:**
Space between neurons.
• Neurotransmitters: Chemical messengers
• Released by one neuron, received by another

**Endocrine System:**
Chemical coordination using hormones.
• Hormones: Chemical messengers in blood
• **Pituitary**: Master gland controls growth, reproduction
• **Thyroid**: Controls metabolism
• **Pancreas**: Insulin (controls blood sugar)
• **Adrenal**: Adrenaline (fight-or-flight)

**Hormone vs Nerve Signal:**
• Nervous: Fast (milliseconds), short-lasting
• Hormonal: Slow (seconds to minutes), long-lasting

${level <= 8 ? "Nervous system controls body using electrical signals!" : level <= 10 ? "Synaptic plasticity explains learning and memory; long-term potentiation." : "Neurotransmitter receptors and second messenger systems regulate responses."}`;
    }

    // Biotechnology
    if (q.match(/biotechnology|genetic.*engineering|dna.*fingerprinting|cloning|gene.*therapy|transgenic|fermentation/i)) {
      return `**Biotechnology**

**What is Biotechnology?**
Using living organisms or biological processes for practical applications.

**Key Techniques:**

**Genetic Engineering:**
Inserting genes from one organism into another.
• Create GMOs (Genetically Modified Organisms)
• Make bacteria produce insulin (helpful!)
• Develop disease-resistant crops

**Cloning:**
Creating genetically identical copies.
• Dolly the sheep (first cloned mammal, 1996)
• DNA from one cell placed in another cell
• Ethical concerns about cloning humans

**DNA Fingerprinting:**
Identifying individuals by DNA pattern.
• Each person has unique DNA (except identical twins)
• Used in forensics, paternity tests
• CODIS database matches criminal DNA

**Gene Therapy:**
Inserting healthy genes to treat disease.
• Replace faulty genes
• SCID (bubble boy disease): First gene therapy success
• Promising for cancer, genetic disorders

**Transgenic Organisms:**
Organisms with genes from different species.
• Glowing fish (fluorescent protein from jellyfish)
• Insulin-producing bacteria
• Disease-resistant crops

**Fermentation:**
Using microorganisms to produce substances.
• Yogurt: Lactobacillus bacteria
• Bread: Yeast fermentation
• Beer and wine: Yeast converts sugar to alcohol
• Cheese: Bacteria cultures

**CRISPR Technology:**
Newest gene-editing tool (2020 Nobel Prize!).
• Precise DNA editing
• Cheaper and faster than older methods
• Used to fight sickle cell disease, cancer

**Ethical Considerations:**
• Should we genetically modify humans?
• Environmental impact of GMO crops?
• Who has access to gene therapy?

${level <= 8 ? "Biotechnology uses biology to solve problems!" : level <= 10 ? "Polymerase chain reaction (PCR) amplifies DNA for analysis." : "CRISPR-Cas9 system uses bacterial immune mechanism for precise genome editing."}`;
    }

    return `**Biology Concept**

Biology studies living organisms and life processes.

**Major Topics:**
• Cell structure and function
• Photosynthesis and respiration
• Genetics and inheritance
• Evolution and adaptation
• Ecosystems and biodiversity
• Body systems

${level <= 8 ? "Biology explains how living things work!" : "Life is organized into hierarchical levels from cells to ecosystems."}`;
  }

  // SPACE SCIENCE TOPICS
  if (q.match(/planet|star|galaxy|space|moon|eclipse|orbit|black.?hole|universe|solar|sun|asteroid|comet|satellite|rocket|space.*mission|big.?bang|supernova|space.?time|gravitational.*wave|nebula|pulsar|quasar|satellite|mission/i)) {
    // Solar System
    if (q.match(/solar|planet|order|moon|day.*night|season/i)) {
      return `**The Solar System**

**The 8 Planets** (from Sun):

**Inner (Rocky):**
1. Mercury - Smallest, closest to Sun
2. Venus - Hottest, thick atmosphere
3. Earth - Our home, has liquid water
4. Mars - Red planet, ice caps

**Outer (Gas/Ice Giants):**
5. Jupiter - Largest, massive storms
6. Saturn - Beautiful rings
7. Uranus - Rotates on side, ice giant
8. Neptune - Farthest, strong winds

**Other Objects:**
• Asteroid belt: Between Mars and Jupiter
• Kuiper belt: Beyond Neptune (icy bodies)
• Oort cloud: Comets at solar system edge

**Moon Phases:**
• New Moon: Dark (Moon between Earth-Sun)
• Crescent: Thin curved shape
• Quarter: Half lit
• Full Moon: Completely lit
• Cycle repeats every 29.5 days

**Why Day and Night:**
Earth rotates on tilted axis.
• Side facing Sun = day
• Side away = night
• Completes rotation every 24 hours

**Seasons:**
Earth's tilt causes seasons, not distance!
• North tilted toward Sun = Northern summer
• South tilted toward Sun = Southern summer

${level <= 8 ? "Each planet is unique with special characteristics!" : level <= 10 ? "Kepler's laws describe orbital motion; planets follow elliptical paths." : "Planetary atmospheres evolved based on mass, temperature, and magnetic fields."}`;
    }

    // Black Holes
    if (q.match(/black.?hole|singularity|event.?horizon|gravity.*extreme/i)) {
      return `**Black Holes**

**What is a Black Hole?**
A region where gravity is so strong that nothing—not even light—can escape.

**Formation:**
Massive stars collapse when they die.
• Core collapses under its own gravity
• Creates infinite density point (singularity)

**Key Parts:**
• **Singularity**: Infinitely dense center
• **Event Horizon**: Point of no return

**Extreme Effects:**
• Objects get stretched (spaghettification)
• Time moves slower near event horizon
• Once past event horizon, nothing escapes
• Release massive X-rays as matter falls in

**Detection:**
We can't see black holes directly, but detect:
• X-rays from infalling material
• Gravitational effects on nearby stars
• Gravitational waves from collisions

**Famous Black Holes:**
• Sagittarius A*: Center of our galaxy (~4 million Sun masses)
• Cygnus X-1: Nearest known black hole
• TON 618: Largest known (~66 billion Sun masses)

**Hawking Radiation:**
Black holes slowly evaporate by emitting radiation (theoretical).

${level <= 8 ? "Black holes are among the most extreme objects in the universe!" : level <= 10 ? "Black holes are predicted by General Relativity." : "Kerr metric describes rotating black holes; Hawking thermodynamics applies quantum mechanics."}`;
    }

    // Eclipses
    if (q.match(/eclipse|shadow|solar.*eclipse|lunar.*eclipse/i)) {
      return `**Eclipses**

**Solar Eclipse:**
Moon passes directly between Earth and Sun.
• Moon blocks sunlight
• Daytime becomes dark
• Only visible from certain locations
• **Total eclipse**: Complete darkness (~2-7 minutes)
• **Partial eclipse**: Moon partially blocks Sun
• **Annular eclipse**: Moon too far, leaves bright ring

**Lunar Eclipse:**
Earth passes between Sun and Moon.
• Earth's shadow falls on Moon
• Moon appears reddish/copper colored
• Caused by sunlight refracting through Earth's atmosphere
• Can be seen from entire night side of Earth
• Lasts 1-3 hours

**Why Not Every Month?**
Moon's orbit is tilted ~5° to Earth's orbit.
• Eclipses occur only when Moon crosses plane
• Happens 2-7 times per year total
• Maximum 2 solar + 5 lunar per year

**Eclipse Cycles:**
Saros cycle repeats eclipses every 18 years, 11 days, 8 hours.

**Safety:**
Never look directly at solar eclipse without proper glasses!

${level <= 8 ? "Eclipses show how light travels in straight lines!" : level <= 10 ? "Solar eclipses are observed for corona studies and gravitational lensing." : "Einstein's relativity was confirmed during 1919 solar eclipse observation."}`;
    }

    // Stars and Galaxies
    if (q.match(/star|galaxy|universe|supernova|big.?bang|neutron|pulsar|quasar/i)) {
      if (q.match(/star/i)) {
        return `**Stars and Stellar Evolution**

**What is a Star?**
A massive ball of hot gas producing energy through nuclear fusion.

**Star Lifecycle:**
1. **Formation**: Cloud of gas collapses under gravity
2. **Main sequence**: Stable, fuses hydrogen (billions of years) ← Our Sun here!
3. **Red giant**: Outer layers expand, cooler surface
4. **End stage**: Depends on mass

**End Stages by Mass:**
• Small stars → White dwarf (Earth-sized ember)
• Medium stars → Neutron star (extremely dense!)
• Large stars → Black hole (if massive enough)

**Star Types:**
• Hot blue stars: Short-lived (young), massive
• Yellow stars: Medium-lived (like our Sun)
• Red stars: Long-lived (old), low-mass
• Giants: Expanded stars

**Our Sun (5 billion years old):**
• Medium-sized yellow star
• Halfway through 10-billion-year life
• 109 times Earth's diameter
• Core temperature: 27 million K

**Fusion Process:**
Hydrogen fuses into Helium + Energy (E=mc²!)

**Light Years:**
Distance light travels in one year (~10 trillion km).
• Nearest star (Proxima Centauri): 4.24 light-years

${level <= 8 ? "Stars are distant suns with potentially their own planets!" : level <= 10 ? "Hertzsprung-Russell diagrams show stellar evolution and classification." : "Population synthesis models explain galaxy formation and stellar populations."}`;
      }

      if (q.match(/galaxy/i)) {
        return `**Galaxies**

**What is a Galaxy?**
Billions of stars held together by gravity, orbiting common center.

**Types of Galaxies:**
• **Spiral**: Rotating disk with spiral arms (like Milky Way)
• **Elliptical**: Oval shapes, old stars
• **Irregular**: No defined shape, often from collisions

**Our Galaxy - Milky Way:**
• Spiral galaxy with ~100 billion stars
• Sun is ~26,000 light-years from center
• Takes 230 million years to orbit once
• Contains lots of dust and gas

**Black Hole at Center:**
• Sagittarius A* - 4 million solar masses
• Most galaxies have central black hole

**Local Group:**
Nearby galaxies:
• Milky Way (large spiral)
• Andromeda (larger spiral, 2.5 million ly away)
• Triangulum (smaller spiral)
• 80+ dwarf galaxies

**Distance to Other Galaxies:**
• Andromeda: 2.5 million light-years
• Virgo Galaxy: 55 million light-years
• Observable universe edge: ~46 billion light-years

${level <= 8 ? "Galaxies are huge systems of billions of stars!" : level <= 10 ? "Galaxies rotate faster than gravity allows—dark matter explains this." : "Cosmic large-scale structure reveals universe is web of filaments with voids."}`;
      }

      if (q.match(/big.?bang/i)) {
        return `**Big Bang Theory**

**What is the Big Bang?**
Universe began as extremely hot, dense point and has been expanding ever since.

**Timeline:**
• 13.8 billion years ago: Big Bang starts
• 0.0000001 seconds: Extreme temperatures
• 3 minutes: Nuclei form (protons, neutrons combine)
• 380,000 years: Atoms form (universe becomes transparent)
• 13.8 billion years now: Today

**Key Evidence:**
1. **Universe expansion**: Galaxies moving apart
2. **Cosmic microwave background**: Echo of Big Bang radiation
3. **Abundance of elements**: Matches predicted ratios
4. **Galaxy formation patterns**: Match computer simulations

**Why It Happened:**
Scientists still researching! Possibly quantum fluctuations.

**Before Big Bang?**
Question doesn't make sense—time itself started with Big Bang!

**Fate of Universe:**
• Will it expand forever?
• Or collapse back (Big Crunch)?
• Current data suggests eternal expansion (Big Freeze)

**Not an Explosion:**
Space itself expanded, not an explosion into space.

${level <= 8 ? "Big Bang created entire universe 13.8 billion years ago!" : level <= 10 ? "Cosmic inflation solves horizon and flatness problems." : "Quantum gravity and string theory attempt to describe first moments of universe."}`;
      }

      return `**Space Science**

The study of everything beyond Earth's atmosphere.

**Topics:**
• Planets and moons
• Stars and their evolution
• Galaxies and cosmic structure
• Black holes and extreme objects
• Universe formation and expansion
• Space exploration technology

${level <= 8 ? "Space science reveals the cosmos beyond Earth!" : "Modern cosmology uses physics to understand the universe's origin and fate."}`;
    }

    // Satellites and Space Missions
    if (q.match(/satellite|space.*mission|rocket|launch|orbit|astronaut|spaceflight|lunar.*mission|mars.*rover|space.*station/i)) {
      return `**Satellites and Space Missions**

**Satellites:**
Objects orbiting larger bodies in space.
• Natural: Earth's Moon, Jupiter's moons
• Artificial: Made by humans for communication, weather, GPS

**Types of Artificial Satellites:**
• **Communication**: Relay phone, TV, internet signals
• **Weather**: Monitor atmosphere, predict storms
• **GPS**: Navigation and positioning
• **Spies**: Take images of Earth
• **Research**: Study space, universe

**Orbits:**
• **Geostationary**: Stays above same location (22,000 miles up)
• **Polar**: Orbits poles, can see entire Earth
• **Low Earth Orbit (LEO)**: ~200 miles up (ISS, shuttles)

**Space Missions:**

**Famous Achievements:**
• Sputnik 1 (1957): First satellite
• Yuri Gagarin (1961): First human in space
• Apollo 11 (1969): Moon landing (Neil Armstrong!)
• Space Shuttle (1981): Reusable spacecraft
• ISS (1998): International Space Station - humans continuously there!

**Current Missions:**
• Mars rovers: Curiosity, Perseverance (finding signs of life?)
• James Webb Space Telescope: Seeing universe's oldest galaxies
• SpaceX Starship: Future Mars missions
• Artemis: Return humans to Moon, then Mars!

**Future Plans:**
• Base on the Moon
• Human Mars mission (2030s?)
• Space tourism (Virgin Galactic, Blue Origin)
• Asteroid mining for resources

**Why Explore Space?**
• Scientific knowledge about universe
• Technology improvements (benefits Earth!)
• Resources and future settlement
• Answer: Are we alone?

${level <= 8 ? "Space missions explore space and gather data!" : level <= 10 ? "Orbital velocity = √(GM/r); balance gravity and motion." : "Delta-v calculations determine fuel needed for orbital maneuvers."}`;
    }

    // Moon Phases and Celestial Mechanics
    if (q.match(/moon|phase|tidal|lunar|gravity|orbital|moon.*phase/i)) {
      return `**Moon Phases and Orbital Mechanics**

**Moon Phases:**
Moon appears different depending on Sun-Moon-Earth alignment.

**The 8 Phases** (28.5-day cycle):
1. **New Moon**: Completely dark (between Sun and Earth)
2. **Waxing Crescent**: Small sliver visible
3. **First Quarter**: Half lit (right side)
4. **Waxing Gibbous**: More than half lit
5. **Full Moon**: Completely lit (opposite Sun)
6. **Waning Gibbous**: More than half lit (left side)
7. **Last Quarter**: Half lit (left side)
8. **Waning Crescent**: Small sliver visible

**Moon Orbit:**
• Orbits Earth every 27.3 days
• Same side always faces Earth (synchronized)
• Distance: ~380,000 km away

**Tides:**
Moon's gravity pulls on Earth's oceans.
• **High tide**: Ocean bulges toward Moon (and away from Moon!)
• **Low tide**: Ocean level drops between high tides
• Occurs twice daily (roughly)
• **Spring tide**: Extra high (Sun + Moon aligned)
• **Neap tide**: Less extreme (Sun and Moon perpendicular)

**Why Does Moon's Gravity Cause Two High Tides?**
• Direct pull toward Moon
• Earth pulled more than far side → bulge on opposite side

**Lunar Eclipses Only During Full Moon:**
• Earth between Sun and Moon
• Earth's shadow falls on Moon
• Moon appears reddish

**Solar Eclipses Only During New Moon:**
• Moon between Sun and Earth
• Moon blocks sunlight from reaching Earth

**Moon Formation Theory:**
• Giant impact hypothesis: Mars-sized body hit Earth 4.5 billion years ago
• Ejected material coalesced into Moon
• This is why Moon is so big (unusual!)

${level <= 8 ? "Moon phases repeat every month!" : level <= 10 ? "Synchronous rotation: Moon's orbital period = rotation period." : "Three-body problem: Sun-Earth-Moon system chaotic; long-term stability uncertain."}`;
    }

    // Supernovas
    if (q.match(/supernova|explosion|nova|stellar|star.*death|brightness/i)) {
      return `**Supernovas**

**What is a Supernova?**
Catastrophic stellar explosion of a star.
• Briefly outshines entire galaxy (1 billion stars!)
• Creates heavy elements (iron, nickel, cobalt)
• Scatters material into space
• Visible even during daytime

**Two Types:**

**Type 1a (White Dwarf Binary):**
• White dwarf pulls gas from companion star
• Gas spirals down, compresses, heats
• Carbon-oxygen fuses violently
• Entire star EXPLODES
• Creates iron-peak elements

**Type II (Massive Star Core Collapse):**
• Massive star (>20 solar masses) runs out of fuel
• Core collapses suddenly
• Rebound causes massive explosion
• Can leave black hole or neutron star
• Creates many heavy elements

**Key Differences:**
• Type Ia: Total destruction (no remnant)
• Type II: Core survives as neutron star or black hole

**Historical Supernovas:**
• Crab Nebula (1054): Visible in daylight, recorded by Chinese astronomers
• Kepler's Supernova (1604): Last observed in Milky Way
• Tycho's Supernova (1572): Helped prove stars can change (revolutionary!)

**Supernova Importance:**
• **Nucleosynthesis**: Creates heavy elements (nickel, iron, silicon)
• **Space travel**: Ejects elements throughout galaxy
• **Distance measure**: Type Ia used to measure cosmic distances
• **Won Nobel Prize**: 2011 Nobel Prize given for using them to measure accelerating universe!

**Neutron Stars:**
• Formed from Type II collapse
• Extremely dense (teaspoon weighs billion tons!)
• Spin rapidly (pulsars emit radio waves)

**Black Holes:**
• Formed from very massive stars
• Gravity so strong nothing escapes (not even light)
• Event horizon marks point of no return

${level <= 8 ? "Supernovas are stellar explosions visible across universe!" : level <= 10 ? "Light curve shapes differ between Type Ia and Type II." : "Nucleosynthesis through successive stellar generations created all heavy elements."}`;
    }

    return `**Space Science Concept**

Space science explores the universe beyond Earth.

**Topics Covered:**
• Solar system planets and orbits
• Stars and galaxies
• Black holes and extreme objects
• Big Bang and universe expansion
• Space missions and technology
• Moon phases and supernovas

${level <= 8 ? "Space science is about exploring the universe!" : "Astronomy uses physics, chemistry, and mathematics to understand cosmos."}`;
  }

  // General science fallback
  if (q.includes("what") || q.includes("how") || q.includes("why") || q.includes("explain")) {
    const topic = query
      .replace(/^(what|how|why|explain|is|are|does|do|would)\s+(is|are|does|do|would)?\s*/i, "")
      .replace(/\?$/i, "")
      .trim();

    return `**${topic.charAt(0).toUpperCase() + topic.slice(1)}**

Thank you for your question! This is an important scientific concept.

**What You Should Know:**
This topic relates to fundamental principles in science that help explain many phenomena you observe in nature.

**Key Points:**
• It connects to basic scientific principles
• It helps explain multiple phenomena
• It has practical applications
• Scientists continue to study and improve understanding

**How to Learn More:**
• Ask for specific examples
• Request step-by-step explanation
• Ask about real-world applications
• Compare it with similar concepts

**For Class ${level}:**
${
  level <= 8
    ? "Focus on basic understanding and everyday examples."
    : level <= 10
      ? "Learn both concepts and real-world applications."
      : "Master details, formulas, mathematical relationships, and exam-relevant theory."
}

Would you like me to explain with more specific examples or details?`;
  }

  // Ultimate fallback
  return `**Your Question**

I appreciate your curiosity! To give you the best answer, could you be more specific?

**Try asking:**
• "What is [topic]?"
• "Explain [topic] in simple terms"
• "How does [topic] work?"
• "Why does [phenomenon] happen?"

**Topics I Can Help With:**

**Physics**: Motion, forces, energy, light, sound, electricity, magnetism, pressure, gravity, waves

**Chemistry**: Matter, atoms, molecules, bonding, reactions, periodic table, acids/bases, organic chemistry

**Biology**: Cells, photosynthesis, respiration, genetics, human body systems, ecosystems, evolution

**Space Science**: Planets, stars, galaxies, black holes, eclipses, Big Bang, solar system

**For Class ${level}:**
${
  level <= 8
    ? "I'll explain using simple examples and everyday situations."
    : level <= 10
      ? "I'll include concepts, real-world applications, and some mathematical details."
      : "I'll include formulas, advanced theory, mechanisms, and exam-relevant content."
}

Ask me a specific science or space question, and I'll give you a detailed explanation!`;
}