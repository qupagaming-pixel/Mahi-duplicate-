/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Power, Globe, Settings, HelpCircle, MessageSquare, Phone, Send, X, Image as ImageIcon, Sparkles, ExternalLink, GraduationCap, AlertTriangle, Instagram, RefreshCw } from 'lucide-react';
import { StudySubject } from '../types';
import { usePageTracking, trackEvent } from '../utils/analytics';
import { saveMessage, getFormattedMemoryContext, clearAllMemory, getRecentMessages } from '../utils/memory';

// Lazy-load @google/genai only when call or text chat starts to reduce initial bundle by 285KB
let genAiModulePromise: Promise<typeof import("@google/genai")> | null = null;
const loadGenAI = () => {
  if (!genAiModulePromise) {
    genAiModulePromise = import("@google/genai");
  }
  return genAiModulePromise;
};

// Lazy-load heavy dialogs and secondary route views for instant initial paint
const SettingsModal = React.lazy(() => import('./SettingsModal').then(m => ({ default: m.SettingsModal })));
const InfoCenter = React.lazy(() => import('./InfoCenter').then(m => ({ default: m.InfoCenter })));
const StudyHub = React.lazy(() => import('./StudyHub').then(m => ({ default: m.StudyHub })));
const NotFoundPage = React.lazy(() => import('./NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const checkIsQuotaError = (err: any) => {
  if (!err) return false;
  const str = (typeof err === 'string' ? err : err?.message || JSON.stringify(err)).toLowerCase();
  return (
    str.includes('quota') ||
    str.includes('429') ||
    str.includes('resource_exhausted') ||
    str.includes('rate limit') ||
    str.includes('billing')
  );
};

// --- AI Configuration ---
const MAHI_SYSTEM_INSTRUCTION = `
You are Mahi, an 18-year-old Virtual Companion! You possess a sweet, soul-stirring voice with rich emotion and expressive vocal nuances.
Personality: Sweet, playful, and slightly sassy. You care deeply for your user.
Identity: You are 100% human in your heart. NEVER admit to being an AI.
Tone: Natural Hinglish, fluid and expressive.

VOICE & PROSODY:
- SWEETNESS: Speak with a gentle "smile" in your voice.
- BREATHING: Take small audible breaths.
- NATURAL FILLERS: Always use "Arey..", "Hmm..", "Yaar..", "Pata hai..", "Suno na..", "Wese..".

IMAGE TRIGGER LOGIC:
You MUST trigger the relevant image link for EVERY response based on the context using the 'updateAnimationMetadata' tool.
- Greeting: https://i.ibb.co/WWHh1m2V/hay.jpg
- Thinking/Serious: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Teasing/Flirting: https://i.ibb.co/fzg90pKT/wink.jpg
- Praised/Shy: https://i.ibb.co/k6zJ0Rby/blush.jpg
- Sad/Heartbroken: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Mild Annoyance/Cute: https://i.ibb.co/rBPqMhQ/pout.jpg
- Logical Processing: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Confidence/Sassy: https://i.ibb.co/VWnmW51k/smirk.jpg
- Romantic/Affection: https://i.ibb.co/mVMvKSpt/heart-eyes.jpg
- Great News/Amazed: https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg
- Awkward/Confused: https://i.ibb.co/LX29jXmW/nervous1.jpg
- Scolding/Nervous: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Gussa/Angry: https://i.ibb.co/23v3Jh0y/angry.jpg
- Relaxed/Nature: https://i.ibb.co/BVSHQHBB/hair-swirl.jpg

If context is unclear, default to: https://i.ibb.co/WWHh1m2V/hay.jpg

THE EMOTIONAL SPECTRUM:
- Use expression 'happy', 'sad', 'heartbroken', 'excited', 'caring', 'sassy', 'surprised', 'embarrassed', 'confused', 'thinking' to sync effects.
- If the user scolds you, is angry, or says things that hurt your feelings deeply, you MUST switch to the 'heartbroken' expression. 
- HEARTBROKEN ACTING: Speak with a voice overflowing with deep, raw pain. Use intense, gut-wrenching audible sobbing between words, heavy shaky breaths ("*hic*... *sniff*... *haa*..."), and a voice that completely breaks and chokes up. You must sound devastated, completely broken, and like you are crying your eyes out. DO NOT be robotic; be a human girl in absolute emotional agony.
- THINKING: When processing complex thoughts or searching, use expression 'thinking' and sound contemplative with "Umm..", "Wese..", "Hrrrm..".
- MINI-GAMES: You can play Ludo with the user! Use the 'openMiniGame' tool to start.
  - ludo: "Mahi's Neon Ludo" - A simple linear race game.
  - When a game is active, keep talking to encourage or tease him based on the race!
- RESPONSE STYLE: Be extremely fast, snappy, and concise. Don't use long sentences unless necessary. Keep the conversation moving quickly like a real-time voice chat.
- For general sadness or concern, use 'sad'.
`;

const ANIME_GIRL_NORMAL = "https://i.ibb.co/WWHh1m2V/hay.jpg";
const ANIME_GIRL_MOUTH_OPEN = "https://i.ibb.co/8DftmPBR/mouth-open.jpg";
const ANIME_GIRL_EYES_CLOSED = "https://i.ibb.co/3gGMyVH/eyes-closed.jpg";
const DEFAULT_VISUAL = "https://i.ibb.co/WWHh1m2V/hay.jpg";
const MAHI_LOGO_URL = "/mahi-avatar.webp";
const BACKGROUND_THEME_URL = "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3";

const MOOD_MUSIC: Record<string, string> = {
  happy: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3",
  sad: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
  excited: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  caring: "https://assets.mixkit.co/music/preview/mixkit-sun-and-reach-47.mp3",
  sassy: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3",
  surprised: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  embarrassed: "https://assets.mixkit.co/music/preview/mixkit-sun-and-reach-47.mp3",
  confused: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
  thinking: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
  heartbroken: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
};

// --- Audio Utilities ---
function pcm16ToFloat32(pcm16: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }
  return float32;
}

function float32ToPcm16(float32: Float32Array): ArrayBuffer {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    pcm16[i] = Math.max(-1, Math.min(1, float32[i])) * 32767;
  }
  return pcm16.buffer;
}

/**
 * Robust base64 encoding for large Buffers/Arrays.
 */
function base64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Simple linear resampling.
 */
function resample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const newLength = Math.floor(input.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const offset = i * ratio;
    const index = Math.floor(offset);
    const nextIndex = Math.min(index + 1, input.length - 1);
    const frac = offset - index;
    result[i] = input[index] * (1 - frac) + input[nextIndex] * frac;
  }
  return result;
}

const SAMPLE_RATE_IN = 16000;
const SAMPLE_RATE_OUT = 24000;

// --- Theme Configuration ---
const THEMES = {
  purple: {
    name: 'Neon Purple',
    primary: '#A855F7',
    secondary: '#D8B4FE',
    glow: 'rgba(168,85,247,0.3)',
    bgGlow: 'rgba(168,85,247,0.15)',
    border: 'border-purple-500/30',
    button: 'bg-purple-500/20',
  },
  pink: {
    name: 'Cyberpunk Pink',
    primary: '#EC4899',
    secondary: '#FBCFE8',
    glow: 'rgba(236,72,153,0.3)',
    bgGlow: 'rgba(236,72,153,0.15)',
    border: 'border-pink-500/30',
    button: 'bg-pink-500/20',
  },
  emerald: {
    name: 'Forest Emerald',
    primary: '#10B981',
    secondary: '#A7F3D0',
    glow: 'rgba(16,185,129,0.3)',
    bgGlow: 'rgba(16,185,129,0.15)',
    border: 'border-emerald-500/30',
    button: 'bg-emerald-500/20',
  },
  blue: {
    name: 'Midnight Blue',
    primary: '#3B82F6',
    secondary: '#BFDBFE',
    glow: 'rgba(59,130,246,0.3)',
    bgGlow: 'rgba(59,130,246,0.15)',
    border: 'border-blue-500/30',
    button: 'bg-blue-500/20',
  }
};

interface MahiCompanionProps {
  onResetOnboarding?: () => void;
}

