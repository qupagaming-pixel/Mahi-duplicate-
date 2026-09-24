import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  MessageSquare,
  Smartphone,
  Zap,
  Volume2,
  Mic,
  Moon,
  Battery,
  BatteryCharging,
  Share2,
  ExternalLink,
  ShieldAlert,
  Edit2,
  Check,
  Plus,
  Trash2,
  Camera,
  MapPin,
  Youtube,
  Instagram,
  Music,
  HelpCircle,
} from 'lucide-react';
import {
  ContactEntry,
  getSavedContacts,
  saveContacts,
  triggerPhoneCall,
  triggerSms,
  triggerWhatsApp,
  launchMobileApp,
  toggleTorch,
  isTorchOn,
  vibrateDevice,
  getBatteryInfo,
} from '../utils/mobileControls';

interface MobileControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isWakeWordEnabled: boolean;
  onToggleWakeWord: () => void;
  onOpenAmbientLock: () => void;
  onStartCallWithPrompt?: (prompt: string) => void;
}

export const MobileControlCenter: React.FC<MobileControlCenterProps> = ({
  isOpen,
  onClose,
  isWakeWordEnabled,
  onToggleWakeWord,
  onOpenAmbientLock,
  onStartCallWithPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'contacts' | 'voiceGuide' | 'lockInfo'>('controls');
  const [torchActive, setTorchActive] = useState(isTorchOn());
  const [battery, setBattery] = useState<{ level: number; isCharging: boolean } | null>(null);
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Direct Call / Message manual input
  const [manualCallInput, setManualCallInput] = useState('');
  const [manualWaNumber, setManualWaNumber] = useState('');
  const [manualWaMsg, setManualWaMsg] = useState('');
  const [showManualWa, setShowManualWa] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setContacts(getSavedContacts());
    setTorchActive(isTorchOn());
    getBatteryInfo().then(setBattery);
  }, [isOpen]);

  const handleToggleTorch = async () => {
    const res = await toggleTorch();
    setTorchActive(res.isOn);
    setStatusMessage(res.message);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleVibrate = () => {
    vibrateDevice([120, 60, 120]);
    setStatusMessage('📳 Phone vibrated!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleCall = (target: string) => {
    const res = triggerPhoneCall(target);
    setStatusMessage(`Calling ${res.displayTarget}...`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSaveContact = (id: string) => {
    const updated = contacts.map(c => {
      if (c.id === id) {
        return { ...c, name: editName.trim() || c.name, number: editNumber.trim() };
      }
      return c;
    });
    setContacts(updated);
    saveContacts(updated);
    setEditingContactId(null);
    setStatusMessage('Contact number saved! Mahi will dial this when you ask.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleAddContact = () => {
    const newEntry: ContactEntry = {
      id: Date.now().toString(),
      name: 'Naya Dost',
      number: '',
      relationship: 'Friend',
    };
    const updated = [newEntry, ...contacts];
    setContacts(updated);
    saveContacts(updated);
    setEditingContactId(newEntry.id);
    setEditName(newEntry.name);
    setEditNumber('');
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-[#160c2b] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-900/60 to-pink-900/40 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Smartphone size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Mobile Control Center</h2>
              <p className="text-xs text-purple-300/80">Call, WhatsApp, Apps, Flashlight & Wake Word</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-purple-900/40 bg-[#120824] px-3 py-1.5 gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'controls'
                ? 'bg-purple-600 text-white shadow'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚡ Controls & Actions
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'bg-purple-600 text-white shadow'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            📞 Phone Numbers
          </button>
          <button
            onClick={() => setActiveTab('voiceGuide')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'voiceGuide'
                ? 'bg-purple-600 text-white shadow'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            🎙️ Voice Commands
          </button>
          <button
            onClick={() => setActiveTab('lockInfo')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'lockInfo'
                ? 'bg-purple-600 text-white shadow'
                : 'text-purple-300/70 hover:text-white hover:bg-white/5'
            }`}
          >
            🔒 Lock Screen Mode
          </button>
        </div>

        {/* Status Toast */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-pink-600/30 border-b border-pink-500/40 px-4 py-2 text-center text-xs font-medium text-pink-200"
            >
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-sm text-purple-100">
          {activeTab === 'controls' && (
            <div className="space-y-4">
              {/* Wake Word & Ambient Standby Highlight Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/80 to-[#1e103d] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic size={18} className="text-pink-400" />
                    <span className="font-semibold text-white text-xs sm:text-sm">"Hey Mahi" Wake Word</span>
                  </div>
                  <button
                    onClick={onToggleWakeWord}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isWakeWordEnabled
                        ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {isWakeWordEnabled ? 'ON 🟢' : 'OFF'}
                  </button>
                </div>
                <p className="text-xs text-purple-300/80 leading-relaxed">
                  Jab ON ho, aap bina screen chhue kabhi bhi <span className="text-pink-300 font-semibold">"Hey Mahi"</span> bolkar call/assistant start kar sakte hain.
                </p>
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAmbientLock();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600/40 hover:bg-purple-600 border border-purple-400/40 text-xs font-medium text-white transition-all cursor-pointer"
                  >
                    <Moon size={14} className="text-purple-300" />
                    <span>OLED Lock Screen Standby</span>
                  </button>
                </div>
              </div>

              {/* Hardware / Device Controls Grid */}
              <div>
                <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Device Controls</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Torch */}
                  <button
                    onClick={handleToggleTorch}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      torchActive
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-purple-200'
                    }`}
                  >
                    <Zap size={20} className={torchActive ? 'text-amber-400 animate-pulse' : 'text-purple-400'} />
                    <span className="text-xs font-medium mt-1.5">{torchActive ? 'Torch ON' : 'Flashlight'}</span>
                  </button>

                  {/* Vibrate */}
                  <button
                    onClick={handleVibrate}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 transition-all cursor-pointer"
                  >
                    <Volume2 size={20} className="text-pink-400" />
                    <span className="text-xs font-medium mt-1.5">Vibrate</span>
                  </button>

                  {/* Battery */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 text-purple-200">
                    {battery?.isCharging ? (
                      <BatteryCharging size={20} className="text-green-400" />
                    ) : (
                      <Battery size={20} className="text-cyan-400" />
                    )}
                    <span className="text-xs font-medium mt-1.5">
                      {battery ? `${battery.level}% ${battery.isCharging ? '⚡' : ''}` : 'Battery OK'}
                    </span>
                  </div>

                  {/* Quick Share */}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Mahi AI Companion',
                          text: 'Hey! Check out Mahi, the AI Companion with voice, vision and mobile controls!',
                          url: window.location.href,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        setStatusMessage('Link copied to clipboard!');
                        setTimeout(() => setStatusMessage(null), 2500);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 transition-all cursor-pointer"
                  >
                    <Share2 size={20} className="text-purple-300" />
                    <span className="text-xs font-medium mt-1.5">Share App</span>
                  </button>
                </div>
              </div>

              {/* Direct Quick Dial & WhatsApp Message */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Quick Call / WhatsApp</h3>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Enter phone number or name..."
                    value={manualCallInput}
                    onChange={(e) => setManualCallInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={() => {
                      if (manualCallInput.trim()) {
                        handleCall(manualCallInput.trim());
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Phone size={14} />
                    <span>Call</span>
                  </button>
                </div>

                {/* WhatsApp button */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowManualWa(!showManualWa)}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare size={14} />
                      <span>Direct WhatsApp Message Composer</span>
                    </span>
                    <span>{showManualWa ? '▲ Hide' : '▼ Compose'}</span>
                  </button>

                  {showManualWa && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-3 rounded-xl bg-black/40 border border-white/10 space-y-2"
                    >
                      <input
                        type="tel"
                        placeholder="WhatsApp Number (e.g. 9876543210)"
                        value={manualWaNumber}
                        onChange={(e) => setManualWaNumber(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-green-400"
                      />
                      <input
                        type="text"
                        placeholder="Message (e.g. Kahan ho?)"
                        value={manualWaMsg}
                        onChange={(e) => setManualWaMsg(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-green-400"
                      />
                      <button
                        onClick={() => {
                          if (manualWaNumber.trim()) {
                            triggerWhatsApp(manualWaNumber.trim(), manualWaMsg.trim());
                          }
                        }}
                        className="w-full py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Send on WhatsApp
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Instant App Launchers */}
              <div>
                <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Instant App Launchers</h3>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => launchMobileApp('youtube')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <Youtube size={22} className="text-red-500" />
                    <span className="text-[11px] mt-1">YouTube</span>
                  </button>
                  <button
                    onClick={() => launchMobileApp('whatsapp')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <MessageSquare size={22} className="text-[#25D366]" />
                    <span className="text-[11px] mt-1">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => launchMobileApp('instagram')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <Instagram size={22} className="text-pink-500" />
                    <span className="text-[11px] mt-1">Instagram</span>
                  </button>
                  <button
                    onClick={() => launchMobileApp('maps')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <MapPin size={22} className="text-cyan-400" />
                    <span className="text-[11px] mt-1">Google Maps</span>
                  </button>
                  <button
                    onClick={() => launchMobileApp('spotify')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <Music size={22} className="text-green-400" />
                    <span className="text-[11px] mt-1">Spotify</span>
                  </button>
                  <button
                    onClick={() => launchMobileApp('camera')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <Camera size={22} className="text-purple-400" />
                    <span className="text-[11px] mt-1">Camera</span>
                  </button>
                  <button
                    onClick={() => launchMobileApp('calculator')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <Zap size={22} className="text-yellow-400" />
                    <span className="text-[11px] mt-1">Calculator</span>
                  </button>
                  <button
                    onClick={() => launchMobileApp('chrome')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <ExternalLink size={22} className="text-blue-400" />
                    <span className="text-[11px] mt-1">Browser</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-purple-300/80">
                  Apne contacts ke phone numbers save karein taaki bolne par Mahi direct dial kar sake:
                </p>
                <button
                  onClick={handleAddContact}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-2">
                {contacts.map((contact) => {
                  const isEditing = editingContactId === contact.id;

                  return (
                    <div
                      key={contact.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                    >
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Name (e.g. Mummy)"
                            className="w-full bg-white/10 border border-purple-400 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                          />
                          <input
                            type="tel"
                            value={editNumber}
                            onChange={(e) => setEditNumber(e.target.value)}
                            placeholder="Phone Number (e.g. 9876543210)"
                            className="w-full bg-white/10 border border-purple-400 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveContact(contact.id)}
                              className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={12} /> Save
                            </button>
                            <button
                              onClick={() => setEditingContactId(null)}
                              className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs sm:text-sm">{contact.name}</span>
                              {contact.relationship && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/40">
                                  {contact.relationship}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-purple-300/70 truncate">
                              {contact.number ? contact.number : 'Number add nahi hai (Tap edit)'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {contact.number && (
                              <button
                                onClick={() => handleCall(contact.number)}
                                className="p-2 rounded-xl bg-green-600 hover:bg-green-500 text-white transition-colors cursor-pointer"
                                title={`Call ${contact.name}`}
                              >
                                <Phone size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingContactId(contact.id);
                                setEditName(contact.name);
                                setEditNumber(contact.number);
                              }}
                              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                              title="Edit number"
                            >
                              <Edit2 size={14} />
                            </button>
                            {contact.id !== '1' && contact.id !== '2' && contact.id !== '4' && (
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'voiceGuide' && (
            <div className="space-y-3">
              <p className="text-xs text-purple-300/80">
                Aap call par ya chat me Mahi ko natural Hinglish me ye commands bol sakte hain:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-semibold text-green-400">📞 Phone Call lagana:</span>
                  <p className="text-purple-200">"Mahi, Mummy ko phone lagao"</p>
                  <p className="text-purple-200">"Call Papa" ya "9876543210 par call karo"</p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-semibold text-[#25D366]">💬 WhatsApp / SMS bhejna:</span>
                  <p className="text-purple-200">"Rahul ko WhatsApp message bhejo 'main late ho jaunga'"</p>
                  <p className="text-purple-200">"Mummy ko SMS karo"</p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-semibold text-red-400">🚀 Apps Open karna:</span>
                  <p className="text-purple-200">"Mahi, YouTube kholo aur Arijit Singh ke gane chalao"</p>
                  <p className="text-purple-200">"Google Maps kholo petrol pump ke liye"</p>
                  <p className="text-purple-200">"Camera open karo" ya "Calculator kholo"</p>
                  <p className="text-purple-200">"Instagram open karo"</p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-semibold text-amber-400">🔦 Device Features:</span>
                  <p className="text-purple-200">"Flashlight on karo" / "Torch jalao"</p>
                  <p className="text-purple-200">"Phone vibrate karo"</p>
                  <p className="text-purple-200">"Battery kitni hai?"</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lockInfo' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Moon size={16} className="text-pink-400" />
                  <span>Lock Screen & "Hey Mahi" Kaise Kaam Karta Hai?</span>
                </h3>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Mobile OS (Android aur iOS) security aur privacy reasons se screen lock / phone display off hone par kisi bhi browser tab ka microphone automatically suspend kar dete hain taaki koi background app secretly record na kare.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-semibold text-pink-300">
                  ✨ Mahi ka Solution: OLED Ambient Standby Mode
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  Mahi me humne **Screen Wake Lock + OLED Black Screen** design kiya hai:
                </p>
                <ul className="text-xs text-purple-200/80 list-disc list-inside space-y-1">
                  <li>Phone desk, bedside ya car me rakhein.</li>
                  <li>Screen band hone ke badle pure black OLED display par rehti hai (battery consume nahi hoti).</li>
                  <li>Mahi ka continuous ear 100% active rehta hai.</li>
                  <li>Jaise hi aap <span className="text-pink-300 font-semibold">"Hey Mahi"</span> bolte hain, Mahi turant wake up ho kar baat shuru kar deti hai!</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenAmbientLock();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs transition-all shadow-lg hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
              >
                <Moon size={16} />
                <span>OLED Ambient Standby Abhi Start Karein</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-[#110722] border-t border-purple-900/30 flex items-center justify-between text-xs text-purple-400">
          <span>Mahi Assistant 2.0 • Mobile Control Engine</span>
          <button
            onClick={onClose}
            className="text-white hover:underline cursor-pointer font-medium"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
