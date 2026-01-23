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
  Play,
  Scan,
  Box,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const features = [
  {
    icon: Glasses,
    title: "Augmented Reality",
    description: "Scan textbook diagrams and see 3D models come to life",
    color: "from-edu-purple to-edu-blue",
    href: "/ar"
  },
  {
    icon: View,
    title: "Virtual Reality",
    description: "Walk through immersive 3D environments and explore",
    color: "from-edu-cyan to-edu-teal",
    href: "/vr"
  },
  {
    icon: Bot,
    title: "AI Tutor",
    description: "Get instant answers and step-by-step explanations",
    color: "from-edu-teal to-edu-green",
    href: "/ai-tutor"
  },
  {
    icon: ClipboardCheck,
    title: "Interactive Quiz",
    description: "Test your knowledge with adaptive assessments",
    color: "from-edu-orange to-edu-pink",
    href: "/quiz"
  },
];

const carouselItems = [
  {
    title: "Human Eye & Lens",
    subject: "Physics",
    icon: Atom,
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
    color: "edu-purple"
  },
  {
    title: "Water Molecule (H₂O)",
    subject: "Chemistry",
    icon: FlaskConical,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop",
    color: "edu-cyan"
  },
  {
    title: "Human Heart",
    subject: "Biology",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
    color: "edu-pink"
  },
  {
    title: "Solar System",
    subject: "Space Science",
    icon: Rocket,
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&h=400&fit=crop",
    color: "edu-teal"
  },
];

const stats = [
  { value: "50+", label: "3D Models" },
  { value: "20+", label: "VR Experiences" },
  { value: "1000+", label: "Quiz Questions" },
  { value: "6-12", label: "Classes Covered" },
];

