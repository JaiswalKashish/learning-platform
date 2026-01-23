"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, 
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Atom,
  FlaskConical,
  Heart,
  Rocket,
  Medal,
  Target,
  Zap,
  Star,
  Crown,
  ChevronRight,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
  avatar: string;
  totalQuizzes: number;
}

interface StudentScore {
  name: string;
  scores: Array<{
    score: number;
    accuracy: number;
    subject: string;
    difficulty: string;
    date: string;
  }>;
  avatar: string;
}

const quizQuestions: Record<string, Question[]> = {
  physics: [
    {
      id: "p1",
      question: "Which part of the human eye is responsible for focusing light onto the retina?",
      options: ["Cornea", "Iris", "Lens", "Pupil"],
      correctAnswer: 2,
      explanation: "The lens is a transparent, flexible structure that changes shape to focus light from objects at different distances onto the retina.",
      topic: "Human Eye",
      difficulty: "easy"
    },
    {
      id: "p2",
      question: "What type of lens is used to correct myopia (nearsightedness)?",
      options: ["Convex lens", "Concave lens", "Cylindrical lens", "Bifocal lens"],
      correctAnswer: 1,
      explanation: "A concave lens diverges light rays, helping the eye focus distant objects on the retina instead of in front of it.",
      topic: "Vision Defects",
      difficulty: "medium"
    },
    {
      id: "p3",
      question: "In a simple electric circuit, what is the SI unit of electric current?",
      options: ["Volt", "Ohm", "Ampere", "Watt"],
      correctAnswer: 2,
      explanation: "The ampere (A) is the SI unit of electric current, named after French physicist André-Marie Ampère.",
      topic: "Electric Circuits",
      difficulty: "easy"
    },
    {
      id: "p4",
      question: "Which law states that the magnetic field around a current-carrying conductor is proportional to the current?",
      options: ["Faraday's Law", "Ampère's Law", "Lenz's Law", "Ohm's Law"],
      correctAnswer: 1,
      explanation: "Ampère's Law relates the magnetic field around a closed loop to the electric current passing through it.",
      topic: "Magnetism",
      difficulty: "hard"
    },
    {
      id: "p5",
      question: "What is the SI unit of Force?",
      options: ["Joule", "Pascal", "Newton", "Watt"],
      correctAnswer: 2,
      explanation: "The Newton (N) is the SI unit of force, defined as the force needed to accelerate 1kg of mass at 1m/s².",
      topic: "Forces",
      difficulty: "easy"
    },
    {
      id: "p6",
      question: "Newton's First Law of Motion is also known as the Law of:",
      options: ["Acceleration", "Inertia", "Action-Reaction", "Gravitation"],
      correctAnswer: 1,
      explanation: "The Law of Inertia states that an object will remain at rest or in uniform motion unless acted upon by an external force.",
      topic: "Laws of Motion",
      difficulty: "easy"
    },
    {
      id: "p7",
      question: "According to Ohm's Law, what is the relationship between Voltage (V), Current (I), and Resistance (R)?",
      options: ["V = I + R", "V = I / R", "V = I * R", "V = I^2 * R"],
      correctAnswer: 2,
      explanation: "Ohm's Law states that the current through a conductor between two points is directly proportional to the voltage across the two points.",
      topic: "Electricity",
      difficulty: "medium"
    },
    {
      id: "p8",
      question: "What is the formula for calculating Work done?",
      options: ["Force / Distance", "Force * Time", "Force * Distance", "Mass * Acceleration"],
      correctAnswer: 2,
      explanation: "Work is done when a force acts upon an object to cause a displacement. W = F * d.",
      topic: "Work & Energy",
      difficulty: "easy"
    },
    {
      id: "p9",
      question: "Which device is used to measure electric potential difference?",
      options: ["Ammeter", "Galvanometer", "Voltmeter", "Ohmeter"],
      correctAnswer: 2,
      explanation: "A voltmeter is an instrument used for measuring electrical potential difference between two points in an electric circuit.",
      topic: "Electricity",
      difficulty: "easy"
    },
    {
      id: "p10",
      question: "In which medium does sound travel the fastest?",
      options: ["Vacuum", "Air", "Water", "Steel"],
      correctAnswer: 3,
      explanation: "Sound travels fastest in solids like steel because the particles are more tightly packed together than in liquids or gases.",
      topic: "Sound Waves",
      difficulty: "medium"
    },
    {
      id: "p11",
      question: "What is the approximate value of acceleration due to gravity on Earth's surface?",
      options: ["8.9 m/s²", "9.8 m/s²", "10.5 m/s²", "12.0 m/s²"],
      correctAnswer: 1,
      explanation: "The standard acceleration due to gravity is approximately 9.8 m/s² on the surface of the Earth.",
      topic: "Gravitation",
      difficulty: "medium"
    },
    {
      id: "p12",
      question: "For Total Internal Reflection to occur, light must travel from:",
      options: ["Vacuum to Air", "Rarer to Denser medium", "Denser to Rarer medium", "Water to Glass"],
      correctAnswer: 2,
      explanation: "Total internal reflection occurs when light travels from an optically denser medium to a rarer medium at an angle greater than the critical angle.",
      topic: "Light Refraction",
      difficulty: "hard"
    },
    {
      id: "p13",
      question: "Which law states that energy can neither be created nor destroyed, only transformed?",
      options: ["Law of Inertia", "Law of Conservation of Momentum", "Law of Conservation of Energy", "Law of Universal Gravitation"],
      correctAnswer: 2,
      explanation: "The Law of Conservation of Energy states that the total energy of an isolated system remains constant.",
      topic: "Energy",
      difficulty: "medium"
    },
    {
      id: "p14",
      question: "What is the SI unit of Power?",
      options: ["Joule", "Newton", "Watt", "Pascal"],
      correctAnswer: 2,
      explanation: "The Watt (W) is the SI unit of power, equivalent to one joule of work done per second.",
      topic: "Work & Power",
      difficulty: "easy"
    },
    {
      id: "p15",
      question: "What is the SI unit of frequency?",
      options: ["Second", "Meter", "Hertz", "Newton"],
      correctAnswer: 2,
      explanation: "Hertz (Hz) is the SI unit of frequency, defined as one cycle per second.",
      topic: "Waves",
      difficulty: "easy"
    }
  ],
  chemistry: [
    {
      id: "c1",
      question: "What is the bond angle in a water molecule (H₂O)?",
      options: ["90°", "104.5°", "109.5°", "120°"],
      correctAnswer: 1,
      explanation: "The bond angle in water is 104.5° due to the two lone pairs of electrons on oxygen, which repel the bonding pairs.",
      topic: "Molecular Geometry",
      difficulty: "medium"
    },
    {
      id: "c2",
      question: "Which type of bond is formed when electrons are shared between atoms?",
      options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
      correctAnswer: 1,
      explanation: "Covalent bonds form when atoms share one or more pairs of electrons, creating a strong bond between them.",
      topic: "Chemical Bonding",
      difficulty: "easy"
    },
    {
      id: "c3",
      question: "What is the pH of a neutral solution at 25°C?",
      options: ["0", "7", "14", "1"],
      correctAnswer: 1,
      explanation: "A neutral solution has equal concentrations of H⁺ and OH⁻ ions, resulting in a pH of 7.",
      topic: "Acids & Bases",
      difficulty: "easy"
    },
    {
      id: "c4",
      question: "In the periodic table, which group contains the noble gases?",
      options: ["Group 1", "Group 7", "Group 17", "Group 18"],
      correctAnswer: 3,
      explanation: "Noble gases are in Group 18 and have complete outer electron shells, making them chemically stable.",
      topic: "Periodic Table",
      difficulty: "medium"
    },
    {
      id: "c5",
      question: "What is the chemical symbol for Gold?",
      options: ["Gd", "Ag", "Au", "Fe"],
      correctAnswer: 2,
      explanation: "The symbol Au comes from the Latin word for gold, 'aurum'.",
      topic: "Elements",
      difficulty: "easy"
    },
    {
      id: "c6",
      question: "Which gas is commonly used in fire extinguishers to displace oxygen?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      correctAnswer: 2,
      explanation: "Carbon dioxide (CO2) is denser than oxygen and smothers the fire by cutting off its oxygen supply.",
      topic: "Chemical Properties",
      difficulty: "easy"
    },
    {
      id: "c7",
      question: "The process of iron reacting with oxygen and moisture to form rust is an example of:",
      options: ["Reduction", "Oxidation", "Sublimation", "Distillation"],
      correctAnswer: 1,
      explanation: "Rusting is an oxidation reaction where iron loses electrons to oxygen.",
      topic: "Chemical Reactions",
      difficulty: "medium"
    },
    {
      id: "c8",
      question: "What is the smallest unit of an element that retains its chemical properties?",
      options: ["Molecule", "Atom", "Proton", "Electron"],
      correctAnswer: 1,
      explanation: "An atom is the basic building block of matter and the smallest unit of an element.",
      topic: "Atomic Structure",
      difficulty: "easy"
    },
    {
      id: "c9",
      question: "Which element has the atomic number 1?",
      options: ["Helium", "Lithium", "Hydrogen", "Oxygen"],
      correctAnswer: 2,
      explanation: "Hydrogen is the first element in the periodic table and has one proton in its nucleus.",
      topic: "Periodic Table",
      difficulty: "easy"
    },
    {
      id: "c10",
      question: "Which of the following is an example of a homogeneous mixture?",
      options: ["Salad", "Sand in water", "Air", "Oil and water"],
      correctAnswer: 2,
      explanation: "Air is a homogeneous mixture of gases (mostly nitrogen and oxygen) where the composition is uniform throughout.",
      topic: "Matter",
      difficulty: "medium"
    },
    {
      id: "c11",
      question: "What is Avogadro's number (the number of particles in one mole)?",
      options: ["6.022 x 10^21", "6.022 x 10^22", "6.022 x 10^23", "6.022 x 10^24"],
      correctAnswer: 2,
      explanation: "One mole of any substance contains exactly 6.02214076 x 10^23 elementary entities.",
      topic: "Mole Concept",
      difficulty: "hard"
    },
    {
      id: "c12",
      question: "Saturated hydrocarbons, which contain only single bonds, belong to the group:",
      options: ["Alkenes", "Alkynes", "Alkanes", "Arenes"],
      correctAnswer: 2,
      explanation: "Alkanes are saturated hydrocarbons with the general formula CnH2n+2.",
      topic: "Organic Chemistry",
      difficulty: "medium"
    },
    {
      id: "c13",
      question: "What color does blue litmus paper turn when dipped in an acid?",
      options: ["Yellow", "Green", "Red", "Purple"],
      correctAnswer: 2,
      explanation: "Acids turn blue litmus paper red, while bases turn red litmus paper blue.",
      topic: "Acids & Bases",
      difficulty: "easy"
    },
    {
      id: "c14",
      question: "What is the common chemical name for table salt?",
      options: ["Sodium Hydroxide", "Sodium Chloride", "Calcium Carbonate", "Potassium Nitrate"],
      correctAnswer: 1,
      explanation: "Table salt is Sodium Chloride (NaCl).",
      topic: "Chemical Compounds",
      difficulty: "easy"
    },
    {
      id: "c15",
      question: "Which gas is the most abundant in Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
      correctAnswer: 2,
      explanation: "Nitrogen makes up approximately 78% of Earth's atmosphere.",
      topic: "Matter",
      difficulty: "easy"
    }
  ],
  biology: [
    {
      id: "b1",
      question: "Which chamber of the heart pumps oxygenated blood to the body?",
      options: ["Right Atrium", "Right Ventricle", "Left Atrium", "Left Ventricle"],
      correctAnswer: 3,
      explanation: "The left ventricle is the strongest chamber and pumps oxygen-rich blood through the aorta to all parts of the body.",
      topic: "Heart & Circulation",
      difficulty: "medium"
    },
    {
      id: "b2",
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"],
      correctAnswer: 2,
      explanation: "Mitochondria produce ATP (energy) through cellular respiration, earning them the title 'powerhouse of the cell'.",
      topic: "Cell Structure",
      difficulty: "easy"
    },
    {
      id: "b3",
      question: "Which organelle is found only in plant cells and not in animal cells?",
      options: ["Mitochondria", "Chloroplast", "Ribosome", "Nucleus"],
      correctAnswer: 1,
      explanation: "Chloroplasts contain chlorophyll and are the site of photosynthesis, found only in plant cells.",
      topic: "Plant vs Animal Cells",
      difficulty: "easy"
    },
    {
      id: "b4",
      question: "Where does gas exchange occur in the human lungs?",
      options: ["Bronchi", "Trachea", "Alveoli", "Bronchioles"],
      correctAnswer: 2,
      explanation: "Alveoli are tiny air sacs with thin walls and rich blood supply, perfect for oxygen and carbon dioxide exchange.",
      topic: "Respiratory System",
      difficulty: "medium"
    },
    {
      id: "b5",
      question: "What is the basic structural and functional unit of life?",
      options: ["Tissue", "Organ", "Cell", "System"],
      correctAnswer: 2,
      explanation: "The cell is the smallest unit of life that can replicate independently.",
      topic: "Cell Biology",
      difficulty: "easy"
    },
    {
      id: "b6",
      question: "How many bones are there in an adult human skeleton?",
      options: ["196", "206", "216", "256"],
      correctAnswer: 1,
      explanation: "An adult human has 206 bones, though babies are born with about 270.",
      topic: "Skeletal System",
      difficulty: "easy"
    },
    {
      id: "b7",
      question: "Which hormone is responsible for regulating blood sugar levels?",
      options: ["Adrenaline", "Insulin", "Thyroxine", "Estrogen"],
      correctAnswer: 1,
      explanation: "Insulin, produced by the pancreas, helps cells take in glucose from the blood.",
      topic: "Endocrine System",
      difficulty: "medium"
    },
    {
      id: "b8",
      question: "The study of fossils is called:",
      options: ["Archaeology", "Paleontology", "Geology", "Anthropology"],
      correctAnswer: 1,
      explanation: "Paleontology is the scientific study of life that existed prior to, and sometimes including, the start of the Holocene epoch, through fossils.",
      topic: "Evolution",
      difficulty: "medium"
    },
    {
      id: "b9",
      question: "Which part of the brain is primarily responsible for maintaining balance and coordination?",
      options: ["Cerebrum", "Medulla Oblongata", "Cerebellum", "Hypothalamus"],
      correctAnswer: 2,
      explanation: "The cerebellum (little brain) coordinates voluntary movements such as posture, balance, coordination, and speech.",
      topic: "Nervous System",
      difficulty: "hard"
    },
    {
      id: "b10",
      question: "What is the green pigment in plants that captures light energy for photosynthesis?",
      options: ["Xanthophyll", "Carotene", "Chlorophyll", "Anthocyanin"],
      correctAnswer: 2,
      explanation: "Chlorophyll is a pigment found in chloroplasts that absorbs light energy, primarily from the sun.",
      topic: "Photosynthesis",
      difficulty: "easy"
    },
    {
      id: "b11",
      question: "Nitrogen-fixing bacteria are most commonly found in the root nodules of which plants?",
      options: ["Cereals", "Legumes", "Citrus", "Tubers"],
      correctAnswer: 1,
      explanation: "Legumes like peas and beans have a symbiotic relationship with Rhizobium bacteria which fix atmospheric nitrogen.",
      topic: "Plants",
      difficulty: "medium"
    },
    {
      id: "b12",
      question: "Which component of blood is responsible for clotting?",
      options: ["Red Blood Cells", "White Blood Cells", "Platelets", "Plasma"],
      correctAnswer: 2,
      explanation: "Platelets (thrombocytes) clump together to form clots and stop bleeding from damaged blood vessels.",
      topic: "Circulatory System",
      difficulty: "easy"
    },
    {
      id: "b13",
      question: "Which gland is often referred to as the 'Master Gland' of the endocrine system?",
      options: ["Thyroid", "Adrenal", "Pituitary", "Pancreas"],
      correctAnswer: 2,
      explanation: "The pituitary gland controls the functions of many other endocrine glands by secreting specific hormones.",
      topic: "Endocrine System",
      difficulty: "medium"
    },
    {
      id: "b14",
      question: "Which blood group is known as the universal recipient?",
      options: ["O-", "O+", "AB-", "AB+"],
      correctAnswer: 3,
      explanation: "People with AB+ blood can receive blood from any other group because they have both A and B antigens and Rh factor.",
      topic: "Circulatory System",
      difficulty: "hard"
    },
    {
      id: "b15",
      question: "What is the largest organ of the human body?",
      options: ["Liver", "Lungs", "Skin", "Intestine"],
      correctAnswer: 2,
      explanation: "The skin is the largest organ by surface area and weight, protecting the body from external factors.",
      topic: "Human Body",
      difficulty: "easy"
    }
  ],
  space: [
    {
      id: "s1",
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1,
      explanation: "Mars appears red due to iron oxide (rust) covering its surface, giving it a distinctive reddish color.",
      topic: "Solar System",
      difficulty: "easy"
    },
    {
      id: "s2",
      question: "What causes the phases of the Moon?",
      options: ["Earth's shadow", "Moon's rotation", "Position relative to Sun and Earth", "Distance from Earth"],
      correctAnswer: 2,
      explanation: "Moon phases occur because we see different amounts of the Moon's sunlit side as it orbits Earth.",
      topic: "Moon Phases",
      difficulty: "medium"
    },
    {
      id: "s3",
      question: "Which layer of Earth is the thinnest?",
      options: ["Inner Core", "Outer Core", "Mantle", "Crust"],
      correctAnswer: 3,
      explanation: "Earth's crust is the thinnest layer, averaging only 5-70 km thick, compared to the mantle's 2,900 km.",
      topic: "Earth Layers",
      difficulty: "easy"
    },
    {
      id: "s4",
      question: "What percentage of the solar system's mass is contained in the Sun?",
      options: ["50%", "75%", "90%", "99.86%"],
      correctAnswer: 3,
      explanation: "The Sun contains approximately 99.86% of the total mass of the solar system.",
      topic: "Solar System",
      difficulty: "hard"
    },
    {
      id: "s5",
      question: "Which planet is closest to the Sun?",
      options: ["Venus", "Mercury", "Earth", "Mars"],
      correctAnswer: 1,
      explanation: "Mercury is the innermost planet in the solar system, orbiting at an average distance of about 58 million km.",
      topic: "Solar System",
      difficulty: "easy"
    },
    {
      id: "s6",
      question: "What is the name of the galaxy that contains our Solar System?",
      options: ["Andromeda", "Milky Way", "Sombrero", "Triangulum"],
      correctAnswer: 1,
      explanation: "The Milky Way is a barred spiral galaxy containing 100-400 billion stars, including our Sun.",
      topic: "Galaxies",
      difficulty: "easy"
    },
    {
      id: "s7",
      question: "Which planet has the most prominent ring system?",
      options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
      correctAnswer: 1,
      explanation: "While all gas giants have rings, Saturn's are the largest and most visible from Earth.",
      topic: "Solar System",
      difficulty: "easy"
    },
    {
      id: "s8",
      question: "Approximately how long does it take for sunlight to reach Earth?",
      options: ["8 seconds", "8 minutes", "8 hours", "8 days"],
      correctAnswer: 1,
      explanation: "Light travels at 300,000 km/s, and since Earth is about 150 million km from the Sun, it takes roughly 8 minutes and 20 seconds.",
      topic: "Solar System",
      difficulty: "medium"
    },
    {
      id: "s9",
      question: "What is the primary force that keeps planets in orbit around the Sun?",
      options: ["Magnetism", "Gravity", "Centrifugal Force", "Atmospheric Pressure"],
      correctAnswer: 1,
      explanation: "Gravity is the force of attraction between all masses in the universe; the Sun's massive gravity keeps planets in their orbits.",
      topic: "Gravitation",
      difficulty: "easy"
    },
    {
      id: "s10",
      question: "Which planet is the hottest in our solar system?",
      options: ["Mercury", "Venus", "Mars", "Jupiter"],
      correctAnswer: 1,
      explanation: "Venus is hotter than Mercury despite being further away, due to its thick atmosphere trapping heat (runaway greenhouse effect).",
      topic: "Solar System",
      difficulty: "medium"
    },
    {
      id: "s11",
      question: "A 'light year' is a measure of:",
      options: ["Time", "Distance", "Brightness", "Speed"],
      correctAnswer: 1,
      explanation: "A light year is the distance light travels in one year, approximately 9.46 trillion kilometers.",
      topic: "Astronomy",
      difficulty: "easy"
    },
    {
      id: "s12",
      question: "What is the orbital period of Halley's Comet?",
      options: ["25 years", "50 years", "76 years", "100 years"],
      correctAnswer: 2,
      explanation: "Halley's Comet is visible from Earth every 75-76 years.",
      topic: "Comets",
      difficulty: "hard"
    },
    {
      id: "s13",
      question: "Which planet is often called 'Earth's Twin' because of its similar size and mass?",
      options: ["Mars", "Venus", "Neptune", "Mercury"],
      correctAnswer: 1,
      explanation: "Venus is very similar in size, mass, and composition to Earth.",
      topic: "Solar System",
      difficulty: "medium"
    },
    {
      id: "s14",
      question: "What was the name of the first artificial satellite launched into space?",
      options: ["Explorer 1", "Sputnik 1", "Vostok 1", "Apollo 11"],
      correctAnswer: 1,
      explanation: "Sputnik 1 was launched by the Soviet Union on October 4, 1957.",
      topic: "Space Exploration",
      difficulty: "medium"
    },
    {
      id: "s15",
      question: "Which of these is classified as a 'dwarf planet'?",
      options: ["Mercury", "Neptune", "Pluto", "Titan"],
      correctAnswer: 2,
      explanation: "Pluto was reclassified as a dwarf planet by the IAU in 2006.",
      topic: "Solar System",
      difficulty: "easy"
    }
  ],
};

