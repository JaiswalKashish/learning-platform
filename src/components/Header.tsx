"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  GraduationCap, 
  Menu, 
  X, 
  Glasses, 
  View, 
  Bot, 
  ClipboardCheck,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/learning-hub", label: "Learning Hub", icon: BookOpen },
  { href: "/ar", label: "AR", icon: Glasses },
  { href: "/vr", label: "VR", icon: View },
  { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { href: "/quiz", label: "Quiz", icon: ClipboardCheck },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-edu-purple via-edu-cyan to-edu-teal flex items-center justify-center glow-purple group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">EduVerse</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Auth buttons removed */}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
