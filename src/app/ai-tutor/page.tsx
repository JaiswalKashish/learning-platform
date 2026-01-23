"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Sparkles,
  User,
  Atom,
  FlaskConical,
  Heart,
  Rocket,
  Lightbulb,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Volume2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  // Physics
  { icon: Atom, text: "Explain Newton's laws of motion with examples", subject: "Physics" },
  { icon: Lightbulb, text: "What is force and types of motion?", subject: "Physics" },
  { icon: Rocket, text: "Why do objects fall down? What is gravity?", subject: "Physics" },
  { icon: Volume2, text: "How do sound waves travel and vibrate?", subject: "Physics" },
  // Chemistry
  { icon: FlaskConical, text: "What is the difference between covalent and ionic bonds?", subject: "Chemistry" },
  { icon: Atom, text: "Explain atomic structure - protons, neutrons, electrons", subject: "Chemistry" },
  { icon: Lightbulb, text: "What is the difference between elements and compounds?", subject: "Chemistry" },
  { icon: Heart, text: "Why do we classify elements in the periodic table?", subject: "Chemistry" },
  // Biology
  { icon: Heart, text: "Explain plant vs animal cell - what are the differences?", subject: "Biology" },
  { icon: Rocket, text: "How does photosynthesis work in plants?", subject: "Biology" },
  { icon: BookOpen, text: "What is DNA and how does it carry genetic information?", subject: "Biology" },
  { icon: Heart, text: "How does the human circulatory system work?", subject: "Biology" },
  // Space Science
  { icon: Rocket, text: "What are black holes and how are they formed?", subject: "Space Science" },
  { icon: Sparkles, text: "Why is the sky blue and what causes rainbows?", subject: "Space Science" },
  { icon: Rocket, text: "What causes eclipses - solar and lunar?", subject: "Space Science" },
  { icon: Atom, text: "What is the Big Bang theory and how did the universe form?", subject: "Space Science" },
];

const quickTopics = [
  // Physics Foundation
  "Force", "Motion", "Gravity", "Friction", "Pressure",
  // Physics Core
  "Newton's Laws", "Work & Energy", "Momentum", "Sound Waves", "Light Reflection",
  // Physics Advanced
  "Thermodynamics", "Electrostatics", "Magnetic Field", "Induction", "Optics",
  // Chemistry Foundation
  "Matter", "States of Matter", "Acids & Bases", "Metals", "Non-metals",
  // Chemistry Core
  "Atomic Structure", "Chemical Bonding", "Periodic Table", "Chemical Reactions", "Carbon",
  // Chemistry Advanced
  "Mole Concept", "Organic Chemistry", "Polymers", "Biomolecules", "Electrochemistry",
  // Biology Foundation
  "Living Things", "Cell Structure", "Photosynthesis", "Digestion", "Reproduction",
  // Biology Core
  "Tissues", "Life Processes", "Control & Coordination", "Heredity", "Evolution",
  // Biology Advanced
  "Cell Cycle", "DNA & RNA", "Genetics", "Respiration", "Biotechnology",
  // Space Science
  "Solar System", "Planets", "Black Holes", "Stars & Galaxies", "Eclipses",
  "Big Bang Theory", "Satellites", "Space Missions", "Moon Phases", "Supernovas",
];

