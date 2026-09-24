import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  BookOpen,
  Timer,
  Sparkles,
  X,
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
  Code,
  Flame,
  Award,
  Send,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  BrainCircuit,
  Volume2,
  VolumeX,
  Zap,
  Target,
  FileText
} from 'lucide-react';
import { StudySubject, FlashcardItem, StudySessionStats } from '../types';

interface StudyHubProps {
  isOpen: boolean;
  onClose: () => void;
  isStudyModeActive: boolean;
  onToggleStudyMode: (active: boolean) => void;
  selectedSubject: StudySubject;
  onSelectSubject: (subject: StudySubject) => void;
  onSendPromptToMahi: (promptText: string) => void;
  theme: {
    primary: string;
    secondary: string;
    border: string;
  };
}

const SUBJECT_CATEGORIES: Array<{
  id: StudySubject;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  topics: string[];
}> = [
  {
    id: 'school',
    title: 'School & Boards (Class 1-12)',
    subtitle: 'CBSE, ICSE, State Boards - Maths, Science, English, Social',
    icon: '🏫',
    color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30',
    topics: ['Class 10/12 Board Exam Tips', 'Calculus & Algebra', 'NCERT Science Breakdown', 'English Grammar & Essays']
  },
  {
    id: 'competitive',
    title: 'Competitive Exams (JEE / NEET / UPSC / SSC)',
    subtitle: 'High-level Problem Solving, Formulas & Exam Tricks',
    icon: '⚡',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    topics: ['JEE Physics & Physical Chem', 'NEET Biology Tricks', 'UPSC General Studies', 'Aptitude & Logical Reasoning']
  },
  {
    id: 'coding',
    title: 'College, CS & Software Engineering',
    subtitle: 'Python, Java, DSA, Web Dev, AI & System Design',
    icon: '💻',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    topics: ['Data Structures & Algorithms', 'Python for Beginners', 'Full Stack Web Dev', 'AI & Machine Learning']
  },
  {
    id: 'languages',
    title: 'Languages & Soft Skills',
    subtitle: 'Fluent English Speaking, Vocab, Public Speaking & Interviews',
    icon: '🗣️',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    topics: ['Daily English Conversation', 'Grammar Correction', 'Job Interview Prep', 'Vocabulary Builder']
  },
  {
    id: 'general',
    title: 'Curiosity & General Knowledge',
    subtitle: 'Astronomy, Quantum Physics, World History & Economics',
    icon: '🌍',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
    topics: ['Quantum Mechanics Simple', 'World History Timeline', 'Financial Literacy', 'Cosmology & Black Holes']
  }
];

const PRESET_PROMPTS = [
  {
    icon: Lightbulb,
    title: 'Explain Like I am 5',
    template: 'Mahi, can you explain [topic] in the simplest possible way with a fun real-world example?'
  },
  {
    icon: Zap,
    title: 'Step-by-Step Solver',
    template: 'Mahi, help me solve this step-by-step with zero skipped steps: '
  },
  {
    icon: Target,
    title: 'Formula & Trick Cheat Sheet',
    template: 'Mahi, give me a master cheat sheet with short tricks and formulas for '
  },
  {
    icon: BrainCircuit,
    title: 'Quiz Me (5 MCQs)',
    template: 'Mahi, test my knowledge! Ask me 3 challenging multiple-choice questions on '
  },
  {
    icon: FileText,
    title: 'Summary & Revision Notes',
    template: 'Mahi, create high-yield revision bullet points for '
  }
];

const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: '1',
    topic: 'Physics',
    question: "What is Newton's Second Law of Motion?",
    answer: "Force = mass × acceleration (F = m · a). The time rate of change of momentum is directly proportional to applied force."
  },
  {
    id: '2',
    topic: 'Chemistry',
    question: "What is the pH value of pure water at 25°C?",
    answer: "pH = 7 (Neutral). It contains equal concentrations of H⁺ and OH⁻ ions."
  },
  {
    id: '3',
    topic: 'Coding / CS',
    question: "What is Time Complexity of Binary Search?",
    answer: "O(log N). Because the search space is halved in every step on a sorted array."
  },
  {
    id: '4',
    topic: 'Biology',
    question: "Which organelle is known as the powerhouse of the cell?",
    answer: "Mitochondria. It generates ATP (adenosine triphosphate) through cellular respiration."
  },
  {
    id: '5',
    topic: 'Maths',
    question: "What is the derivative of sin(x) and cos(x)?",
    answer: "d/dx[sin(x)] = cos(x) and d/dx[cos(x)] = -sin(x)."
  }
];

