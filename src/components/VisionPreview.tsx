/**
 * VisionPreview Component
 * Displays live Camera feed or Screen Share stream with real-time capture,
 * floating/draggable capabilities, Picture-in-Picture support, camera flip (front/back),
 * and scanning actions.
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { 
  Camera, 
  ScreenShare, 
  X, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Scan, 
  Phone, 
  MessageSquare, 
  CheckCircle2,
  Sparkles,
  PictureInPicture2,
  GripHorizontal,
  Move
} from 'lucide-react';

export interface VisionSnapshot {
  data: string;
  mimeType: string;
}

export function captureVideoFrame(
  videoElement: HTMLVideoElement,
  maxWidth = 1024,
  quality = 0.82
): VisionSnapshot | null {
  if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
    return null;
  }
  try {
    const canvas = document.createElement('canvas');
    let width = videoElement.videoWidth;
    let height = videoElement.videoHeight;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.split(',')[1];
    return { data: base64, mimeType: 'image/jpeg' };
  } catch (err) {
    console.error('Frame capture error:', err);
    return null;
  }
}

interface VisionPreviewProps {
  mode: 'camera' | 'screen';
  stream: MediaStream | null;
  isCallActive: boolean;
  facingMode?: 'user' | 'environment';
  onToggleFacingMode?: () => void;
  onClose: () => void;
  onScanSnapshot: (snapshot: VisionSnapshot) => void;
  onStartCall: () => void;
  onAskInChat: (snapshot: VisionSnapshot) => void;
}

export const VisionPreview: React.FC<VisionPreviewProps> = ({
  mode,
  stream,
  isCallActive,
  facingMode = 'user',
  onToggleFacingMode,
  onClose,
  onScanSnapshot,
  onStartCall,
  onAskInChat,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragControls = useDragControls();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [scannedNotification, setScannedNotification] = useState<string | null>(null);
  const [canPiP, setCanPiP] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled) {
      setCanPiP(true);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnterPiP = () => setIsPiPActive(true);
    const onLeavePiP = () => setIsPiPActive(false);
    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.warn('Video play warning:', err);
      });
    }
  }, [stream]);

  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement === videoRef.current) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (err) {
      console.warn('Picture-in-picture warning:', err);
    }
  };

  const handleScan = () => {
    if (!videoRef.current) return;
    const snapshot = captureVideoFrame(videoRef.current, 1280, 0.85);
    if (!snapshot) return;

    // Trigger visual shutter flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 220);

    onScanSnapshot(snapshot);

    setScannedNotification(isCallActive ? "Snapshot sent live!" : "Snapshot captured!");
    setTimeout(() => setScannedNotification(null), 2500);
  };

  const handleAskInChat = () => {
    if (!videoRef.current) return;
    const snapshot = captureVideoFrame(videoRef.current, 1280, 0.85);
    if (!snapshot) return;

    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 220);

    onAskInChat(snapshot);
  };

  return (
    <motion.div
      id="vision-preview-container"
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.05}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed z-50 pointer-events-auto select-none touch-none ${
        isMinimized 
          ? 'bottom-24 right-4 sm:right-6 w-56' 
          : 'top-16 sm:top-20 right-2 sm:right-6 w-[94vw] max-w-[340px] sm:max-w-[380px]'
      }`}
    >
      <div className="relative rounded-2xl overflow-hidden bg-[#0c0418]/95 border border-purple-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col">
        {/* Shutter Flash Overlay */}
        <AnimatePresence>
          {isShutterFlashing && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Top Header Bar with Draggable Grip */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="flex items-center justify-between px-3 py-2 bg-[#170a2c]/95 border-b border-purple-900/40 cursor-grab active:cursor-grabbing hover:bg-[#1f0e3a] transition-colors"
          title="Drag anywhere to float"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center text-purple-400 hover:text-white transition-colors" title="Hold & drag to move window">
              <GripHorizontal size={14} className="opacity-80" />
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              {mode === 'camera' ? (
                <>
                  <Camera size={13} className="text-pink-400" />
                  <span>{facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}</span>
                </>
              ) : (
                <>
                  <ScreenShare size={13} className="text-cyan-400" />
                  <span>Screen Share</span>
                </>
              )}
            </div>
            {isCallActive && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                LIVE
              </span>
            )}
          </div>

          <div 
            className="flex items-center gap-1"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Camera facing mode flip button */}
            {mode === 'camera' && onToggleFacingMode && (
              <button
                onClick={onToggleFacingMode}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Flip Camera (Front/Back)"
              >
                <RefreshCw size={13} />
              </button>
            )}

            {/* Picture-in-Picture / OS Floating window button */}
            {canPiP && (
              <button
                onClick={handleTogglePiP}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isPiPActive 
                    ? 'bg-purple-600 text-white' 
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
                title="Picture-in-Picture / Floating Window"
              >
                <PictureInPicture2 size={13} />
              </button>
            )}

            {/* Minimize / Expand Toggle */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={isMinimized ? "Expand Camera" : "Floating Mini View"}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/80 hover:text-red-300 transition-colors cursor-pointer"
              title="Stop and Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Video Stage */}
        <div className="relative bg-black aspect-[4/3] sm:aspect-[16/10] overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${mode === 'camera' && facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />

          {/* Scanner Overlay Line (animated) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            <motion.div
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]"
            />
          </div>

          {/* Scanned / Sent Toast Notification */}
          <AnimatePresence>
            {scannedNotification && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-purple-900/90 border border-purple-400/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl whitespace-nowrap"
              >
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-[11px] font-bold text-white">{scannedNotification}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint Overlay when not minimized */}
          {!isMinimized && (
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] text-white/90 flex items-center gap-1">
                <Move size={10} className="text-purple-300" />
                <span>Floating • Drag header to move</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] text-white/90">
                {mode === 'camera' ? 'Live Camera Feed' : 'Screen Share'}
              </span>
            </div>
          )}

          {/* Floating mini overlay controls when minimized */}
          {isMinimized && (
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-end justify-between p-2 pointer-events-auto"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleScan}
                className="p-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs flex items-center gap-1 shadow-md cursor-pointer"
                title="Capture snapshot"
              >
                <Scan size={12} />
                <span className="text-[10px] font-semibold">Capture</span>
              </button>
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs cursor-pointer"
                title="Expand"
              >
                <Maximize2 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls Bar (Expanded Mode) */}
        {!isMinimized && (
          <div 
            className="p-3 bg-[#110620] border-t border-purple-900/40 flex flex-col gap-2"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleScan}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/30 transition-all active:scale-95 cursor-pointer"
                title="Capture snapshot"
              >
                <Scan size={14} className="text-white" />
                <span>Capture & Scan</span>
              </button>

              <button
                onClick={handleAskInChat}
                className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Send current frame to Chat Drawer"
              >
                <MessageSquare size={13} />
                <span className="hidden sm:inline">Ask in Chat</span>
              </button>
            </div>

            {/* Quick helper when call is NOT active */}
            {!isCallActive && (
              <div className="flex items-center justify-between px-1 pt-1 text-[11px] text-white/70">
                <span>Want to talk live while showing?</span>
                <button
                  onClick={onStartCall}
                  className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-bold transition-colors cursor-pointer"
                >
                  <Phone size={11} />
                  <span>Start Voice Call</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