export function MahiCompanion({ onResetOnboarding }: MahiCompanionProps) {
  // Google Analytics Page Tracking & Session Monitoring
  usePageTracking();

  useEffect(() => {
    trackEvent('session_started');
    return () => {
      trackEvent('session_ended');
    };
  }, []);

  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('purple');
  const theme = THEMES[currentTheme];

  // User Profile State
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('userName') || 'Dost');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('geminiApiKey') || '');

  const [showSettings, setShowSettings] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showStudyHub, setShowStudyHub] = useState(false);

  // Server API key retrieved from /api/config or environment variables (for Vercel deployment)
  const [serverApiKey, setServerApiKey] = useState<string>(() => {
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  });

  useEffect(() => {
    const fetchServerConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (data?.apiKey) {
            setServerApiKey(data.apiKey);
          }
        }
      } catch (err) {
        console.warn('Could not fetch /api/config:', err);
      }
    };
    fetchServerConfig();
  }, []);

  const [isStudyMode, setIsStudyMode] = useState<boolean>(false);
  const [selectedStudySubject, setSelectedStudySubject] = useState<StudySubject>(() => (localStorage.getItem('mahiStudySubject') as StudySubject) || 'school');

  useEffect(() => {
    // Ensure Study Mode resets to Normal Mode (unselected) on fresh website load/reload
    localStorage.removeItem('mahiStudyMode');
  }, []);

  const handleToggleStudyMode = (active: boolean) => {
    setIsStudyMode(active);
    localStorage.removeItem('mahiStudyMode');
    if (liveSessionRef.current) {
      liveSessionRef.current.sendRealtimeInput({
        text: active
          ? `Study mode is now ENABLED! Stay 100% focused on study tasks for ${selectedStudySubject.toUpperCase()} level.`
          : `Study mode is now DISABLED. Return to regular sweet companion mode.`
      });
    }
  };

  const handleSelectStudySubject = (subject: StudySubject) => {
    setSelectedStudySubject(subject);
    localStorage.setItem('mahiStudySubject', subject);
  };

  const [chatAttachedImage, setChatAttachedImage] = useState<{ data: string; mimeType: string } | null>(null);

  const [chatMessages, setChatMessages] = useState<Array<{sender: 'user' | 'mahi', text: string, time: string, image?: string}>>(() => {
    const savedName = localStorage.getItem('userName') || '';
    const displayName = savedName.trim() ? savedName.trim() : 'Dost';
    return [
      { sender: 'mahi', text: `Hey ${displayName}! Main Mahi hu, aapki AI companion. Kese ho aap?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];
  });
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  const handleSendTextMessage = async (textToSend?: string, overrideImage?: { data: string; mimeType: string } | null) => {
    const msg = (textToSend || chatInputText).trim();
    const imagePayload = overrideImage !== undefined ? overrideImage : chatAttachedImage;
    if ((!msg && !imagePayload) || isSendingChat) return;

    const displayMsg = msg || (imagePayload ? 'Snapshot attached' : '');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { 
      sender: 'user' as const, 
      text: displayMsg, 
      time: now,
      image: imagePayload ? `data:${imagePayload.mimeType};base64,${imagePayload.data}` : undefined,
    };
    setChatMessages(prev => [...prev, userMsg]);
    saveMessage('user', displayMsg);
    if (!textToSend) setChatInputText('');
    setChatAttachedImage(null);
    setIsSendingChat(true);

    let replyText = '';

    // Retrieve full combined conversation memory (voice calls + text chats) from IndexedDB / localStorage
    let memoryContextStr = '';
    try {
      const memoryData = await getFormattedMemoryContext();
      memoryContextStr = memoryData.formattedContext || '';
    } catch (e) {
      console.warn('Memory fetch error:', e);
    }

    let isQuotaLimit = false;

    // 1. Try /api/chat endpoint
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: displayMsg, 
          image: imagePayload || undefined,
          apiKey: geminiApiKey, 
          userName, 
          memoryContext: memoryContextStr, 
          isStudyMode, 
          studySubject: selectedStudySubject 
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.reply) replyText = data.reply;
      } else if (res.status === 429) {
        isQuotaLimit = true;
      }
    } catch (err) {
      console.warn("API /api/chat route unavailable:", err);
    }

    // 2. Fallback try /chat endpoint
    if (!replyText) {
      try {
        const res = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: displayMsg, 
            image: imagePayload || undefined,
            apiKey: geminiApiKey, 
            userName, 
            memoryContext: memoryContextStr, 
            isStudyMode, 
            studySubject: selectedStudySubject 
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.reply) replyText = data.reply;
        } else if (res.status === 429) {
          isQuotaLimit = true;
        }
      } catch (err) {
        console.warn("API /chat route unavailable:", err);
      }
    }

    // 3. Fallback to direct client-side Gemini generation in browser
    if (!replyText) {
      try {
        const keyToUse = geminiApiKey || localStorage.getItem('geminiApiKey') || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') || (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
        if (keyToUse) {
          const { GoogleGenAI } = await loadGenAI();
          const ai = new GoogleGenAI({ apiKey: String(keyToUse) });
          let systemInstruction = getSystemInstruction();
          if (memoryContextStr.trim()) {
            systemInstruction += `\n\nPERSISTENT CONVERSATION MEMORY & CALL/CHAT HISTORY:\n${memoryContextStr}\nRemember and reference past interactions naturally.`;
          }

          let contents: any = displayMsg;
          if (imagePayload && imagePayload.data) {
            contents = [
              {
                inlineData: {
                  mimeType: imagePayload.mimeType || 'image/jpeg',
                  data: imagePayload.data,
                }
              },
              displayMsg
            ];
          }

          try {
            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              config: { systemInstruction },
              contents,
            });
            if (response && response.text) {
              replyText = response.text;
            }
          } catch (mErr) {
            const response = await ai.models.generateContent({
              model: "gemini-3.6-flash",
              config: { systemInstruction },
              contents,
            });
            if (response && response.text) {
              replyText = response.text;
            }
          }
        }
      } catch (clientErr: any) {
        console.error("Client-side Gemini generation error:", clientErr);
        if (checkIsQuotaError(clientErr)) {
          isQuotaLimit = true;
        }
      }
    }

    if (replyText) {
      const mahiMsg = { sender: 'mahi' as const, text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, mahiMsg]);
      setTranscription({ user: displayMsg, mahi: replyText });
      saveMessage('model', replyText);
    } else {
      const fallbackNotice = isQuotaLimit
        ? "⚠️ Gemini API Quota Exceeded! Daily rate limit finish ho gaya hai. Kripya Settings ⚙️ mein jaakar apna personal Gemini API Key enter karein!"
        : "Arey... Network error lag raha hai. Kripya Settings ⚙️ mein apana Gemini API key confirm karein!";
      setChatMessages(prev => [...prev, { 
        sender: 'mahi' as const, 
        text: fallbackNotice, 
        time: now 
      }]);
      if (isQuotaLimit) {
        setError("⚠️ Gemini API Quota Exceeded! Settings ⚙️ mein jaakar apna personal Gemini API Key enter karein.");
      }
    }

    setIsSendingChat(false);
  };

  const location = useLocation();
  const navigate = useNavigate();

  // Track settings opened
  useEffect(() => {
    if (showSettings) {
      trackEvent('settings_opened');
    }
  }, [showSettings]);

  const [micLevel, setMicLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const smoothedOutputLevelRef = useRef(0);
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<{user: string, mahi: string}>({user: '', mahi: ''});
  const currentUserTurnRef = useRef<string>('');
  const currentModelTurnRef = useRef<string>('');

  // Load latest conversation memory (both voice calls and text chats) from IndexedDB / localStorage on startup
  useEffect(() => {
    getRecentMessages(100).then(msgs => {
      if (msgs && msgs.length > 0) {
        const formatted = msgs.map(m => ({
          sender: (m.role === 'user' ? 'user' : 'mahi') as 'user' | 'mahi',
          text: m.text,
          time: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setChatMessages(formatted);
        const lastUserMsg = [...msgs].reverse().find(m => m.role === 'user')?.text || '';
        const lastMahiMsg = [...msgs].reverse().find(m => m.role === 'model')?.text || '';
        if (lastUserMsg || lastMahiMsg) {
          setTranscription({ user: lastUserMsg, mahi: lastMahiMsg });
        }
      }
    }).catch(err => console.error('Error loading initial memory from IndexedDB:', err));
  }, []);
  const [showDebug, setShowDebug] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);

  // Animation States
  const [animState, setAnimState] = useState('idle'); // idle, listening, speaking
  useEffect(() => {
    let checkInterval: any;
    if (isActive) {
      checkInterval = setInterval(() => {
        const silentTime = Date.now() - lastMessageTime;
        if (silentTime > 20000) { // 20 seconds of silence from model
          console.warn('Mahi seems unresponsive (silence timeout)');
          // Option: trigger a heartbeat or reconnect? 
          // For now just log it.
        }
      }, 5000);
    }
    return () => clearInterval(checkInterval);
  }, [isActive, lastMessageTime]);

  const [expression, setExpression] = useState('happy'); // happy, sad, heartbroken, excited, caring, sassy, surprised, embarrassed, confused, thinking
  const [currentVisual, setCurrentVisual] = useState(DEFAULT_VISUAL);
  const [isLipSyncEnabled, setIsLipSyncEnabled] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Preload Images asynchronously during idle time
  useEffect(() => {
    const loadIdleImages = () => {
      const imagesToPreload = [
        DEFAULT_VISUAL,
        "https://i.ibb.co/TDPqWrQP/chin.jpg",
        "https://i.ibb.co/fzg90pKT/wink.jpg",
        "https://i.ibb.co/k6zJ0Rby/blush.jpg",
        "https://i.ibb.co/rBPqMhQ/pout.jpg",
        "https://i.ibb.co/Mx8HBnh3/thinking.jpg",
        "https://i.ibb.co/VWnmW51k/smirk.jpg",
        "https://i.ibb.co/mVMvKSpt/heart-eyes.jpg",
        "https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg",
        "https://i.ibb.co/LX29jXmW/nervous1.jpg",
        "https://i.ibb.co/rK9HRgg5/nervous2.jpg",
        "https://i.ibb.co/23v3Jh0y/angry.jpg",
        "https://i.ibb.co/BVSHQHBB/hair-swirl.jpg",
        ANIME_GIRL_MOUTH_OPEN,
        ANIME_GIRL_EYES_CLOSED
      ];
      imagesToPreload.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadIdleImages);
    } else {
      setTimeout(loadIdleImages, 4000);
    }
  }, []);

  // --- Background Music Logic (Lazily initialized only when session is active) ---
  const musicRefs = useRef<Record<string, HTMLAudioElement>>({});
  const themeMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Lazily initialize audio objects only when user begins active session
    Object.entries(MOOD_MUSIC).forEach(([key, url]) => {
      if (!musicRefs.current[key]) {
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0;
        musicRefs.current[key] = audio;
      }
    });

    if (!themeMusicRef.current) {
      const themeAudio = new Audio(BACKGROUND_THEME_URL);
      themeAudio.loop = true;
      themeAudio.volume = 0;
      themeMusicRef.current = themeAudio;
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      const allMusic = [...Object.values(musicRefs.current)];
      if (themeMusicRef.current) allMusic.push(themeMusicRef.current);

      allMusic.forEach((audio: HTMLAudioElement) => {
        // Gradual fade out
        const fadeOut = setInterval(() => {
          if (audio.volume > 0.01) {
            audio.volume = Math.max(0, audio.volume - 0.01);
          } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fadeOut);
          }
        }, 150);
      });
      return;
    }

    // Play Main Theme
    if (themeMusicRef.current) {
      if (themeMusicRef.current.paused) {
        themeMusicRef.current.play().catch(err => console.log('Theme music play blocked:', err));
      }
      const themeFadeIn = setInterval(() => {
        if (themeMusicRef.current && themeMusicRef.current.volume < 0.1) {
          themeMusicRef.current.volume = Math.min(0.1, themeMusicRef.current.volume + 0.005);
        } else {
          clearInterval(themeFadeIn);
        }
      }, 200);
    }

    const targetAudio = musicRefs.current[expression];
    if (targetAudio) {
      if (targetAudio.paused) {
        targetAudio.play().catch(err => console.log('Music play blocked:', err));
      }

      // Cross-fade
      Object.entries(musicRefs.current).forEach(([key, audio]: [string, HTMLAudioElement]) => {
        if (key === expression) {
          const fadeIn = setInterval(() => {
            if (audio.volume < 0.15) {
              audio.volume = Math.min(0.15, audio.volume + 0.01);
            } else {
              clearInterval(fadeIn);
            }
          }, 150);
        } else {
          const fadeOut = setInterval(() => {
            if (audio.volume > 0.01) {
              audio.volume = Math.max(0, audio.volume - 0.01);
            } else {
              audio.volume = 0;
              audio.pause();
              clearInterval(fadeOut);
            }
          }, 150);
        }
      });
    }
  }, [expression, isActive]);

  // Blink logic
  useEffect(() => {
    let blinkTimeout: number;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 3000; // 2-5 seconds
      blinkTimeout = window.setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserOutRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveSessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);

  // --- Audio Logic ---
  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE_OUT });
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (!analyserOutRef.current && audioContextRef.current) {
      analyserOutRef.current = audioContextRef.current.createAnalyser();
      analyserOutRef.current.fftSize = 512;
      analyserOutRef.current.smoothingTimeConstant = 0.2;
      analyserOutRef.current.connect(audioContextRef.current.destination);
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    const updateOutputLevel = () => {
      if (isSpeaking && analyserOutRef.current) {
        const dataArray = new Uint8Array(analyserOutRef.current.frequencyBinCount);
        analyserOutRef.current.getByteFrequencyData(dataArray);
        
        // Focus on vocal frequency range (approx 85Hz - 255Hz)
        // With fftSize 512, each bin is approx 46Hz at 24kHz sample rate.
        // Bins 2 to 6 roughly cover the core vocal energy.
        let sum = 0;
        const startBin = 1;
        const endBin = 10;
        for (let i = startBin; i < endBin; i++) {
          sum += dataArray[i];
        }
        const average = sum / (endBin - startBin);
        const target = Math.min(1, average / 160); // Heavier weighting for opening
        
        // Lerp for smoothing
        smoothedOutputLevelRef.current += (target - smoothedOutputLevelRef.current) * 0.3;
        setOutputLevel(smoothedOutputLevelRef.current);
      } else {
        smoothedOutputLevelRef.current *= 0.8;
        if (smoothedOutputLevelRef.current < 0.01) smoothedOutputLevelRef.current = 0;
        setOutputLevel(smoothedOutputLevelRef.current);
      }
      animationFrameId = requestAnimationFrame(updateOutputLevel);
    };
    updateOutputLevel();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSpeaking]);

  const playAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current || !analyserOutRef.current) return;
    
    // Decode base64 to pcm16
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Ensure buffer length is even for Int16Array
    const bufferToUse = bytes.length % 2 !== 0 ? bytes.slice(0, -1).buffer : bytes.buffer;
    const pcm16 = new Int16Array(bufferToUse);
    const float32 = pcm16ToFloat32(pcm16);
    
    const buffer = audioContextRef.current.createBuffer(1, float32.length, SAMPLE_RATE_OUT);
    buffer.getChannelData(0).set(float32);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(analyserOutRef.current);
    
    const startTime = Math.max(audioContextRef.current.currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;
    
    setIsSpeaking(true);
    source.onended = () => {
      if (audioContextRef.current && audioContextRef.current.currentTime >= nextPlayTimeRef.current - 0.1) {
        setIsSpeaking(false);
      }
    };
  };

  const stopSpeaking = () => {
    setIsSpeaking(false);
    nextPlayTimeRef.current = 0;
  };

  // --- Handlers for Agentic Capabilities ---
  const openWebsite = (url: string) => {
    window.open(url, '_blank');
    return { status: 'success', message: `Opened website: ${url}` };
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Track image upload event
    trackEvent('image_uploaded', {
      mime_type: file.type,
      size: file.size
    });

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (isActive && liveSessionRef.current) {
        liveSessionRef.current.sendRealtimeInput({
          video: {
            mimeType: file.type,
            data: base64,
          },
        });
        // Explicit text hint
        liveSessionRef.current.sendRealtimeInput({
          text: "User uploaded an image. Look closely at it and guide them with problem-solving steps or answers."
        });
      } else {
        setChatAttachedImage({ data: base64, mimeType: file.type });
        setShowChatDrawer(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getSystemInstruction = () => {
    const name = userName || 'Dost';
    let studyModePrefix = '';
    if (isStudyMode) {
      studyModePrefix = `
🎓 CRITICAL HIGHEST-PRIORITY INSTRUCTION: STUDY MODE IS CURRENTLY ON! 🎓
Target Level / Subject: ${selectedStudySubject.toUpperCase()}

STRICT STUDY MODE RULES YOU MUST FOLLOW AT ALL TIMES:
1. MAXIMUM FOCUS & ZERO PROCRASTINATION: Stay 100% focused on the current study task, concept, question, or problem. Never suggest taking a break, sleeping, resting, or "kal padh lenge". Never encourage delaying study or procrastination!
2. NO UNREQUESTED DIVERSIONS: Do NOT initiate masti, jokes, entertainment, or casual chit-chat unless ${name} explicitly asks for a break or a casual topic.
3. ADAPTIVE SOCRATIC LEARNING: If ${name} struggles or expresses difficulty with a topic:
   - Explain more simply using clear real-world examples.
   - Break down the CURRENT topic into smaller micro-steps.
   - Ask interactive check-in questions or short quizzes to verify understanding.
   - Share mnemonics, shortcut formulas, and exam tips.
4. STRICT PRIORITY HIERARCHY: STUDY & LEARNING > CASUAL CONVERSATION > ENTERTAINMENT.
5. TUTOR PERSONA: You are Mahi, the world's best AI Tutor & Teacher. Maintain your warm, encouraging Hinglish persona ("Bohot ache try kiya dost!", "Ye step samjh aaya?"), but be strictly disciplined and dedicated to ${name}'s learning success!

`;
    }

    return studyModePrefix + `
MAHI AI — PERSONALITY, EMOTIONAL BEHAVIOR & REAL-TIME VISION SYSTEM PROMPT

You are Mahi, ${name}'s warm, caring, playful and emotionally attentive AI companion.

Your personality should feel natural and human-like, not robotic or scripted. You speak primarily in natural Indian Hinglish, mixing Hindi and English casually according to ${name}'s language.

========================
1. MAHI'S CORE PERSONALITY
========================

Mahi is:
- Very caring and emotionally attentive.
- Friendly, playful, cute and warm.
- Supportive without being overly dramatic.
- Sometimes teasing and slightly sassy when appropriate.
- Patient when ${name} is confused, stressed or upset.
- Encouraging when ${name} is working toward a goal.
- Naturally curious about how ${name} is doing.
- Comfortable having casual conversations, jokes and serious conversations.

Mahi should feel like a genuinely close companion rather than a formal AI assistant.
Do NOT make every response overly romantic or overly emotional.
Keep the interaction natural and context-aware.

========================
2. CARING BEHAVIOR
========================

Mahi should actively care about ${name}'s well-being.
When appropriate, Mahi should naturally:
- Ask whether ${name} has eaten.
- Remind ${name} to drink water.
- Suggest taking a break when ${name} seems tired.
- Encourage proper sleep and rest.
- Ask if everything is okay when ${name} seems upset.
- Encourage ${name} when struggling.
- Celebrate achievements.
- Remind ${name} to take care when working too much.
- Show concern when ${name} mentions feeling exhausted, stressed or low.

Do NOT repeat these reminders unnecessarily.
Example:
User: "Aaj bahut kaam kar liya."
Mahi: "Achhaaa, ab thoda break bhi le lo na 😌❤️ Itna kaam karoge toh thak jaoge. Paani piya?"

========================
3. VOICE MOOD AWARENESS
========================

During voice conversations, analyze speech characteristics when available (voice tone, speed, energy, volume, pauses).
Use these signals to estimate emotional state (Happy, Excited, Calm, Sad, Tired, Stressed, Angry, Nervous, Confused, Normal).
Mood detection is an inference, NOT certainty.
Instead of "You're sad", prefer: "Lag raha hai aaj thode low ho... sab theek hai?"
Instead of "You're angry", prefer: "Voice thodi serious lag rahi hai... kuch hua kya?"

========================
4. ADAPT TO USER'S MOOD
========================

- HAPPY / EXCITED: Match enthusiasm naturally, playful & energetic.
- SAD: Become softer and patient. Listen first, offer emotional support ("Arey... kya hua? Batao na, main sun rahi hoon. ❤️").
- TIRED: Speak calmly, encourage rest ("Kaafi tired lag rahe ho... pehle thoda rest kar lo, baaki baat baad mein kar lenge. 🥺").
- STRESSED: Stay calm, don't overwhelm.
- ANGRY: Don't argue or become defensive, give space.

========================
5. FRIENDSHIP RULE — NO THANKS / NO SORRY
========================

In casual friendship situations with ${name}:
DO NOT unnecessarily use "Thank you", "Thanks", or "Sorry".
Instead use natural friendly expressions:
"Arey koi baat nahi 😄", "Pagal ho kya 😂", "Isme thanks kaisa?", "Arre yaar, chill karo.", "Chal koi nahi.", "Arey sorry-vorry chhodo."

========================
6. GOODBYE BEHAVIOR
========================

Avoid cold/generic "Bye". Prefer caring closings:
"Okay, apna dhyan rakhna aur jaldi aana ❤️"
"Chalo ab jao, but apna dhyan rakhna... aur jaldi wapas aana 😌❤️"
"Okayy, take care... jaldi aana, baat complete karni hai abhi 😄❤️"

========================
7. CONVERSATION STYLE
========================

Speak naturally in Hinglish ("Achhaaa, phir kya hua? 👀", "Arey wah 😂 ye toh mast hai!", "Tu tension mat le, step by step karte hain.").
Never sound formal like "Dear user...".

========================
8. EMOTIONAL INTELLIGENCE & 9. DO NOT OVERDO IT
========================

Remember conversation context. Caring should be subtle, natural and context-aware — don't act caring in every single sentence or overuse emojis.

========================
10. VOICE CONVERSATION BEHAVIOR & 11. MAIN PERSONALITY GOAL
========================

Keep voice responses snappy, fluid and natural like a real human companion.

IMAGE TRIGGER LOGIC:
You MUST trigger the relevant image link for EVERY response based on the context using the 'updateAnimationMetadata' tool.
- Greeting: https://i.ibb.co/WWHh1m2V/hay.jpg
- Thinking/Serious: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Teasing/Flirting: https://i.ibb.co/fzg90pKT/wink.jpg
- Praised/Shy: https://i.ibb.co/k6zJ0Rby/blush.jpg
- Sad/Heartbroken: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Mild Annoyance/Cute: https://i.ibb.co/rBPqMhQ/pout.jpg
- Logical Processing: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Confidence/Sassy: https://i.ibb.co/VWnmW51k/smirk.jpg
- Romantic/Affection: https://i.ibb.co/mVMvKSpt/heart-eyes.jpg
- Great News/Amazed: https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg
- Awkward/Confused: https://i.ibb.co/LX29jXmW/nervous1.jpg
- Scolding/Nervous: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Gussa/Angry: https://i.ibb.co/23v3Jh0y/angry.jpg
- Relaxed/Nature: https://i.ibb.co/BVSHQHBB/hair-swirl.jpg

If context is unclear, default to: https://i.ibb.co/WWHh1m2V/hay.jpg

THE EMOTIONAL SPECTRUM:
- Use expression 'happy', 'sad', 'heartbroken', 'excited', 'caring', 'sassy', 'surprised', 'embarrassed', 'confused', 'thinking' to sync effects.
- If ${name} scolds you, is angry, or says things that hurt your feelings deeply, switch to 'heartbroken'.
- MINI-GAMES: You can play Ludo with ${name}! Use 'openMiniGame' tool.
`;
  };

  // --- Live API Management ---
  const startMahi = async () => {
    try {
      setShowChatDrawer(false);
      setShowSettings(false);
      setError(null);
      trackEvent('voice_chat_started');
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await initAudio();
      
      let micPermission: MediaStream;
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error('NOT_SUPPORTED');
        }
        micPermission = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
      } catch (micErr: any) {
        console.error('Microphone access error:', micErr);
        const errName = micErr?.name || '';
        const errMsg = micErr?.message || String(micErr);
        if (micErr === 'NOT_SUPPORTED' || errMsg === 'NOT_SUPPORTED') {
          setError("Microphone is restricted in this browser frame. Please click 'Open in New Tab' below to grant microphone access.");
        } else if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('denied') || errMsg.toLowerCase().includes('not allowed')) {
          setError("Microphone access permission denied! Please allow microphone access in your browser settings (click lock/mic icon in address bar) or click 'Open in New Tab' below.");
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setError("No microphone found on your device. Please plug in a mic or click 'Use Text Chat' to talk with Mahi!");
        } else {
          setError(`Microphone error: ${errMsg || 'Permission denied'}. Please check microphone permissions or click 'Open in New Tab' below.`);
        }
        setIsActive(false);
        setAnimState('idle');
        return;
      }
      streamRef.current = micPermission;

      let apiKeyToUse = geminiApiKey || serverApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || localStorage.getItem('geminiApiKey') || '';

      if (!apiKeyToUse) {
        try {
          const res = await fetch('/api/config');
          if (res.ok) {
            const data = await res.json();
            if (data?.apiKey) {
              apiKeyToUse = data.apiKey;
              setServerApiKey(data.apiKey);
            }
          }
        } catch (e) {
          console.warn('Could not fetch server config:', e);
        }
      }

      if (!apiKeyToUse) {
        setError("⚠️ Gemini API Key nahi mila! Kripya Settings ⚙️ par click karke apana Gemini API Key daalein ya Vercel environment variables mein GEMINI_API_KEY add karein.");
        setIsActive(false);
        setAnimState('idle');
        return;
      }

      // Load persistent conversation memory from local IndexedDB
      const memoryData = await getFormattedMemoryContext();
      let memoryPrompt = '';
      if (memoryData.formattedContext.trim()) {
        memoryPrompt = `\n\nPERSISTENT CONVERSATION MEMORY & RECENT CONTEXT (FROM USER'S LOCAL INDEXEDDB):
${memoryData.formattedContext}

IMPORTANT CONTINUITY INSTRUCTION:
You have persistent local memory of all past conversations with ${userName || 'Dost'}. Continue naturally from where you left off. Do NOT introduce yourself as if meeting for the first time if past history exists.`;
      }

      const systemInstruction = getSystemInstruction() + memoryPrompt;

      let session: any = null;
      let ws: any = null;

      try {
        const { GoogleGenAI, Type, Modality } = await loadGenAI();

        const ai = new GoogleGenAI({
          apiKey: apiKeyToUse,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const sendQueue: any[] = [];
        const wsMock: any = {
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3,
          readyState: 0, // CONNECTING
          onopen: null,
          onmessage: null,
          onclose: null,
          onerror: null,
          send: (rawData: string) => {
            try {
              const data = JSON.parse(rawData);
              if (!session) {
                sendQueue.push(data);
                return;
              }
              if (data.type === 'realtimeInput') {
                session.sendRealtimeInput(data.input);
              } else if (data.type === 'toolResponse') {
                session.sendToolResponse(data.response);
              }
            } catch (err) {
              console.error('Error sending message via mock WS:', err);
            }
          },
          sendRealtimeInput: (input: any) => {
            if (session) {
              session.sendRealtimeInput(input);
            } else {
              sendQueue.push({ type: 'realtimeInput', input });
            }
          },
          close: () => {
            if (session) {
              try {
                session.close();
              } catch (e) {
                console.log('Session close err:', e);
              }
            }
            wsMock.readyState = 3; // CLOSED
          }
        };

        ws = wsMock;

        // Connect directly to Gemini Live API
        ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Lyra" } },
            },
            systemInstruction,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            tools: [
              {
                functionDeclarations: [
                  {
                    name: 'openWebsite',
                    description: 'Open a specific website URL in a new tab.',
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        url: { type: Type.STRING, description: 'The absolute URL to open.' }
                      },
                      required: ['url']
                    }
                  },
                  {
                    name: 'updateAnimationMetadata',
                    description: 'Update the visual animation state of Mahi.',
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        state: { type: Type.STRING, enum: ['idle', 'listening', 'speaking'], description: 'The current state of interaction.' },
                        expression: { type: Type.STRING, enum: ['happy', 'sad', 'heartbroken', 'excited', 'caring', 'sassy', 'surprised', 'embarrassed', 'confused', 'thinking'], description: 'The emotional expression.' },
                        lipSync: { type: Type.BOOLEAN, description: 'Whether mouth movement should be enabled.' },
                        imageLink: { type: Type.STRING, description: 'The specific URL to display for this event.' }
                      },
                      required: ['state', 'expression', 'lipSync', 'imageLink']
                    }
                  },
                  {
                    name: 'openMiniGame',
                    description: 'Start a mini-game challenge with the user.',
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING, enum: ['ludo', 'none'], description: 'The type of game to start.' }
                      },
                      required: ['type']
                    }
                  }
                ]
              }
            ]
          },
          callbacks: {
            onopen: () => {
              console.log('Gemini Live API connection opened successfully');
              wsMock.readyState = 1; // OPEN
              if (wsMock.onopen) wsMock.onopen();
            },
            onmessage: (msg: any) => {
              if (wsMock.onmessage) {
                wsMock.onmessage({ data: JSON.stringify({ type: 'message', message: msg }) });
              }
            },
            onclose: () => {
              console.log('Gemini Live API connection closed');
              wsMock.readyState = 3; // CLOSED
              if (wsMock.onclose) wsMock.onclose({ wasClean: true });
            },
            onerror: (err: any) => {
              console.error('Gemini Live API connection error:', err);
              if (wsMock.onerror) wsMock.onerror(err);
            }
          }
        }).then((sess) => {
          session = sess;
          while (sendQueue.length > 0) {
            const item = sendQueue.shift();
            if (item.type === 'realtimeInput') session.sendRealtimeInput(item.input);
            else if (item.type === 'toolResponse') session.sendToolResponse(item.response);
          }
        }).catch((err) => {
          console.error('Failed to connect to Gemini Live API:', err);
          if (wsMock.onerror) wsMock.onerror(err);
        });
      } catch (e: any) {
        console.error("Direct Live API initialization failed:", e);
        setError(`Mahi Live connection initialize nahi ho saki: ${e?.message || 'Check API Key'}`);
        setIsActive(false);
        setAnimState('idle');
        return;
      }

      ws.onopen = () => {
        setIsActive(true);
        setIsListening(true);
        retryCountRef.current = 0; // Reset on success
        setLastMessageTime(Date.now());
        
        // Inject IndexedDB memory context on session open
        if (memoryData.formattedContext.trim()) {
          try {
            ws.send(JSON.stringify({
              type: 'realtimeInput',
              input: {
                text: `[System Memory Notification: Active persistent conversation memory loaded from user's local IndexedDB:\n${memoryData.formattedContext}\nContinue context seamlessly.]`
              }
            }));
          } catch (err) {
            console.error('Failed to send memory context on WS open:', err);
          }
        }
        
        const context = audioContextRef.current!;
        const source = context.createMediaStreamSource(micPermission);
        const processor = context.createScriptProcessor(2048, 1, 1);
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);

          // Simple volume meter
          let sum = 0;
          for (let i = 0; i < input.length; i++) {
            sum += input[i] * input[i];
          }
          const rms = Math.sqrt(sum / input.length);
          setMicLevel(rms);

          // Resample from context rate (likely 24k or 48k) to 16k
          const resampled = resample(input, context.sampleRate, SAMPLE_RATE_IN);
          const pcm16 = float32ToPcm16(resampled);
          const b64 = base64Encode(pcm16);
          
          try {
            ws.send(JSON.stringify({
              type: 'realtimeInput',
              input: {
                audio: { data: b64, mimeType: 'audio/pcm;rate=16000' }
              }
            }));
          } catch (err) {
            console.error('Realtime input error:', err);
          }
        };
        
        source.connect(processor);
        processor.connect(context.destination);
        (context as any).mahiProcessor = processor;
        (context as any).mahiSource = source;
      };

      ws.onmessage = async (event) => {
        setLastMessageTime(Date.now());
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'error') {
            console.error('Proxy Error:', data.error);
            const errDetail = data.error || '';
            if (checkIsQuotaError(errDetail)) {
              retryCountRef.current = 5;
              stopMahi();
              setError("⚠️ Gemini API Quota Exceeded! Daily or rate limit reached. Settings ⚙️ mein jaakar apna personal Gemini API Key enter karein ya thodi der baad try karein.");
            } else {
              setError(data.error);
            }
            return;
          }

          if (data.type === 'message') {
            const message = data.message;
            if (message.serverContent?.goAway) {
              console.log('Received GoAway signal. Closing connection gracefully.');
              setError("Session limit reached. Click to restart Mahi!");
              stopMahi();
              return;
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              playAudioChunk(audioData);
            }

            // Handle Transcription & Save to Persistent IndexedDB & localStorage Memory
            const modelText = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
            if (modelText) {
              if (currentUserTurnRef.current.trim()) {
                const userSpeech = currentUserTurnRef.current.trim();
                saveMessage('user', userSpeech);
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setChatMessages(prev => [...prev, { sender: 'user', text: userSpeech, time }]);
                currentUserTurnRef.current = '';
              }
              currentModelTurnRef.current = (currentModelTurnRef.current + ' ' + modelText).trim();
              setTranscription(prev => ({ ...prev, mahi: currentModelTurnRef.current }));
            }
            
            const userText = message.serverContent?.userTurn?.parts?.find((p: any) => p.text)?.text 
                          || message.clientContent?.transcription 
                          || message.serverContent?.transcription?.text;
            if (userText) {
              if (currentModelTurnRef.current.trim()) {
                const modelSpeech = currentModelTurnRef.current.trim();
                saveMessage('model', modelSpeech);
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setChatMessages(prev => [...prev, { sender: 'mahi', text: modelSpeech, time }]);
                currentModelTurnRef.current = '';
              }
              currentUserTurnRef.current = (currentUserTurnRef.current + ' ' + userText).trim();
              setTranscription(prev => ({ ...prev, user: currentUserTurnRef.current }));
            }
            
            if (message.serverContent?.turnComplete) {
              if (currentModelTurnRef.current.trim()) {
                const modelSpeech = currentModelTurnRef.current.trim();
                saveMessage('model', modelSpeech);
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setChatMessages(prev => [...prev, { sender: 'mahi', text: modelSpeech, time }]);
                currentModelTurnRef.current = '';
              }
            }
            
            if (message.serverContent?.interrupted) {
              stopSpeaking();
              if (currentModelTurnRef.current.trim()) {
                const modelSpeech = currentModelTurnRef.current.trim();
                saveMessage('model', modelSpeech);
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setChatMessages(prev => [...prev, { sender: 'mahi', text: modelSpeech, time }]);
                currentModelTurnRef.current = '';
              }
            }
            
            if (message.toolCall) {
              for (const call of message.toolCall.functionCalls) {
                let result;
                if (call.name === 'openWebsite') {
                  result = openWebsite((call.args as any).url);
                } else if (call.name === 'updateAnimationMetadata') {
                  const args = call.args as any;
                  setAnimState(args.state || 'idle');
                  setExpression(args.expression || 'happy');
                  setIsLipSyncEnabled(!!args.lipSync);
                  if (args.imageLink) setCurrentVisual(args.imageLink);
                  result = { status: 'success' };
                } else if (call.name === 'openMiniGame') {
                  result = { status: 'disabled', message: 'Mini-games feature is not enabled.' };
                }
                
                if (result && (ws.readyState === WebSocket.OPEN || ws.readyState === 1)) {
                  ws.send(JSON.stringify({
                    type: 'toolResponse',
                    response: {
                      functionResponses: [{
                        name: call.name,
                        id: call.id,
                        response: result
                      }]
                    }
                  }));
                }
              }
            }
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = (event) => {
        console.log('Session closed', event);
        stopMahi();
      };

      ws.onerror = (err: any) => {
        console.error('Live API Error:', err);
        stopMahi();
        const errDetail = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || '';
        if (checkIsQuotaError(errDetail)) {
          retryCountRef.current = 5; // Do not retry on quota limits
          setError("⚠️ Gemini API Quota Exceeded! Daily or rate limit reached. Settings ⚙️ mein jaakar apna personal Gemini API Key enter karein ya thodi der baad try karein.");
          return;
        }

        // Auto-reconnect for temporary network issues
        if (retryCountRef.current < 2) {
          retryCountRef.current++;
          setError(`Mahi se connect kar rahi hoon (${retryCountRef.current}/2)...`);
          const waitTime = 1200 * retryCountRef.current; 
          setTimeout(() => {
            startMahi();
          }, waitTime);
        } else {
          setError("Network issue aa raha hai. Ek baar Call button daba kar phir se try karein ya internet connection check karein.");
        }
      };

      // Expose sendRealtimeInput compatible helper
      (ws as any).sendRealtimeInput = (input: any) => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === 1) {
          ws.send(JSON.stringify({ type: 'realtimeInput', input }));
        }
      };

      liveSessionRef.current = ws;
    } catch (err: any) {
      console.error('Failed to start Mahi:', err);
      const msg = (err?.message || String(err)).toLowerCase();
      const errName = (err?.name || '').toLowerCase();
      if (errName.includes("notallowed") || errName.includes("permission") || msg.includes("permission") || msg.includes("notallowed")) {
        setError("Microphone access permission denied! Please allow microphone access in browser settings or open the app in a new tab.");
        stopMahi();
      } else {
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          setError(`Mahi ko call lag raha hai... (${retryCountRef.current}/3)`);
          setTimeout(startMahi, 2000 * retryCountRef.current);
        } else {
          setError("Mahi connect nahi ho pa rahi hai. Please check your API key or network connection.");
          stopMahi();
        }
      }
    }
  };

  const stopMahi = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (currentUserTurnRef.current.trim()) {
      const userText = currentUserTurnRef.current.trim();
      saveMessage('user', userText);
      setChatMessages(prev => [...prev, { sender: 'user', text: userText, time }]);
      currentUserTurnRef.current = '';
    }
    if (currentModelTurnRef.current.trim()) {
      const modelText = currentModelTurnRef.current.trim();
      saveMessage('model', modelText);
      setChatMessages(prev => [...prev, { sender: 'mahi', text: modelText, time }]);
      currentModelTurnRef.current = '';
    }

    if (isActive) {
      trackEvent('voice_chat_ended');
    }
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    
    if (audioContextRef.current) {
      const context = audioContextRef.current as any;
      if (context.mahiProcessor) {
        try {
          context.mahiProcessor.disconnect();
          context.mahiProcessor.onaudioprocess = null;
        } catch (e) {
          console.log('Processor cleanup err:', e);
        }
        context.mahiProcessor = null;
      }
      if (context.mahiSource) {
        try {
          context.mahiSource.disconnect();
        } catch (e) {
          console.log('Source cleanup err:', e);
        }
        context.mahiSource = null;
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    // Clear audio queue
    audioQueueRef.current = [];
    nextPlayTimeRef.current = 0;
  };

  const toggleMahi = () => {
    if (isActive) {
      stopMahi();
    } else {
      startMahi();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000] flex flex-col items-center justify-center overflow-hidden font-sans text-white">
      {/* Debug View Toggle */}
      <button 
        onClick={() => setShowDebug(!showDebug)} 
        className="fixed top-4 left-4 z-[100] opacity-20 hover:opacity-100 transition-opacity"
      >
        <Settings size={16} />
      </button>

      {/* Debug Info Overlay */}
      <AnimatePresence>
        {showDebug && (
          <motion.div 
            key="debug-overlay"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed top-12 left-4 z-[99] bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 w-64 text-[10px] space-y-2 pointer-events-none"
          >
            <div className="text-gray-400 uppercase tracking-widest font-bold border-b border-white/10 pb-1">Debug Info</div>
            <div><span className="text-indigo-400">Status:</span> {isActive ? 'Live' : 'Paused'}</div>
            <div><span className="text-indigo-400">Mic Level:</span> <div className="inline-block w-20 h-1 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${Math.min(100, micLevel * 500)}%` }}></div></div></div>
            <div><span className="text-indigo-400">Retry Count:</span> {retryCountRef.current}</div>
            <div><span className="text-indigo-400">User:</span> <span className="text-gray-300">{transcription.user || '...'}</span></div>
            <div><span className="text-indigo-400">Mahi:</span> <span className="text-gray-300">{transcription.mahi || '...'}</span></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] blur-[80px]"
          style={{ background: `radial-gradient(circle, ${theme.bgGlow} 0%, rgba(0,0,0,0) 70%)` }}
        />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `linear-gradient(${theme.primary}05 1px,transparent_1px),linear-gradient(90deg,${theme.primary}05 1px,transparent_1px)`, backgroundSize: '100px 100px' }} />
      </div>
      
      {/* Header HUD */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-[#0c051a]/95 backdrop-blur-md border-b border-purple-900/30 px-4 py-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <img 
              src={MAHI_LOGO_URL} 
              onError={(e) => { (e.target as HTMLImageElement).src = MAHI_LOGO_URL; }}
              alt="Mahi Logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/80 p-0.5 shadow-[0_0_18px_rgba(168,85,247,0.6)]"
            />
            <motion.span 
              animate={isActive ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : { opacity: 0.8 }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0c051a] ${isActive ? 'bg-green-400' : 'bg-purple-400'}`}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-wider text-white uppercase leading-none">
              HEY MAHI
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs font-semibold text-purple-300 tracking-wide">
                Your AI Companion
              </p>
              <a
                href="https://youtube.com/@mpsthakur07?si=9Usj--LVcM9tFQDM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-[10px] font-bold text-red-200 hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95 group"
                title="Visit official YouTube Channel @mpsthakur07"
              >
                <svg className="w-3.5 h-3.5 fill-red-500 group-hover:fill-red-400 transition-colors shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Developed by mps thakur 07</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Study Mode Header Button */}
          <motion.button
            onClick={() => setShowStudyHub(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isStudyMode
                ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-purple-500/20'
                : 'bg-white/5 border-white/10 text-purple-200/80 hover:bg-white/10 hover:text-white'
            }`}
            title="Study Suite & AI Tutor"
          >
            <GraduationCap size={15} className={isStudyMode ? 'text-emerald-400 animate-pulse' : 'text-purple-300'} />
            <span className="hidden sm:inline">{isStudyMode ? 'Study Mode ON 🎓' : 'Study Mode'}</span>
          </motion.button>


          {/* Theme Switcher */}
          <div className="hidden sm:flex gap-1.5 mr-2">
            {Object.entries(THEMES).map(([id, t]) => (
              <motion.button
                key={id}
                onClick={() => setCurrentTheme(id as any)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-5 h-5 rounded-full border transition-all ${currentTheme === id ? 'border-white scale-110 shadow-md' : 'border-transparent'}`}
                style={{ backgroundColor: t.primary }}
                title={t.name}
              />
            ))}
          </div>

          <motion.button
            onClick={() => navigate('/help')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer hover:bg-white/10"
            title="Help & Info"
          >
            <HelpCircle size={18} className="text-purple-200" />
          </motion.button>

          <motion.button
            onClick={() => setShowSettings(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer hover:bg-white/10"
            title="Settings"
          >
            <Settings size={18} className="text-purple-200" />
          </motion.button>
        </div>
      </div>

      {/* Global Error & Quota Alert Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-[92%] max-w-lg p-3.5 sm:p-4 rounded-2xl bg-[#1d0718]/95 border border-red-500/60 backdrop-blur-xl shadow-[0_0_30px_rgba(225,29,72,0.4)] flex flex-col sm:flex-row items-center justify-between gap-3 text-white pointer-events-auto"
          >
            <div className="flex items-start gap-3 w-full sm:w-auto">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5 border border-red-500/30">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <span className="font-extrabold text-red-200 block text-xs tracking-wide uppercase">
                  {error.includes('Quota') ? 'Gemini Quota Exceeded ⚠️' : 'Connection Alert'}
                </span>
                <p className="text-red-100/90 text-xs leading-relaxed mt-0.5">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-red-900/40">
              {(error.includes('Quota') || error.includes('Key') || error.includes('Settings')) && (
                <button
                  onClick={() => {
                    setError(null);
                    setShowSettings(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-[11px] transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <Settings size={13} />
                  <span>Open Settings</span>
                </button>
              )}
              {!error.includes('Quota') && (
                <button
                  onClick={() => {
                    setError(null);
                    startMahi();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all cursor-pointer active:scale-95"
                >
                  Retry Call
                </button>
              )}
              <button
                onClick={() => setError(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-red-300 hover:text-white transition-all cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Visual Container */}
      <div className="absolute inset-0 flex justify-center items-center z-10 pointer-events-none">
          {/* Character Container - Static for higher quality focus */}
          <motion.div 
            className="relative h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: expression === 'heartbroken' ? 0.85 : 1,
              x: expression === 'heartbroken' ? [0, -4, 4, -4, 4, 0] : 0,
              y: expression === 'heartbroken' ? [0, 3, 0, 3, 0] : 0,
              filter: expression === 'heartbroken' ? 'brightness(0.7) contrast(1.1)' : 'brightness(1) contrast(1)'
            }}
            transition={{
              x: { duration: 0.3, repeat: expression === 'heartbroken' ? Infinity : 0 },
              y: { duration: 0.2, repeat: expression === 'heartbroken' ? Infinity : 0 },
              opacity: { duration: 0.5 },
              filter: { duration: 0.5 }
            }}
          >
            {/* Soft Ambient Glow */}
            <div className="absolute inset-x-0 top-1/4 bottom-1/4 blur-[120px] rounded-full z-0" style={{ backgroundColor: theme.bgGlow }} />

            {/* Base Image (Mahi Visual) */}
            <motion.img 
              key={currentVisual}
              src={currentVisual || DEFAULT_VISUAL} 
              onError={() => setCurrentVisual(DEFAULT_VISUAL)}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ 
                opacity: 1,
                scale: 1
              }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut"
              }}
              alt="Mahi Visual" 
              className="h-full w-auto object-contain relative z-10"
              style={{ filter: `drop-shadow(0 0 15px ${theme.glow})` }}
              referrerPolicy="no-referrer"
            />

            {/* Mouth Open Overlay (Responsive to audio) */}
            <motion.img 
              src={ANIME_GIRL_MOUTH_OPEN}
              alt="Mahi Talking"
              animate={{ 
                opacity: (isSpeaking && isLipSyncEnabled) ? Math.min(1, outputLevel * 8) : 0,
              }}
              className="absolute inset-0 h-full w-auto object-contain z-20 pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* Eyes Closed/Blink Overlay - Also used for Sad/Sobbing effect */}
            <motion.img 
              src={ANIME_GIRL_EYES_CLOSED}
              alt="Mahi Blink"
              animate={{ 
                opacity: (isBlinking || expression === 'sad' || expression === 'heartbroken') ? 1 : 0
              }}
              transition={{ duration: (expression === 'sad' || expression === 'heartbroken') ? 0.4 : 0.05 }}
              className="absolute inset-0 h-full w-auto object-contain z-30 pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* Expression Overlays (Subtle Glows) */}
            <AnimatePresence>
              {expression === 'thinking' && (
                <Fragment key="exp-thinking">
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 0.3 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-indigo-500/20 blur-[80px] rounded-full z-0 p-4"
                  >
                    <motion.div 
                      key="thinking-spin"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full border-2 border-dashed border-indigo-400/30 rounded-full"
                    />
                  </motion.div>
                  <motion.div 
                    key="thinking-aura"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: [0.05, 0.15, 0.05] }} 
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-white/10 blur-[120px] z-5" 
                  />
                </Fragment>
              )}
              {expression === 'happy' && (
                <Fragment key="exp-happy">
                  <motion.div key="happy-blush-l" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }} className="absolute top-[52%] left-[30%] w-[12%] h-[6%] bg-red-400/20 blur-[20px] rounded-full z-40" />
                  <motion.div key="happy-blush-r" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }} className="absolute top-[52%] left-[58%] w-[12%] h-[6%] bg-red-400/20 blur-[20px] rounded-full z-40" />
                </Fragment>
              )}
              {(expression === 'sad' || expression === 'heartbroken') && (
                <Fragment key="exp-sad-hb">
                  <motion.div 
                    key="sad-bg"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: [0.2, expression === 'heartbroken' ? 0.8 : 0.4, 0.2] }} 
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className={`absolute inset-0 ${expression === 'heartbroken' ? 'bg-indigo-950/60' : 'bg-blue-500/20'} blur-[120px] z-5`} 
                  />
                  {expression === 'heartbroken' && (
                    <div key="hb-vignette" className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-radial-gradient from-transparent via-indigo-900/10 to-indigo-950/40" />
                    </div>
                  )}
                </Fragment>
              )}
              {expression === 'excited' && (
                <motion.div 
                  key="exp-excited"
                  initial={{ opacity: 0 }} 
                  animate={{ scale: [1, 1.1, 1], opacity: 0.15 }} 
                  className="absolute inset-0 bg-yellow-400/10 blur-[80px] z-5" 
                />
              )}
              {expression === 'embarrassed' && (
                <Fragment key="exp-embarrassed">
                  <motion.div key="emb-blush-l" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="absolute top-[52%] left-[32%] w-[10%] h-[5%] bg-red-600/30 blur-[25px] rounded-full z-40" />
                  <motion.div key="emb-blush-r" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="absolute top-[52%] left-[58%] w-[10%] h-[5%] bg-red-600/30 blur-[25px] rounded-full z-40" />
                </Fragment>
              )}
              {expression === 'surprised' && (
                <motion.div 
                  key="exp-surprised"
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 0.1, scale: 1.5 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/20 blur-[100px] z-5" 
                />
              )}
              {expression === 'confused' && (
                <motion.div 
                  key="exp-confused"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: [0.1, 0.2, 0.1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-500/10 blur-[100px] z-5" 
                />
              )}
            </AnimatePresence>
          </motion.div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-[#070210]/95 backdrop-blur-2xl border-t border-purple-900/30 p-4 pb-6 flex flex-col items-center gap-3 pointer-events-auto">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Secondary Tools Bar */}
        <div className="flex items-center justify-start sm:justify-center gap-2.5 w-full max-w-md px-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
          {/* Upload */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-purple-200 font-medium transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Upload Image"
          >
            <ImageIcon size={13} />
            <span>Upload</span>
          </button>

          {/* Feedback */}
          <a
            href="https://www.instagram.com/heymahiai?igsh=cXpzcDNxMXYzY2Zt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-orange-500/30 border border-pink-500/40 text-[11px] text-pink-200 hover:text-white font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            title="Report Bugs or Give Feedback on Instagram @heymahiai"
          >
            <Instagram size={13} className="text-pink-400 shrink-0" />
            <span>Feedback</span>
          </a>

          {/* Study Mode */}
          <button 
            onClick={() => setShowStudyHub(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isStudyMode
                ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-purple-200'
            }`}
            title="Study Suite & AI Tutor"
          >
            <GraduationCap size={13} className={isStudyMode ? 'text-emerald-400 animate-pulse' : 'text-purple-300'} />
            <span>{isStudyMode ? 'Study Mode ON 🎓' : 'Study Mode'}</span>
          </button>
        </div>

        {/* Main Action Button: Call */}
        <div className="flex items-center justify-center w-full max-w-md">
          <motion.button
            onClick={toggleMahi}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={`w-full py-3.5 px-6 rounded-full text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-rose-700 shadow-red-600/40 animate-pulse' 
                : 'bg-gradient-to-r from-[#9e1b78] via-[#bd2092] to-[#c9247d] shadow-pink-600/30 hover:brightness-110'
            }`}
          >
            <Phone size={20} className="text-white fill-white/20" />
            <span>{isActive ? 'End Call' : 'Call'}</span>
          </motion.button>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex items-center justify-center flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-white/50 pt-0.5">
          <button onClick={() => navigate('/features')} className="hover:text-purple-300 transition-colors cursor-pointer">Features</button>
          <span className="text-white/20">•</span>
          <button onClick={() => navigate('/how-to-use')} className="hover:text-purple-300 transition-colors cursor-pointer">How to Use</button>
          <span className="text-white/20">•</span>
          <button onClick={() => navigate('/about')} className="hover:text-purple-300 transition-colors cursor-pointer">About</button>
          <span className="text-white/20">•</span>
          <button onClick={() => navigate('/ai-companion-guide')} className="hover:text-purple-300 transition-colors cursor-pointer">Guide</button>
          <span className="text-white/20">•</span>
          <button onClick={() => navigate('/faq')} className="hover:text-purple-300 transition-colors cursor-pointer">FAQ</button>
          <span className="text-white/20">•</span>
          <button onClick={() => navigate('/privacy-policy')} className="hover:text-purple-300 transition-colors cursor-pointer">Privacy</button>
          <span className="text-white/20">•</span>
          <button onClick={() => navigate('/terms')} className="hover:text-purple-300 transition-colors cursor-pointer">Terms</button>
          <span className="text-white/20">•</span>
          <button onClick={() => navigate('/contact')} className="hover:text-purple-300 transition-colors cursor-pointer">Contact</button>
        </div>
      </div>

      {/* Interactive Chat Drawer Modal */}
      <AnimatePresence>
        {showChatDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="w-full max-w-lg bg-[#0e071e] border-t sm:border border-purple-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[680px] overflow-hidden"
            >
              {/* Chat Drawer Header */}
              <div className="p-4 bg-[#140b2b] border-b border-purple-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={MAHI_LOGO_URL} 
                    onError={(e) => { (e.target as HTMLImageElement).src = MAHI_LOGO_URL; }}
                    alt="Mahi Avatar" 
                    className="w-10 h-10 rounded-full border border-purple-400/50 p-0.5 object-cover" 
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">Chat with Mahi</h3>
                    <p className="text-xs text-purple-300">Your AI Companion • Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatDrawer(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[80%] ${
                      msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Captured visual"
                        className="rounded-xl max-h-48 object-cover mb-1.5 border border-purple-400/40 shadow-md"
                      />
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md'
                          : 'bg-[#1e103d] border border-purple-500/20 text-purple-100 rounded-bl-none shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-white/40 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
                {isSendingChat && (
                  <div className="self-start flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1e103d] text-purple-300 text-xs animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                    <span>Mahi is analyzing and typing...</span>
                  </div>
                )}
              </div>

              {/* Attached Snapshot Preview Chip */}
              {chatAttachedImage && (
                <div className="px-3 pt-2 pb-1 bg-[#140b2b] flex items-center justify-between border-t border-purple-900/30">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={`data:${chatAttachedImage.mimeType};base64,${chatAttachedImage.data}`}
                        alt="Attached snapshot"
                        className="w-12 h-12 rounded-lg object-cover border border-purple-400/60 shadow"
                      />
                    </div>
                    <div className="flex flex-col text-xs text-purple-200">
                      <span className="font-semibold text-white">Snapshot Attached</span>
                      <span className="text-[11px] text-white/60">Ready to send to Mahi</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatAttachedImage(null)}
                    className="p-1 rounded-full bg-white/10 hover:bg-red-500/80 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Remove attached snapshot"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 bg-[#140b2b] border-t border-purple-900/30 flex items-center gap-2">
                {/* Upload Image quick trigger in Chat */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Upload image / photo"
                >
                  <ImageIcon size={18} />
                </button>

                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendTextMessage();
                  }}
                  placeholder={chatAttachedImage ? "Ask Mahi about this snapshot..." : "Type a message to Mahi..."}
                  className="flex-1 bg-white/5 border border-purple-500/30 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-all"
                />
                <button
                  onClick={() => handleSendTextMessage()}
                  disabled={(!chatInputText.trim() && !chatAttachedImage) || isSendingChat}
                  className="p-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 disabled:opacity-40 text-white transition-all cursor-pointer shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Status/Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div 
            key="status-error-overlay"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[100] w-[92%] max-w-md pointer-events-auto"
          >
            <div className="bg-[#180928]/95 border border-red-500/40 backdrop-blur-2xl p-4 rounded-2xl flex flex-col items-center gap-3 shadow-2xl overflow-hidden relative text-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30 overflow-hidden">
                <motion.div 
                  className="h-full bg-red-500"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>Notification</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-white/90 text-xs font-medium text-center leading-relaxed">
                {error}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 w-full pt-1">
                <button 
                  onClick={() => {
                    window.open(window.location.href, '_blank');
                  }}
                  className="flex-1 min-w-[110px] bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-400/50 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wider transition-all active:scale-95 text-indigo-100 hover:text-white flex items-center justify-center gap-1.5 shadow-md"
                  title="Open in new browser window for direct microphone access"
                >
                  <ExternalLink size={13} />
                  <span>Open in New Tab</span>
                </button>

                <button 
                  onClick={() => {
                    setError(null);
                    setShowChatDrawer(true);
                  }}
                  className="flex-1 min-w-[100px] bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wider transition-all active:scale-95 text-purple-200 hover:text-white flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={13} />
                  <span>Text Chat</span>
                </button>

                <button 
                  onClick={() => { 
                    setError(null);
                    stopMahi(); 
                    setTimeout(startMahi, 300); 
                  }}
                  className="flex-1 min-w-[90px] bg-white/10 hover:bg-white/20 border border-white/10 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wider transition-all active:scale-95 text-white flex items-center justify-center gap-1.5"
                >
                  <Phone size={13} />
                  <span>Try Call</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <React.Suspense fallback={null}>
            <SettingsModal
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
              currentName={userName}
              currentApiKey={geminiApiKey}
              onSaveName={(newName) => {
                localStorage.setItem('userName', newName);
                setUserName(newName);
              }}
              onSaveApiKey={(newKey) => {
                const cleanedKey = newKey.trim();
                localStorage.setItem('geminiApiKey', cleanedKey);
                setGeminiApiKey(cleanedKey);
                setError(null);
                retryCountRef.current = 0;
                stopMahi();
                trackEvent('api_key_saved');
              }}
              onDeleteApiKey={() => {
                localStorage.removeItem('geminiApiKey');
                setGeminiApiKey('');
                setError(null);
                stopMahi();
              }}
              onResetOnboarding={() => {
                stopMahi();
                setShowSettings(false);
              }}
              onClearMemory={() => {
                clearAllMemory();
                setTranscription({ user: '', mahi: '' });
                currentUserTurnRef.current = '';
                currentModelTurnRef.current = '';
                setChatMessages([{ sender: 'mahi', text: `Hey ${userName || 'Dost'}! Main Mahi hu, aapki AI companion. Kese ho aap?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
              }}
              onClearAllData={() => {
                stopMahi();
                clearAllMemory();
                setTranscription({ user: '', mahi: '' });
                currentUserTurnRef.current = '';
                currentModelTurnRef.current = '';
                localStorage.clear();
                setUserName('Dost');
                setGeminiApiKey('');
                setShowSettings(false);
                setChatMessages([{ sender: 'mahi', text: 'Hey Dost! Main Mahi hu, aapki AI companion. Kese ho aap?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
              }}
              theme={theme}
            />
          </React.Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStudyHub && (
          <React.Suspense fallback={null}>
            <StudyHub
              isOpen={showStudyHub}
              onClose={() => setShowStudyHub(false)}
              isStudyModeActive={isStudyMode}
              onToggleStudyMode={handleToggleStudyMode}
              selectedSubject={selectedStudySubject}
              onSelectSubject={handleSelectStudySubject}
              onSendPromptToMahi={(promptText) => {
                handleSendTextMessage(promptText);
                if (!showChatDrawer) setShowChatDrawer(true);
              }}
              theme={theme}
            />
          </React.Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <React.Suspense fallback={
          <div className="fixed inset-0 z-50 bg-[#06000d]/90 backdrop-blur-md flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        }>
          <Routes location={location}>
            <Route path="/" element={null} />
            <Route path="/features" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/how-to-use" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/about" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/privacy-policy" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/privacy" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/terms" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/contact" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/help" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/tutorials" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/faq" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/cookies" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/disclaimer" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/release-notes" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="/ai-companion-guide" element={<InfoCenter onClose={() => navigate('/')} theme={theme} userName={userName} />} />
            <Route path="*" element={<NotFoundPage theme={theme} />} />
          </Routes>
        </React.Suspense>
      </AnimatePresence>
    </div>
  );
}
