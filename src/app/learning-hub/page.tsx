"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Glasses, 
  View, 
  Bot, 
  ClipboardCheck,
  ArrowRight,
  Atom,
  FlaskConical,
  Heart,
  Rocket,
  Sparkles,
  BookOpen
} from "lucide-react";

const modules = [
  {
    id: "ar",
    title: "Learn with AR",
    description: "Scan textbook diagrams and see 3D models come to life with Augmented Reality",
    icon: Glasses,
    color: "from-edu-purple to-edu-blue",
    glowColor: "glow-purple",
    href: "/ar",
    features: ["Camera scanning", "3D model overlay", "Rotate & zoom", "Part-wise labeling"],
    preview: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&h=300&fit=crop"
  },
  {
    id: "vr",
    title: "Learn with VR",
    description: "Walk through immersive 3D environments and explore concepts interactively",
    icon: View,
    color: "from-edu-cyan to-edu-teal",
    glowColor: "glow-cyan",
    href: "/vr",
    features: ["Immersive scenes", "Interactive labels", "Walk-through", "Realistic lighting"],
    preview: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&h=300&fit=crop"
  },
  {
    id: "ai-tutor",
    title: "Learn with AI Tutor",
    description: "Get instant answers and step-by-step explanations from our smart AI assistant",
    icon: Bot,
    color: "from-edu-teal to-edu-green",
    glowColor: "glow-teal",
    href: "/ai-tutor",
    features: ["Instant answers", "Step-by-step explanations", "Adaptive difficulty", "Voice input"],
    preview: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop"
  },
  {
    id: "quiz",
    title: "Learn with Quiz",
    description: "Test your knowledge with interactive quizzes and compete on the leaderboard",
    icon: ClipboardCheck,
    color: "from-edu-orange to-edu-pink",
    glowColor: "",
    href: "/quiz",
    features: ["Level-based", "Real-time scoring", "Leaderboard", "Topic-wise"],
    preview: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop"
  },
];

const subjects = [
  { name: "Physics", icon: Atom, color: "edu-purple", models: 12 },
  { name: "Chemistry", icon: FlaskConical, color: "edu-cyan", models: 10 },
  { name: "Biology", icon: Heart, color: "edu-pink", models: 15 },
  { name: "Space Science", icon: Rocket, color: "edu-teal", models: 8 },
];

export default function LearningHubPage() {
  return (
    <main className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <BookOpen className="w-4 h-4 text-edu-cyan" />
            <span className="text-sm text-muted-foreground">Learning Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Choose Your <span className="gradient-text">Learning Path</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore science through AR, VR, AI, and interactive quizzes. 
            Select a module to begin your immersive learning journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={module.href}>
                <div className={`group relative glass rounded-3xl overflow-hidden hover:bg-white/5 transition-all duration-500 ${module.glowColor}`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-10`} />
                  </div>
                  
                  <div className="relative p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <module.icon className="w-8 h-8 text-white" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-edu-cyan group-hover:translate-x-2 transition-all" />
                    </div>

                    <h2 className="text-2xl font-bold mb-3 group-hover:gradient-text transition-all">
                      {module.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {module.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {module.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 rounded-full bg-white/5 text-sm text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="relative rounded-xl overflow-hidden aspect-video">
                      <img
                        src={module.preview}
                        alt={module.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span className="text-white text-sm font-medium">Preview</span>
                        <span className="px-3 py-1 rounded-full glass text-xs text-white">
                          Hover to explore
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            Subjects <span className="gradient-text">Covered</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 text-center hover:bg-white/5 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-${subject.color}/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <subject.icon className={`w-6 h-6 text-${subject.color}`} />
                </div>
                <h3 className="font-semibold mb-1">{subject.name}</h3>
                <p className="text-sm text-muted-foreground">{subject.models} 3D Models</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 text-center"
        >
          <Sparkles className="w-12 h-12 text-edu-cyan mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">
            Not Sure Where to Start?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Ask our AI Tutor for personalized recommendations based on your class and interests.
          </p>
          <Link href="/ai-tutor">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-edu-purple to-edu-cyan text-white font-medium hover:opacity-90 transition-opacity glow-purple">
              Talk to AI Tutor
            </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
