import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Compass, Sparkles, HelpCircle, Shield, FileText, Phone, ArrowLeft, AlertCircle } from 'lucide-react';

interface NotFoundPageProps {
  theme?: {
    primary: string;
    secondary: string;
    glow: string;
    bgGlow: string;
    border: string;
    button: string;
  };
}

export function NotFoundPage({ theme }: NotFoundPageProps) {
  const navigate = useNavigate();
  const primaryColor = theme?.primary || '#ec4899';

  useEffect(() => {
    document.title = 'Page Not Found (404) - HeyMahi AI';
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'The page you are looking for does not exist on HeyMahi.in. Return to home to chat with your virtual AI companion.');
    }
  }, []);

  const usefulLinks = [
    { name: 'Home', path: '/', icon: Home, desc: 'Return to live voice chat with Mahi' },
    { name: 'Features', path: '/features', icon: Sparkles, desc: 'Explore voice, study hub, & vision AI' },
    { name: 'How to Use', path: '/how-to-use', icon: Compass, desc: 'Step-by-step beginner & student guides' },
    { name: 'FAQ', path: '/faq', icon: HelpCircle, desc: 'Frequently asked questions' },
    { name: 'About', path: '/about', icon: AlertCircle, desc: 'Story & vision of Mahi AI' },
    { name: 'Privacy Policy', path: '/privacy-policy', icon: Shield, desc: '100% browser-local data privacy' },
    { name: 'Terms of Service', path: '/terms', icon: FileText, desc: 'Usage guidelines & terms' },
    { name: 'Contact', path: '/contact', icon: Phone, desc: 'Support & developer feedback' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#090412]/95 backdrop-blur-xl text-neutral-200 overflow-y-auto flex flex-col items-center justify-between p-4 sm:p-6 md:p-10 font-sans"
    >
      {/* Top Header Branding */}
      <div className="w-full max-w-4xl flex items-center justify-between py-2 border-b border-white/10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-black text-lg shadow-lg group-hover:scale-105 transition-transform"
            style={{ backgroundColor: primaryColor }}
          >
            M
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-wider text-white uppercase group-hover:text-purple-300 transition-colors">
              HeyMahi AI
            </h1>
            <p className="text-[11px] text-neutral-400 font-mono">Virtual AI Companion</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft size={14} />
          <span>Back to App</span>
        </button>
      </div>

      {/* Main 404 Hero Content */}
      <div className="w-full max-w-2xl text-center flex flex-col items-center gap-6 my-auto py-10">
        <div className="relative">
          <div 
            className="text-8xl sm:text-9xl font-black tracking-tighter select-none opacity-20 text-purple-400"
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-2xl sm:text-3xl font-black uppercase tracking-widest px-4 py-1.5 rounded-2xl bg-[#1a0c2e] border border-purple-500/40 text-white shadow-2xl"
              style={{ borderColor: primaryColor }}
            >
              Page Not Found
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-neutral-300 max-w-lg leading-relaxed">
          Oops! The page you were looking for doesn't exist or may have been moved. You can head back to the main companion stage or explore our helpful pages below.
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold text-black shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <Home size={16} />
            <span>Return to Home</span>
          </button>

          <button
            onClick={() => navigate('/how-to-use')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-sm font-medium text-white transition-all cursor-pointer"
          >
            <Compass size={16} className="text-purple-400" />
            <span>How to Use Guide</span>
          </button>
        </div>

        {/* Useful Quick Links Navigation Grid */}
        <div className="w-full mt-8 bg-neutral-900/80 border border-neutral-800 p-5 sm:p-6 rounded-3xl text-left shadow-2xl">
          <h2 className="text-xs uppercase font-mono font-bold tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400" />
            <span>Helpful Navigation Links</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {usefulLinks.map((link) => {
              const IconComp = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/60 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-700 transition-all group cursor-pointer"
                >
                  <div 
                    className="p-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 group-hover:bg-purple-500/20 shrink-0"
                  >
                    <IconComp size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {link.name}
                    </span>
                    <span className="text-[11px] text-neutral-400 leading-tight">
                      {link.desc}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full max-w-4xl pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-500 font-mono">
        <span>HeyMahi.in &copy; {new Date().getFullYear()} • Privacy-First AI Companion</span>
        <span>Secure Client-Side Architecture</span>
      </div>
    </motion.div>
  );
}