export default function HomePage() {
  const [activeCarouselItem, setActiveCarouselItem] = useState(0);

  return (
    <main className="pt-16">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-edu-purple/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-edu-cyan/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-edu-teal/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "4s" }} />
          {/* Floating tech icons - AR, VR, AI */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[18%] right-[12%] w-10 h-10 rounded-xl glass flex items-center justify-center opacity-40"
          >
            <Scan className="w-5 h-5 text-edu-purple" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[22%] left-[10%] w-9 h-9 rounded-lg glass flex items-center justify-center opacity-35"
          >
            <Glasses className="w-4 h-4 text-edu-cyan" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[28%] left-[14%] w-9 h-9 rounded-lg glass flex items-center justify-center opacity-35"
          >
            <Box className="w-4 h-4 text-edu-teal" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute bottom-[24%] right-[10%] w-10 h-10 rounded-xl glass flex items-center justify-center opacity-40"
          >
            <View className="w-5 h-5 text-edu-cyan" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute top-[45%] right-[8%] w-8 h-8 rounded-lg glass flex items-center justify-center opacity-30"
          >
            <Cpu className="w-4 h-4 text-edu-green" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="absolute top-[42%] left-[8%] w-8 h-8 rounded-lg glass flex items-center justify-center opacity-30"
          >
            <Bot className="w-4 h-4 text-edu-teal" />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <Sparkles className="w-4 h-4 text-edu-cyan" />
              <span className="text-sm text-muted-foreground">Immersive Learning for Class 6-12</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Learn Science in{" "}
              <span className="gradient-text">3D, VR,</span>
              <br />
              <span className="gradient-text">and AI</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Experience physics, chemistry, biology, and space science like never before. 
              Explore interactive 3D models, immersive VR environments, and get help from our AI tutor.
            </p>

            {/* AR, VR, AI tech icons row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10"
            >
              {[
                { icon: Glasses, label: "AR", href: "/ar", gradient: "from-edu-purple to-edu-blue", delay: 0 },
                { icon: View, label: "VR", href: "/vr", gradient: "from-edu-cyan to-edu-teal", delay: 0.1 },
                { icon: Bot, label: "AI", href: "/ai-tutor", gradient: "from-edu-teal to-edu-green", delay: 0.2 },
              ].map((tech, i) => (
                <Link key={tech.label} href={tech.href}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + tech.delay, duration: 0.4 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tech.gradient} flex items-center justify-center group-hover:shadow-[0_0_24px_rgba(0,206,201,0.3)] transition-shadow`}>
                      <tech.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground/90 group-hover:text-edu-cyan transition-colors">{tech.label}</span>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/ar">
                <Button size="lg" className="bg-gradient-to-r from-edu-purple to-edu-cyan hover:opacity-90 glow-purple text-lg px-8 h-14">
                  <Glasses className="w-5 h-5 mr-2" />
                  Explore AR
                </Button>
              </Link>
              <Link href="/vr">
                <Button size="lg" variant="outline" className="border-edu-cyan/50 hover:bg-edu-cyan/10 text-lg px-8 h-14">
                  <View className="w-5 h-5 mr-2" />
                  Explore VR
                </Button>
              </Link>
              <Link href="/ai-tutor">
                <Button size="lg" variant="outline" className="border-edu-teal/50 hover:bg-edu-teal/10 text-lg px-8 h-14">
                  <Bot className="w-5 h-5 mr-2" />
                  Ask AI Tutor
                </Button>
              </Link>
              <Link href="/quiz">
                <Button size="lg" variant="outline" className="border-edu-orange/50 hover:bg-edu-orange/10 text-lg px-8 h-14">
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  Take Quiz
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center glass rounded-2xl p-6"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Four Ways to <span className="gradient-text">Learn</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose your preferred learning method and dive into interactive educational experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={feature.href}>
                  <div className="group relative h-full glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                    <div className="flex items-center text-sm text-edu-cyan group-hover:text-edu-green transition-colors">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Explore <span className="gradient-text">3D Models</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Interactive visualizations across Physics, Chemistry, Biology, and Space Science
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {carouselItems.map((item, index) => (
              <motion.button
                key={item.title}
                onClick={() => setActiveCarouselItem(index)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group rounded-2xl overflow-hidden aspect-video transition-all duration-300 ${
                  activeCarouselItem === index ? "ring-2 ring-edu-cyan scale-105" : "opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-${item.color}/20 text-${item.color} text-xs mb-1`}>
                    <item.icon className="w-3 h-3" />
                    {item.subject}
                  </div>
                  <h4 className="text-sm font-medium text-white">{item.title}</h4>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden glass"
          >
            <div className="aspect-video relative">
              <img
                src={carouselItems[activeCarouselItem].image}
                alt={carouselItems[activeCarouselItem].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm mb-3`}>
                  {(() => {
                    const Icon = carouselItems[activeCarouselItem].icon;
                    return <Icon className="w-4 h-4" />;
                  })()}
                  {carouselItems[activeCarouselItem].subject}
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{carouselItems[activeCarouselItem].title}</h3>
                <p className="text-white/80 max-w-xl">
                  Explore this interactive 3D model with rotate, zoom, exploded view, and labeled parts.
                </p>
                <Link href="/ar">
                  <Button className="mt-4 bg-gradient-to-r from-edu-purple to-edu-cyan">
                    <Glasses className="w-4 h-4 mr-2" />
                    View in AR
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to <span className="gradient-text">Transform</span> Your Learning?
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Join thousands of students experiencing science in a whole new way. 
                  Start your immersive learning journey today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/learning-hub">
                    <Button size="lg" className="bg-gradient-to-r from-edu-purple to-edu-cyan glow-purple">
                      Start Learning
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/ai-tutor">
                    <Button size="lg" variant="outline" className="border-edu-cyan/50">
                      Talk to AI Tutor
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-edu-purple/20 to-edu-cyan/20 rounded-2xl blur-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop"
                  alt="Student learning with VR"
                  className="relative rounded-2xl w-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-edu-purple to-edu-cyan flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text">EduVerse</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/learning-hub" className="hover:text-foreground transition-colors">Learning Hub</Link>
              <Link href="/ar" className="hover:text-foreground transition-colors">AR</Link>
              <Link href="/vr" className="hover:text-foreground transition-colors">VR</Link>
              <Link href="/ai-tutor" className="hover:text-foreground transition-colors">AI Tutor</Link>
              <Link href="/quiz" className="hover:text-foreground transition-colors">Quiz</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 EduVerse. Immersive Learning for All.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
