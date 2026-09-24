import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, Moon, X, Sparkles, Volume2, ShieldCheck } from 'lucide-react';
import { requestScreenWakeLock, releaseScreenWakeLock } from '../utils/mobileControls';

interface AmbientLockScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onWakeVoice: () => void;
  isWakeWordActive: boolean;
  lastHeardWakeWord?: string;
}

export const AmbientLockScreen: React.FC<AmbientLockScreenProps> = ({
  isOpen,
  onClose,
  onWakeVoice,
  isWakeWordActive,
  lastHeardWakeWord,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Keep screen awake while on ambient standby screen
    requestScreenWakeLock();

    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('hi-IN', { weekday: 'long', month: 'short', day: 'numeric' }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => {
      clearInterval(interval);
      releaseScreenWakeLock();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between items-center px-6 py-10 select-none"
    >
      {/* Top Bar: Status */}
      <div className="w-full flex items-center justify-between text-white/50 text-xs">
        <div className="flex items-center gap-2">
          <Moon size={14} className="text-purple-400" />
          <span>Ambient Standby Mode (OLED Power Saver)</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          title="Exit Standby"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center: Clock & Listening State */}
      <div className="flex flex-col items-center justify-center my-auto text-center space-y-6">
        <div className="space-y-1">
          <h1 className="text-6xl sm:text-7xl font-light tracking-tight text-white/90 font-mono">
            {timeStr}
          </h1>
          <p className="text-sm text-white/50 uppercase tracking-wider font-medium">
            {dateStr}
          </p>
        </div>

        {/* Pulsing Visualizer */}
        <div className="relative flex items-center justify-center py-6">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-purple-600/30 to-pink-600/30 blur-xl"
          />

          <button
            onClick={onWakeVoice}
            className="relative z-10 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white/5 hover:bg-white/10 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all cursor-pointer group"
          >
            <Mic size={32} className="text-pink-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <span>
              {isWakeWordActive ? "Listening for 'Hey Mahi'..." : "Tap mic or say 'Hey Mahi'"}
            </span>
          </div>

          {lastHeardWakeWord && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-pink-300 font-medium"
            >
              Heard: "{lastHeardWakeWord}" — Waking up!
            </motion.p>
          )}

          <p className="text-xs text-white/40 leading-relaxed">
            Screen band nahi hogi. Bedside ya table par rakh kar bina haath lagaye kabhi bhi boliye:
            <span className="text-pink-300 font-medium"> "Hey Mahi, call mummy"</span> ya <span className="text-pink-300 font-medium">"Hey Mahi, gana sunao"</span>.
          </p>
        </div>
      </div>

      {/* Bottom info */}
      <div className="w-full flex items-center justify-between text-[11px] text-white/40 pt-4 border-t border-white/10">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-green-400" />
          <span>Screen Lock Awake Active</span>
        </span>
        <button
          onClick={onClose}
          className="text-purple-300 hover:underline cursor-pointer"
        >
          Normal Screen par laayein
        </button>
      </div>
    </motion.div>
  );
};