export default function AITutorPage() {
  const [selectedClass, setSelectedClass] = useState("8");
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm EduChat, your AI tutor for Class 6-12. I can help you understand any topic in Physics, Chemistry, Biology, Mathematics, and Space Science. Ask me anything - I'll explain it step by step with examples! What would you like to learn today?",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    textareaRef.current?.focus();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
  };

  const handleFormSubmit = async () => {
    if (!inputValue?.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    // Add user message to display
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/educhat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([userMessage]),
          classLevel: selectedClass,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantMessage = "";
      const assistantId = Date.now().toString();
      let messageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('0:"')) {
            const content = line.slice(3, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
            assistantMessage = content;
            
            if (!messageAdded) {
              setMessages(prev => [...prev, {
                id: assistantId,
                role: "assistant",
                content: assistantMessage,
              }]);
              messageAdded = true;
            } else {
              setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.id === assistantId) {
                  lastMsg.content = assistantMessage;
                }
                return updated;
              });
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-edu-cyan mb-2">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('## ')) {
        return <p key={i} className="font-bold text-lg mb-2">{line.slice(3)}</p>;
      } else if (line.startsWith('# ')) {
        return <p key={i} className="font-bold text-xl mb-2">{line.slice(2)}</p>;
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        return <p key={i} className="pl-4 mb-1">• {line.slice(2)}</p>;
      } else if (/^\d+\.\s/.test(line)) {
        return <p key={i} className="pl-4 mb-1">{line}</p>;
      } else if (line?.trim() === '') {
        return <br key={i} />;
      } else {
        return <p key={i} className="mb-2">{line}</p>;
      }
    });
  };

  return (
    <main className="pt-24 pb-8 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)]">
        <div className="grid lg:grid-cols-4 gap-6 h-full">
          <div className="lg:col-span-3 flex flex-col h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl flex flex-col h-full overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold">EduChat AI Tutor</h2>
                    <p className="text-xs text-muted-foreground">Powered by AI • Class 6-12</p>
                  </div>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-32 glass border-0">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
                      <SelectItem key={cls} value={cls.toString()}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-edu-purple to-edu-cyan text-white"
                              : "bg-white/5"
                          }`}
                        >
                          <div className="prose prose-invert prose-sm max-w-none">
                            {message.role === "assistant" ? formatMessage(message.content) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                          {message.role === "assistant" && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs hover:bg-white/10"
                                onClick={() => copyToClipboard(message.content, message.id)}
                              >
                                {copiedId === message.id ? (
                                  <Check className="w-3 h-3 mr-1" />
                                ) : (
                                  <Copy className="w-3 h-3 mr-1" />
                                )}
                                Copy
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs hover:bg-white/10">
                                <Volume2 className="w-3 h-3 mr-1" />
                                Read
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-white/10">
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-white/10">
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-edu-purple to-edu-blue flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-edu-teal to-edu-green flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">EduChat is thinking...</span>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{error.message}</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-white/5">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleFormSubmit();
                  }} 
                  className="flex gap-2"
                >
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask any question about Physics, Chemistry, Biology, Math, or Space Science..."
                      className="min-h-[52px] max-h-32 resize-none glass border-0 pr-12"
                      rows={1}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={toggleVoiceInput}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                        isListening ? "text-edu-cyan" : ""
                      }`}
                    >
                      {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    disabled={!inputValue?.trim() || isLoading}
                    className="h-[52px] px-6 bg-gradient-to-r from-edu-teal to-edu-green hover:opacity-90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  EduChat provides personalized explanations for Class {selectedClass} students
                </p>
              </div>
            </motion.div>
          </div>

          <div className="space-y-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-4"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-edu-cyan" />
                Try Asking
              </h3>
              <div className="space-y-2">
                {suggestedQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(q.text)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <q.icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm group-hover:text-edu-cyan transition-colors">{q.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{q.subject}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-4"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-edu-purple" />
                Quick Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleSuggestedQuestion(`Explain ${topic} in simple terms`)}
                    className="px-3 py-1.5 rounded-full bg-white/5 text-xs hover:bg-edu-purple/20 hover:text-edu-purple transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-4"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-edu-orange" />
                Tips
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-edu-cyan">•</span>
                  Ask specific questions for detailed explanations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-edu-cyan">•</span>
                  Ask &quot;why&quot; or &quot;how&quot; for deeper understanding
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-edu-cyan">•</span>
                  Request step-by-step solutions for problems
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-edu-cyan">•</span>
                  Ask for real-world examples and analogies
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-edu-cyan">•</span>
                  Follow up with more questions to clarify
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
