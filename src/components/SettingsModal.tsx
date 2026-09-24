import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Key, Trash2, RefreshCw, AlertTriangle, Eye, EyeOff, CheckCircle2, ShieldCheck, Lock, Instagram, MessageSquare } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentApiKey: string;
  onSaveName: (newName: string) => void;
  onSaveApiKey: (newKey: string) => void;
  onDeleteApiKey: () => void;
  onResetOnboarding: () => void;
  onClearAllData: () => void;
  onClearMemory?: () => void;
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

export function SettingsModal({
  isOpen,
  onClose,
  currentName,
  currentApiKey,
  onSaveName,
  onSaveApiKey,
  onDeleteApiKey,
  onResetOnboarding,
  onClearAllData,
  onClearMemory,
  theme,
}: SettingsModalProps) {
  const [name, setName] = useState(currentName);
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [showKey, setShowKey] = useState(false);
  const [nameSaveStatus, setNameSaveStatus] = useState<string | null>(null);
  const [keyValidationStatus, setKeyValidationStatus] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [memoryStatus, setMemoryStatus] = useState<string | null>(null);

  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<'deleteKey' | 'resetOnboarding' | 'clearAll' | 'clearMemory' | null>(null);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!name.trim()) return;
    onSaveName(name.trim());
    setNameSaveStatus("Name updated successfully! 👋");
    setTimeout(() => setNameSaveStatus(null), 3000);
  };

  const handleValidateAndSaveKey = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setKeyValidationStatus("⚠️ API Key empty nahi ho sakti.");
      return;
    }

    setIsValidating(true);
    setKeyValidationStatus(null);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${trimmedKey}`, {
        method: 'GET'
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || '';
        if (res.status === 400 || res.status === 403 || errMsg.toLowerCase().includes('key')) {
          setKeyValidationStatus("❌ Yeh API Key invalid hai. Kripya correct Google AI Studio Key enter karein.");
          setIsValidating(false);
          return;
        } else if (res.status === 429 || errMsg.toLowerCase().includes('quota')) {
          setKeyValidationStatus("⚠️ Is API Key ki quota limit exceed ho chuki hai. Doosri active key try karein.");
          setIsValidating(false);
          return;
        }
      }

      onSaveApiKey(trimmedKey);
      setKeyValidationStatus("✅ API Key verified and saved successfully! 🎉");
      setTimeout(() => setKeyValidationStatus(null), 3500);
    } catch (err: any) {
      onSaveApiKey(trimmedKey);
      setKeyValidationStatus("✅ API Key saved! 🎉");
      setTimeout(() => setKeyValidationStatus(null), 3000);
    } finally {
      setIsValidating(false);
    }
  };

  const executeConfirmedAction = () => {
    if (confirmAction === 'deleteKey') {
      onDeleteApiKey();
      setApiKey('');
      setKeyValidationStatus("API Key deleted.");
      setTimeout(() => setKeyValidationStatus(null), 3000);
    } else if (confirmAction === 'resetOnboarding') {
      onResetOnboarding();
    } else if (confirmAction === 'clearMemory') {
      if (onClearMemory) onClearMemory();
      setMemoryStatus("Conversation memory cleared! 🧹");
      setTimeout(() => setMemoryStatus(null), 3500);
    } else if (confirmAction === 'clearAll') {
      if (onClearMemory) onClearMemory();
      onClearAllData();
    }
    setConfirmAction(null);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      {/* Dark blur backdrop */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      {/* Main Settings Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
              <img 
                src="/mahi-avatar.webp" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo512.png'; }}
                alt="Mahi AI" 
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
                className="w-8 h-8 rounded-full object-cover border border-purple-500/40 shadow-sm"
                style={{ boxShadow: `0 0 10px ${theme.glow}` }} 
              />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-widest text-white">Mahi Settings</h2>
              <p className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase">Configure Profile & Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-full transition-all cursor-pointer text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Change Name Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <User size={12} style={{ color: theme.primary }} />
              <span>Your Name</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameSaveStatus(null);
                }}
                maxLength={30}
                className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-xl text-xs font-medium focus:outline-none transition-colors"
                placeholder="Enter your name"
              />
              <button
                onClick={handleSaveName}
                disabled={!name.trim() || name.trim() === currentName}
                className={`px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  !name.trim() || name.trim() === currentName
                    ? 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5'
                    : 'text-black font-black hover:opacity-90'
                }`}
                style={!(!name.trim() || name.trim() === currentName) ? { backgroundColor: theme.primary } : {}}
              >
                Save
              </button>
            </div>
            <AnimatePresence>
              {nameSaveStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium"
                >
                  <CheckCircle2 size={12} />
                  <span>{nameSaveStatus}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Change API Key Section */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Key size={12} style={{ color: theme.primary }} />
                <span>Gemini API Key</span>
              </span>
              <span className="text-[9px] text-green-400 lowercase">{currentApiKey ? "custom key" : "app key active"}</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setKeyValidationStatus(null);
                }}
                className="w-full pl-4 pr-12 py-3 bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-xl text-xs font-medium focus:outline-none transition-colors font-mono"
                placeholder={currentApiKey ? "••••••••••••••••••••••••" : "Shared app key active (Optional custom key)"}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-4 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex gap-3 mt-1.5">
              <button
                onClick={handleValidateAndSaveKey}
                disabled={isValidating || !apiKey || apiKey === currentApiKey}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isValidating || !apiKey || apiKey === currentApiKey
                    ? 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5'
                    : 'text-black font-black'
                }`}
                style={!(isValidating || !apiKey || apiKey === currentApiKey) ? { backgroundColor: theme.primary } : {}}
              >
                {isValidating ? "Validating..." : "Validate & Save"}
              </button>

              {currentApiKey && (
                <button
                  onClick={() => setConfirmAction('deleteKey')}
                  className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete Key</span>
                </button>
              )}
            </div>

            <AnimatePresence>
              {keyValidationStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`p-3 border rounded-xl flex flex-col gap-2.5 text-[10px] font-medium leading-relaxed ${
                    keyValidationStatus.includes("validated") 
                      ? 'bg-green-500/5 border-green-500/10 text-green-400' 
                      : 'bg-red-500/5 border-red-500/10 text-red-400'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {keyValidationStatus.includes("validated") ? <CheckCircle2 size={13} className="shrink-0 mt-0.5" /> : <AlertTriangle size={13} className="shrink-0 mt-0.5" />}
                    <span>{keyValidationStatus}</span>
                  </div>
                  
                  {!keyValidationStatus.includes("validated") && (
                    <div className="border-t border-red-500/10 pt-2 flex flex-col gap-1">
                      <p className="text-[9px] text-neutral-500">Google APIs might block web requests directly from certain developer iframe sandboxes. If you are sure your key is correct:</p>
                      <button
                        type="button"
                        onClick={() => {
                          onSaveApiKey(apiKey);
                          setKeyValidationStatus("API Key updated (bypass validation) successfully! 🎉");
                          setTimeout(() => setKeyValidationStatus(null), 3000);
                        }}
                        className="self-start mt-0.5 px-2 py-1.5 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider text-neutral-300 transition-colors cursor-pointer"
                      >
                        Save anyway (Skip Validation)
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">Danger Zone</h3>

            <div className="flex flex-col gap-2.5">
              {/* Feedback & Report Problem */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 border border-pink-500/30 rounded-2xl">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                    <Instagram size={14} className="text-pink-400 shrink-0" />
                    <span>Feedback & Report Problem</span>
                  </h4>
                  <p className="text-[9px] text-neutral-400">Bugs, voice/call issues, chat, study mode, or feature suggestions? Message us directly on Instagram.</p>
                </div>
                <a
                  href="https://www.instagram.com/heymahiai?igsh=cXpzcDNxMXYzY2Zt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-orange-500/30 text-pink-200 hover:text-white border border-pink-500/40 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0 ml-2 shadow-sm"
                >
                  <Instagram size={11} />
                  <span>Report on IG</span>
                </a>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-300">Clear Conversation Memory</h4>
                  <p className="text-[9px] text-neutral-500">Deletes all saved IndexedDB chat history and learned context.</p>
                </div>
                <button
                  onClick={() => setConfirmAction('clearMemory')}
                  className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/15 hover:border-amber-500/30 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  <span>Clear Memory</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-red-500/[0.02] border border-red-500/10 rounded-2xl">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-300">Clear All Local Data</h4>
                  <p className="text-[9px] text-neutral-500">Wipes all cached names, tokens, settings, and memory.</p>
                </div>
                <button
                  onClick={() => setConfirmAction('clearAll')}
                  className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 hover:border-red-500/30 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  <span>Wipe Data</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {memoryStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-[10px] font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 size={13} />
                  <span>{memoryStatus}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row gap-2 justify-between items-center text-[10px] text-neutral-500 font-mono uppercase">
          <span className="flex items-center gap-1">
            <Lock size={11} />
            <span>Encrypted local storage</span>
          </span>
          <a
            href="https://youtube.com/@mpsthakur07?si=9Usj--LVcM9tFQDM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-[11px] font-bold text-red-200 hover:text-white transition-all cursor-pointer normal-case group"
          >
            <svg className="w-3.5 h-3.5 fill-red-500 group-hover:fill-red-400 transition-colors shrink-0" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Developed by mps thakur 07</span>
          </a>
        </div>

        {/* Inline Confirmation Overlays */}
        <AnimatePresence>
          {confirmAction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="max-w-xs space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
                  <AlertTriangle size={24} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {confirmAction === 'deleteKey' && "Delete API Key?"}
                    {confirmAction === 'resetOnboarding' && "Reset Onboarding?"}
                    {confirmAction === 'clearMemory' && "Clear Memory?"}
                    {confirmAction === 'clearAll' && "Clear All Local Data?"}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {confirmAction === 'deleteKey' && "This will remove your Gemini API Key. You will need to enter a new one to talk with Mahi again."}
                    {confirmAction === 'resetOnboarding' && "This will take you back to the onboarding wizard. Your current key will remain cached until cleared."}
                    {confirmAction === 'clearMemory' && "This will delete all saved IndexedDB chat logs and memory. Mahi will start fresh on next call."}
                    {confirmAction === 'clearAll' && "Warning: This action is permanent! This will clear your name, key, settings, and conversation memory completely."}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-neutral-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeConfirmedAction}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-colors cursor-pointer"
                  >
                    Yes, Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