const subjects = [
  { id: "physics", name: "Physics", icon: Atom, color: "edu-purple" },
  { id: "chemistry", name: "Chemistry", icon: FlaskConical, color: "edu-cyan" },
  { id: "biology", name: "Biology", icon: Heart, color: "edu-pink" },
  { id: "space", name: "Space Science", icon: Rocket, color: "edu-teal" },
];

const difficulties = [
  { id: "easy", name: "Easy", icon: Star, color: "text-green-400", points: 10 },
  { id: "medium", name: "Medium", icon: Zap, color: "text-yellow-400", points: 20 },
  { id: "hard", name: "Hard", icon: Crown, color: "text-red-400", points: 30 },
];

export default function QuizPage() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [signupMode, setSignupMode] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [studentScores, setStudentScores] = useState<Record<string, StudentScore>>({});

  // Quiz states
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: boolean }[]>([]);

  // Dynamic leaderboard calculation function (inside component to access studentScores state)
  const calculateLeaderboard = (): LeaderboardEntry[] => {
    const leaderboard = Object.values(studentScores)
      .map((student) => {
        const totalScore = student.scores.reduce((sum, s) => sum + s.score, 0);
        const avgAccuracy = student.scores.length > 0
          ? Math.round(student.scores.reduce((sum, s) => sum + s.accuracy, 0) / student.scores.length)
          : 0;
        return {
          rank: 0, // Will be set after sorting
          name: student.name,
          score: totalScore,
          accuracy: avgAccuracy,
          avatar: student.avatar,
          totalQuizzes: student.scores.length,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))
      .slice(0, 8); // Top 8 students

    return leaderboard;
  };

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedScores = localStorage.getItem("studentScores");
    if (savedScores) {
      setStudentScores(JSON.parse(savedScores));
    }
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  // Generate avatar for user
  const generateAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
  };

  // Handle login/signup
  const handleLogin = () => {
    setLoginError("");
    if (!userName.trim() || !userPassword.trim()) {
      setLoginError("Name and password are required");
      return;
    }

    if (signupMode) {
      // Signup
      if (studentScores[userName]) {
        setLoginError("User already exists");
        return;
      }
      const newScore: StudentScore = {
        name: userName,
        scores: [],
        avatar: generateAvatar(userName)
      };
      const updated = { ...studentScores, [userName]: newScore };
      setStudentScores(updated);
      localStorage.setItem("studentScores", JSON.stringify(updated));
      setCurrentUser(userName);
      setIsLoggedIn(true);
      setUserName("");
      setUserPassword("");
      setSignupMode(false);
    } else {
      // Login
      if (!studentScores[userName]) {
        setLoginError("User not found. Create an account first.");
        return;
      }
      setCurrentUser(userName);
      setIsLoggedIn(true);
      setUserName("");
      setUserPassword("");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserName("");
    setUserPassword("");
    localStorage.removeItem("currentUser");
  };

  const currentQuestions = selectedSubject 
    ? quizQuestions[selectedSubject].filter(q => 
        selectedDifficulty ? q.difficulty === selectedDifficulty : true
      )
    : [];

  const currentQuestion = currentQuestions[currentQuestionIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !showResult && !quizComplete && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswerSubmit();
    }
    return () => clearInterval(timer);
  }, [quizStarted, showResult, quizComplete, timeLeft]);

  // Save score to student profile when quiz completes
  useEffect(() => {
    if (quizComplete && currentUser && score > 0) {
      const accuracy = Math.round((correctAnswers / currentQuestions.length) * 100);
      const updatedScores = { ...studentScores };
      if (!updatedScores[currentUser]) {
        updatedScores[currentUser] = {
          name: currentUser,
          scores: [],
          avatar: generateAvatar(currentUser)
        };
      }
      updatedScores[currentUser].scores.push({
        score,
        accuracy,
        subject: selectedSubject || "",
        difficulty: selectedDifficulty || "",
        date: new Date().toLocaleString()
      });
      setStudentScores(updatedScores);
      localStorage.setItem("studentScores", JSON.stringify(updatedScores));
    }
  }, [quizComplete]);

  const startQuiz = () => {
    if (selectedSubject && selectedDifficulty) {
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setCorrectAnswers(0);
      setTimeLeft(30);
      setAnswers([]);
      setQuizComplete(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (!showResult) {
      setSelectedAnswer(index);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null && timeLeft > 0) return;

    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
    const pointsPerQuestion = difficulties.find(d => d.id === selectedDifficulty)?.points || 10;
    
    if (isCorrect) {
      setScore(prev => prev + pointsPerQuestion + Math.floor(timeLeft / 2));
      setCorrectAnswers(prev => prev + 1);
    }

    setAnswers(prev => [...prev, {
      questionId: currentQuestion?.id || "",
      selected: selectedAnswer ?? -1,
      correct: isCorrect
    }]);

    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      // Last question answered, complete quiz
      setTimeout(() => {
        setQuizComplete(true);
      }, 0);
    }
  };

  const resetQuiz = () => {
    setSelectedSubject(null);
    setSelectedDifficulty(null);
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(30);
    setQuizComplete(false);
    setAnswers([]);
  };

  if (!isLoggedIn) {
    return (
      <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-edu-purple to-edu-cyan flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2">
              {signupMode ? "Create Account" : "Welcome to Quiz"}
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              {signupMode ? "Sign up to start taking quizzes" : "Sign in to continue"}
            </p>

            {loginError && (
              <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
                {loginError}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-edu-purple to-edu-cyan mb-4"
            >
              {signupMode ? "Sign Up" : "Sign In"}
            </Button>

            <button
              onClick={() => {
                setSignupMode(!signupMode);
                setLoginError("");
                setUserName("");
                setUserPassword("");
              }}
              className="w-full text-center text-sm text-muted-foreground hover:text-white transition"
            >
              {signupMode ? "Already have an account? Sign In" : "Create new account"}
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  if (quizComplete) {
    const accuracy = Math.round((correctAnswers / currentQuestions.length) * 100);

    return (
      <main className="pt-24 pb-16 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Welcome, {currentUser}! 🎉</h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-edu-purple to-edu-cyan flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Quiz Complete! 🎊</h2>
            <p className="text-muted-foreground mb-8">Excellent work! Your score has been saved to the leaderboard.</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass rounded-xl p-4">
                <p className="text-3xl font-bold gradient-text">{score}</p>
                <p className="text-sm text-muted-foreground">Total Score</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-3xl font-bold text-green-400">{correctAnswers}/{currentQuestions.length}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-3xl font-bold text-edu-cyan">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>

            <div className="space-y-3 mb-8 max-h-64 overflow-y-auto">
              {answers && answers.length > 0 && currentQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    answers[index]?.correct ? "bg-green-500/10" : "bg-red-500/10"
                  }`}
                >
                  <span className="text-sm font-medium">{q.topic}</span>
                  {answers[index]?.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              ))}
            </div>

            <div className="mb-8 p-6 glass rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">Updated Leaderboard</h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {calculateLeaderboard().map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      entry.rank <= 3 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : "bg-white/5"
                    } ${entry.name === currentUser ? "ring-2 ring-edu-cyan" : ""}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      entry.rank === 1 ? "bg-yellow-500 text-black" :
                      entry.rank === 2 ? "bg-gray-300 text-black" :
                      entry.rank === 3 ? "bg-amber-600 text-white" :
                      "bg-white/10"
                    }`}>
                      {entry.rank}
                    </div>
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-6 h-6 rounded-full bg-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.name} {entry.name === currentUser ? "👈 You" : ""}</p>
                      <p className="text-xs text-muted-foreground">{entry.accuracy}% accuracy</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold gradient-text">{entry.score}</p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => {
                resetQuiz();
                // User stays on quiz page, but resets to subject selection
              }} className="flex-1 bg-gradient-to-r from-edu-purple to-edu-cyan">
                Take Another Quiz
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (quizStarted && currentQuestion) {
    return (
      <main className="pt-24 pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">User: {currentUser}</h2>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1}/{currentQuestions.length}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentQuestion.difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                  currentQuestion.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                timeLeft <= 10 ? "bg-red-500/20 text-red-400" : "bg-white/10"
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{timeLeft}s</span>
              </div>
            </div>

            <Progress value={(currentQuestionIndex / currentQuestions.length) * 100} className="mb-6 h-2" />

            <div className="mb-8">
              <span className="text-xs text-edu-cyan">{currentQuestion.topic}</span>
              <h2 className="text-xl font-semibold mt-2">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: showResult ? 1 : 1.01 }}
                  whileTap={{ scale: showResult ? 1 : 0.99 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                    showResult
                      ? index === currentQuestion.correctAnswer
                        ? "bg-green-500/20 border-2 border-green-500"
                        : index === selectedAnswer
                          ? "bg-red-500/20 border-2 border-red-500"
                          : "bg-white/5"
                      : selectedAnswer === index
                        ? "bg-edu-purple/20 border-2 border-edu-purple"
                        : "bg-white/5 hover:bg-white/10 border-2 border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      showResult && index === currentQuestion.correctAnswer
                        ? "bg-green-500 text-white"
                        : showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer
                          ? "bg-red-500 text-white"
                          : "bg-white/10"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </span>
                  {showResult && index === currentQuestion.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-white/5"
                >
                  <p className="text-sm font-medium mb-1">Explanation:</p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-edu-cyan" />
                <span className="text-sm">Score: <strong>{score}</strong></span>
              </div>
              {showResult ? (
                <Button onClick={nextQuestion} className="bg-gradient-to-r from-edu-purple to-edu-cyan">
                  {currentQuestionIndex < currentQuestions.length - 1 ? "Next Question" : "See Results"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                  className="bg-gradient-to-r from-edu-purple to-edu-cyan"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {currentUser}! 👋</h1>
            <p className="text-muted-foreground text-sm">Ready to test your knowledge?</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <ClipboardCheck className="w-4 h-4 text-edu-orange" />
            <span className="text-sm text-muted-foreground">Interactive Quiz</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Test Your <span className="gradient-text">Knowledge</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take topic-wise quizzes linked to AR & VR models. 
            Earn points, climb the leaderboard, and master science!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Select Subject</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`p-4 rounded-xl transition-all ${
                      selectedSubject === subject.id
                        ? `bg-${subject.color}/20 ring-2 ring-${subject.color}`
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <subject.icon className={`w-8 h-8 mx-auto mb-2 ${
                      selectedSubject === subject.id ? `text-${subject.color}` : "text-muted-foreground"
                    }`} />
                    <p className="text-sm font-medium">{subject.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quizQuestions[subject.id]?.length || 0} questions
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Select Difficulty</h2>
              <div className="grid grid-cols-3 gap-4">
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setSelectedDifficulty(diff.id as "easy" | "medium" | "hard")}
                    className={`p-4 rounded-xl transition-all ${
                      selectedDifficulty === diff.id
                        ? "bg-white/10 ring-2 ring-white/30"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <diff.icon className={`w-6 h-6 mx-auto mb-2 ${diff.color}`} />
                    <p className="text-sm font-medium">{diff.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">+{diff.points} pts/Q</p>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Ready to Start?</h2>
                {selectedSubject && selectedDifficulty && (
                  <span className="text-sm text-muted-foreground">
                    {currentQuestions.length} questions selected
                  </span>
                )}
              </div>
              <Button
                onClick={startQuiz}
                disabled={!selectedSubject || !selectedDifficulty}
                className="w-full h-14 text-lg bg-gradient-to-r from-edu-orange to-edu-pink hover:opacity-90"
              >
                Start Quiz
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                30 seconds per question • Instant feedback • Earn bonus points for speed
              </p>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-semibold">Leaderboard</h2>
              </div>
              <div className="space-y-3">
                {calculateLeaderboard().slice(0, 5).map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      entry.rank <= 3 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : "bg-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.rank === 1 ? "bg-yellow-500 text-black" :
                      entry.rank === 2 ? "bg-gray-300 text-black" :
                      entry.rank === 3 ? "bg-amber-600 text-white" :
                      "bg-white/10"
                    }`}>
                      {entry.rank}
                    </div>
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-8 h-8 rounded-full bg-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.accuracy}% accuracy</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold gradient-text">{entry.score}</p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-sm">
                View Full Leaderboard
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Medal className="w-4 h-4 text-edu-cyan" />
                How Scoring Works
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Easy: 10 points per correct answer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  Medium: 20 points per correct answer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  Hard: 30 points per correct answer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-edu-cyan">•</span>
                  Speed bonus: +1 point per 2 seconds left
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