export function StudyHub({
  isOpen,
  onClose,
  isStudyModeActive,
  onToggleStudyMode,
  selectedSubject,
  onSelectSubject,
  onSendPromptToMahi,
  theme
}: StudyHubProps) {
  const [activeTab, setActiveTab] = useState<'subject' | 'timer' | 'prompts' | 'flashcards' | 'stats'>('subject');

  // Pomodoro Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');
  const [playFocusAudio, setPlayFocusAudio] = useState(false);
  const [customPromptText, setCustomPromptText] = useState('');

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Stats stored in localStorage
  const [stats, setStats] = useState<StudySessionStats>(() => {
    const saved = localStorage.getItem('mahiStudyStats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { minutesStudied: 45, completedPomodoros: 2, streakDays: 3 };
  });

  useEffect(() => {
    localStorage.setItem('mahiStudyStats', JSON.stringify(stats));
  }, [stats]);

  // Pomodoro timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerMode === 'study') {
              setStats(s => ({
                ...s,
                minutesStudied: s.minutesStudied + 25,
                completedPomodoros: s.completedPomodoros + 1
              }));
              alert('🎉 Pomodoro Completed! Time for a 5-minute break with Mahi!');
              setTimerMode('break');
              return 5 * 60;
            } else {
              alert('✨ Break ended! Ready to focus again with Mahi?');
              setTimerMode('study');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  // Format MM:SS
  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePromptClick = (template: string) => {
    const targetSubject = SUBJECT_CATEGORIES.find(s => s.id === selectedSubject)?.title || 'My Studies';
    const finalMsg = template.includes('[topic]')
      ? template.replace('[topic]', targetSubject)
      : `${template} (${targetSubject})`;
    
    onSendPromptToMahi(finalMsg);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPromptText.trim()) return;
    onSendPromptToMahi(`[STUDY QUESTION] ${customPromptText}`);
    setCustomPromptText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-[#0b0814] border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/30 bg-[#120b24] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
              <GraduationCap size={22} className="text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">Mahi AI Study Suite</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  World-Class Tutor
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80">Socratic learning, doubts solver & focus companion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Master Study Mode Toggle */}
            <button
              onClick={() => onToggleStudyMode(!isStudyModeActive)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-md ${
                isStudyModeActive
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isStudyModeActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              <span>{isStudyModeActive ? 'Study Mode ON 🎓' : 'Enable Study Mode'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-purple-300 hover:text-white transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-around bg-black/40 p-2 border-b border-purple-900/20 text-xs font-medium overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('subject')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'subject'
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={15} /> Categories & Target
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Timer size={15} /> Pomodoro Focus
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'prompts'
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={15} /> Instant Tutor Tools
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <BrainCircuit size={15} /> Flashcards
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame size={15} /> Progress & Streak
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: SUBJECT CATEGORIES */}
          {activeTab === 'subject' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Select Your Study Field</h3>
                  <p className="text-xs text-purple-300/80">Mahi adjusts her explanations according to your exact target!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUBJECT_CATEGORIES.map((cat) => {
                  const isSelected = selectedSubject === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onSelectSubject(cat.id)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer relative overflow-hidden bg-gradient-to-br ${cat.color} ${
                        isSelected ? 'ring-2 ring-purple-400 border-purple-400 scale-[1.02] shadow-xl' : 'hover:border-purple-500/50 opacity-90 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">{cat.icon}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Selected
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">{cat.title}</h4>
                        <p className="text-[11px] text-purple-200/80 mt-0.5 leading-snug">{cat.subtitle}</p>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {cat.topics.map((t, idx) => (
                          <span key={idx} className="text-[9px] px-2 py-0.5 rounded-md bg-black/40 text-purple-200 border border-white/5">
                            {t}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: POMODORO TIMER */}
          {activeTab === 'timer' && (
            <div className="flex flex-col items-center justify-center gap-6 py-4">
              <div className="text-center">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {timerMode === 'study' ? '🎯 Focus Session (25 Min)' : '☕ Rest & Relax with Mahi (5 Min)'}
                </span>
                <p className="text-xs text-purple-300/80 mt-2">
                  Stay focused on your study goals. Mahi will keep you motivated!
                </p>
              </div>

              {/* Timer Dial Display */}
              <div className="relative w-48 h-48 rounded-full border-4 border-purple-500/30 bg-purple-950/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <span className="text-4xl font-mono font-black text-white tracking-widest">
                  {formatTime(timerSeconds)}
                </span>
                <span className="text-xs text-purple-300 mt-1 font-semibold uppercase">
                  {isTimerRunning ? 'In Progress...' : 'Paused'}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white transition-all shadow-lg cursor-pointer ${
                    isTimerRunning ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  }`}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(timerMode === 'study' ? 25 * 60 : 5 * 60);
                  }}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-purple-300 transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: INSTANT TUTOR TOOLS */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Ask Mahi Anything (Doubts & Explanations)</h3>
                <p className="text-xs text-purple-300/80">Tap any quick Socratic prompt or type your custom subject doubt below!</p>
              </div>

              {/* Preset Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_PROMPTS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(p.template)}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-400 text-left transition-all flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-200">{p.title}</h4>
                        <p className="text-[10px] text-purple-300/70 mt-0.5 line-clamp-1">{p.template}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Ask Box */}
              <form onSubmit={handleCustomSubmit} className="pt-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={customPromptText}
                    onChange={(e) => setCustomPromptText(e.target.value)}
                    placeholder="Type your question or topic (e.g. Solve 2x + 5 = 15 or Explain photosynthesis)..."
                    className="w-full pl-4 pr-12 py-3 bg-white/5 border border-purple-500/30 rounded-2xl text-xs text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="flex flex-col items-center gap-5 py-2">
              <div className="flex items-center justify-between w-full text-xs">
                <span className="text-purple-300 font-semibold">
                  Card {currentCardIdx + 1} of {DEFAULT_FLASHCARDS.length} ({DEFAULT_FLASHCARDS[currentCardIdx].topic})
                </span>
                <span className="text-purple-400 text-[10px]">Tap card to flip answer</span>
              </div>

              {/* Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md h-52 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-[#160c30] to-[#0c071d] p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl hover:border-purple-400 transition-all relative overflow-hidden"
              >
                <span className="absolute top-3 left-4 text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  {isFlipped ? '💡 ANSWER' : '❓ QUESTION'}
                </span>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={isFlipped ? 'ans' : 'ques'}
                    initial={{ rotateX: 90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-3 px-2"
                  >
                    <p className={`text-sm font-bold ${isFlipped ? 'text-emerald-300' : 'text-white'}`}>
                      {isFlipped ? DEFAULT_FLASHCARDS[currentCardIdx].answer : DEFAULT_FLASHCARDS[currentCardIdx].question}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIdx((prev) => (prev > 0 ? prev - 1 : DEFAULT_FLASHCARDS.length - 1));
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIdx((prev) => (prev + 1) % DEFAULT_FLASHCARDS.length);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  Next Card
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PROGRESS & STREAK */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center text-center">
                  <Flame size={24} className="text-amber-400 animate-bounce" />
                  <span className="text-xl font-bold text-white mt-1">{stats.streakDays} Days</span>
                  <span className="text-[10px] text-amber-300 uppercase font-semibold">Study Streak</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col items-center text-center">
                  <Timer size={24} className="text-purple-400" />
                  <span className="text-xl font-bold text-white mt-1">{stats.minutesStudied} Mins</span>
                  <span className="text-[10px] text-purple-300 uppercase font-semibold">Focus Time</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center text-center">
                  <Award size={24} className="text-emerald-400" />
                  <span className="text-xl font-bold text-white mt-1">{stats.completedPomodoros}</span>
                  <span className="text-[10px] text-emerald-300 uppercase font-semibold">Pomodoros</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  Mahi's Teacher Promise
                </h4>
                <p className="text-[11px] text-purple-200/80 leading-relaxed">
                  "No matter what subject or exam you are preparing for, I will explain every topic patiently until you understand 100%! Ask me anything without fear!"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#120b24] border-t border-purple-900/30 text-center text-[11px] text-purple-300/80 flex items-center justify-between px-6">
          <span>Active Field: <strong className="text-white">{SUBJECT_CATEGORIES.find(s => s.id === selectedSubject)?.title}</strong></span>
          <button onClick={onClose} className="hover:text-white transition-colors cursor-pointer">Close Suite</button>
        </div>
      </motion.div>
    </div>
  );
}
