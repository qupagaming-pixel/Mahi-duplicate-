import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, Eye, EyeOff, Play, Pause, Volume2, VolumeX, Maximize, 
  Settings, MoreVertical, ExternalLink, Sparkles, Lock, X, 
  Video, Clipboard, Check, AlertCircle, Info, User 
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

// Video configuration - modify these constants to change the tutorial video source or poster
const TUTORIAL_VIDEO_URL = "https://youtube.com/shorts/vOtGNDhPNC0?si=wzqaazklivRhdbnG";
const TUTORIAL_POSTER_URL = "/gemini-api-tutorial-thumbnail-sm.webp";

interface OnboardingProps {
  onComplete: (name: string, apiKey: string) => void;
  theme: {
    primary: string;
    secondary: string;
    accent?: string;
    glow: string;
    bgGlow: string;
    border: string;
    button: string;
  };
}

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function TutorialVideoPlayer({ videoUrl, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");
  const [durationStr, setDurationStr] = useState("1:28");

  const ytId = getYouTubeId(videoUrl);

  const startVideo = () => {
    setHasStarted(true);
    setIsPlaying(true);
    if (!ytId && videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Play failed:", err);
      });
    }
  };

  const togglePlay = () => {
    if (!hasStarted) {
      startVideo();
      return;
    }
    if (ytId) return;
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    if (ytId) return;
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        const curMins = Math.floor(video.currentTime / 60);
        const curSecs = Math.floor(video.currentTime % 60);
        setCurrentTimeStr(`${curMins}:${curSecs < 10 ? '0' : ''}${curSecs}`);

        const durMins = Math.floor(video.duration / 60);
        const durSecs = Math.floor(video.duration % 60);
        setDurationStr(`${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [ytId]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const val = parseFloat(e.target.value);
    const newTime = (val / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(val);
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#090312] border border-purple-500/30 overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.15)] group">
      <div 
        className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={togglePlay}
      >
        {/* Media Player: Only loaded after user interaction */}
        {hasStarted ? (
          ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Gemini API Tutorial"
              className="w-full h-full border-0 z-10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              preload="auto"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          )
        ) : (
          /* Thumbnail Overlay Image until user plays the video */
          <div className="absolute inset-0 z-20 bg-black flex items-center justify-center overflow-hidden">
            <img 
              src="/gemini-api-tutorial-thumbnail-sm.webp" 
              alt="Gemini API Tutorial Thumbnail" 
              width={400}
              height={225}
              fetchPriority="high"
              decoding="sync"
              loading="eager"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.failedOnce) {
                  img.dataset.failedOnce = "true";
                  img.src = "/gemini-api-tutorial-thumbnail.webp";
                }
              }}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-purple-950/80 border-2 border-purple-400 text-white flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.8)] backdrop-blur-md transition-transform hover:scale-110 active:scale-95 z-30 pointer-events-none">
              <Play size={28} className="ml-1 text-purple-200" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Center Play Button Overlay if video started but paused (non-YouTube) */}
        {!ytId && hasStarted && !isPlaying && (
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/70 border border-purple-500/40 text-white flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.6)] backdrop-blur-md transition-transform hover:scale-110 cursor-pointer z-20"
            title="Play Tutorial"
          >
            <Play size={24} className="ml-1 text-purple-300" fill="currentColor" />
          </button>
        )}

        {/* Bottom Control Bar for HTML5 video */}
        {!ytId && (
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-1.5 transition-opacity duration-300 z-10">
            {/* Progress Bar */}
            <div className="relative w-full flex items-center h-2 group/progress">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                aria-label="Seek video progress"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-fuchsia-400 rounded-full" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <div 
                className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(168,85,247,0.9)] -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white/90 pt-0.5">
              <div className="flex items-center gap-3">
                <button 
                  onClick={togglePlay} 
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                </button>

                <button 
                  onClick={toggleMute} 
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>

                <span className="text-[11px] font-mono text-neutral-300 tracking-wider">
                  {currentTimeStr} / {durationStr}
                </span>
              </div>

              <div className="flex items-center gap-2 text-neutral-400">
                <Settings size={13} className="hover:text-white cursor-pointer transition-colors" />
                <Maximize 
                  size={13} 
                  className="hover:text-white cursor-pointer transition-colors" 
                  onClick={() => {
                    if (videoRef.current?.requestFullscreen) {
                      videoRef.current.requestFullscreen();
                    }
                  }} 
                />
                <MoreVertical size={13} className="hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Onboarding({ onComplete, theme }: OnboardingProps) {
  useEffect(() => {
    trackEvent('onboarding_started');
  }, []);

  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPasted, setIsPasted] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setApiKey(text.trim());
        setValidationError(null);
        setIsPasted(true);
        setTimeout(() => setIsPasted(false), 2000);
      }
    } catch (err) {
      console.warn("Clipboard access prevented or not available");
    }
  };

  const handleStartMahi = async () => {
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '').trim();
    if (!cleanKey) {
      setValidationError("Please paste your API key first.");
      return;
    }

    if (cleanKey.length < 10) {
      setValidationError("Please enter a valid API key.");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Ping API models endpoint silently
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`, {
        method: 'GET'
      }).catch(() => null);

      if (res && !res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = (data?.error?.message || '').toLowerCase();
        
        // Only block if Google explicitly states the key itself is invalid
        if (errMsg.includes('api key not valid') || errMsg.includes('api_key_invalid')) {
          setValidationError("Invalid API key. Please check your key and try again.");
          return;
        }
      }

      // Complete onboarding and start Mahi
      onComplete(name.trim() || 'Dost', cleanKey);
    } catch (err) {
      // Fallback: accept key and proceed
      onComplete(name.trim() || 'Dost', cleanKey);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#05010d] text-white flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto">
      {/* Top Close Button (for revisiting setup) */}
      <button 
        onClick={() => onComplete(name.trim() || 'Dost', apiKey || '')}
        className="fixed top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all z-[110] cursor-pointer border border-white/20"
        title="Close"
        aria-label="Close setup and return"
      >
        <X size={18} />
      </button>

      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] blur-[150px] opacity-25 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, rgba(139, 92, 246, 0.2) 40%, rgba(0,0,0,0) 70%)' }}
        />
      </div>

      <div
        className="w-full max-w-[480px] bg-[#0d071a]/90 border border-purple-500/25 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center shadow-[0_0_50px_rgba(168,85,247,0.18)] relative z-10 my-auto"
      >
        {/* 1. Mahi Branding / Welcome */}
        <div className="text-center mb-5 flex flex-col items-center">
          <img 
            src="/mahi-avatar-sm.webp" 
            onError={(e) => { (e.target as HTMLImageElement).src = '/mahi-avatar.webp'; }}
            alt="Mahi AI Logo" 
            width={80}
            height={80}
            fetchPriority="high"
            decoding="sync"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-purple-400 p-1 shadow-[0_0_25px_rgba(168,85,247,0.7)] mb-3"
          />
          <div className="inline-flex items-center justify-center gap-2 mb-0.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to <span className="text-purple-400">Mahi</span>
            </h1>
            <span className="text-xl">💜</span>
          </div>
          <p className="text-xs sm:text-sm text-purple-200 font-medium flex items-center justify-center gap-1">
            Your #1 AI Companion &amp; Voice Assistant
            <Sparkles size={14} className="text-purple-400 animate-pulse" />
          </p>
        </div>

        {/* 2. Tutorial Video Header & Player */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-purple-300">
              <Video size={13} className="text-purple-400" />
              <span className="text-[10px] font-mono font-bold tracking-[1.5px] uppercase">
                TUTORIAL VIDEO
              </span>
            </div>
            <span className="text-[11px] text-purple-200 font-medium">
              Watch & learn how to get API key
            </span>
          </div>

          <TutorialVideoPlayer videoUrl={TUTORIAL_VIDEO_URL} posterUrl={TUTORIAL_POSTER_URL} />
        </div>

        {/* 3. Key Badge & Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.25)] mb-3">
            <Key size={22} className="text-purple-400" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
            Connect Your <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">Gemini API Key</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xs">
            Paste your API key below to start using Mahi.
          </p>
        </div>

        {/* 4. API Key Input & Primary Action */}
        <div className="w-full space-y-3.5 mb-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-purple-400/80">
              <Key size={18} />
            </div>
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setValidationError(null);
              }}
              aria-label="Paste your Gemini API key"
              placeholder="Paste your API key here..."
              className="w-full pl-11 pr-24 py-3.5 sm:py-4 bg-[#130b22]/90 border border-purple-500/30 focus:border-purple-400/80 rounded-2xl text-xs sm:text-sm font-mono text-white placeholder-purple-300/50 focus:outline-none transition-all shadow-inner group-hover:border-purple-500/50"
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                aria-label="Paste from clipboard"
                className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/40 rounded-lg text-[10px] font-bold text-purple-100 transition-colors flex items-center gap-1 cursor-pointer"
                title="Paste from clipboard"
              >
                {isPasted ? <Check size={12} className="text-green-400" /> : <Clipboard size={12} />}
                <span>{isPasted ? "Pasted" : "Paste"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide key" : "Show key"}
                className="p-1.5 text-purple-200 hover:text-white transition-colors cursor-pointer"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div
              className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl flex items-start gap-2 text-xs text-red-200 text-left transition-all"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400 animate-pulse" />
              <div className="flex-1">
                <p>{validationError}</p>
              </div>
            </div>
          )}

          {/* START MAHI Primary Button */}
          <button
            type="button"
            onClick={handleStartMahi}
            disabled={isValidating}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold uppercase tracking-[2px] text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 text-white active:scale-95 hover:scale-[1.01] ${
              isValidating 
                ? 'bg-purple-900/60 border border-purple-500/30 text-purple-300 cursor-wait' 
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 border border-purple-400/30 shadow-[0_0_25px_rgba(168,85,247,0.35)]'
            }`}
          >
            {isValidating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Mahi...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-purple-200" />
                <span>START MAHI</span>
              </>
            )}
          </button>

          {/* Security / Info Text */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-200 text-center pt-0.5">
            <Info size={13} className="text-purple-400 shrink-0" />
            <span>Your API key is safe and never stored on our servers.</span>
          </div>
        </div>

        {/* 5. Divider & Get API Key Section */}
        <div className="w-full space-y-3.5 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/15"></div>
            </div>
            <span className="relative px-3 bg-[#0d071a] text-[11px] font-mono text-purple-200 uppercase tracking-wider">
              or
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs text-neutral-200">
            <span className="text-neutral-200">Don't have an API key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get Gemini API Key from Google AI Studio"
              className="font-bold text-purple-200 hover:text-white transition-colors flex items-center gap-1 underline underline-offset-4 decoration-purple-500/60 hover:decoration-purple-200 cursor-pointer"
            >
              <span>GET API KEY</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <p className="text-[11px] text-purple-200/90 text-center">
            Create a free Gemini API key from Google AI Studio.
          </p>
        </div>
      </div>
    </div>
  );
}
