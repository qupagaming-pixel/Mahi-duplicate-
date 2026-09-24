import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Search, Shield, FileText, HelpCircle, Info, Phone, 
  AlertTriangle, Cookie, History, ChevronRight, ChevronDown, 
  Send, Mail, Youtube, Github, Twitter, Linkedin, Check, ExternalLink,
  BookOpen, Star, AlertCircle, Sparkles, MessageSquare, Clock, Instagram,
  GraduationCap, Music, ShieldCheck, Eye, Mic, Activity, CheckCircle2,
  Sliders, Compass, Layers, Cpu, Zap
} from 'lucide-react';

import { 
  FAQS, HELP_ARTICLES, TUTORIALS, RELEASE_NOTES, 
  PRIVACY_POLICY, TERMS_OF_SERVICE, ABOUT_MAHI, 
  DISCLAIMER, COOKIES_POLICY, LAST_UPDATED, SUPPORT_EMAIL, 
  DEVELOPER_NAME, APP_NAME, FEATURES_DATA, HOW_TO_USE_DATA,
  AI_COMPANION_GUIDE
} from '../data/infoData';
import { FAQItem, HelpArticle, TutorialCard, ReleaseNote, FeatureDetail, HowToUseItem } from '../types';

// Types of sub-pages within the portal
type InfoView = 
  | 'home'
  | 'features'
  | 'how-to-use'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'contact'
  | 'help'
  | 'tutorials'
  | 'faq'
  | 'disclaimer'
  | 'cookies'
  | 'release-notes'
  | 'ai-companion-guide';

interface InfoCenterProps {
  onClose: () => void;
  theme: {
    primary: string;
    secondary: string;
    glow: string;
    bgGlow: string;
    border: string;
    button: string;
  };
  userName: string;
}

export function InfoCenter({ onClose, theme, userName }: InfoCenterProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const routeToView = (path: string): InfoView => {
    switch (path) {
      case '/features': return 'features';
      case '/how-to-use': return 'how-to-use';
      case '/about': return 'about';
      case '/privacy':
      case '/privacy-policy': return 'privacy';
      case '/terms': return 'terms';
      case '/contact': return 'contact';
      case '/help': return 'home';
      case '/tutorials': return 'tutorials';
      case '/faq': return 'faq';
      case '/disclaimer': return 'disclaimer';
      case '/cookies': return 'cookies';
      case '/release-notes': return 'release-notes';
      case '/ai-companion-guide': return 'ai-companion-guide';
      default: return 'home';
    }
  };

  const currentView = routeToView(location.pathname);

  const viewToPath = (view: InfoView): string => {
    if (view === 'home') return '/help';
    if (view === 'privacy') return '/privacy-policy';
    return `/${view}`;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [faqExpanded, setFaqExpanded] = useState<Record<string, boolean>>({});
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string | undefined>(undefined);
  const [selectedHelpCategory, setSelectedHelpCategory] = useState<string>('All');
  const [activeHelpArticle, setActiveHelpArticle] = useState<HelpArticle | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<TutorialCard | null>(null);

  // Contact Form States
  const [contactForm, setContactForm] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Scroll to top on view changes
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView, activeHelpArticle, activeTutorial]);

  // Navigate view
  const navigateTo = (view: InfoView) => {
    // Reset specific sub-page views
    if (view !== 'help') setActiveHelpArticle(null);
    if (view !== 'tutorials') setActiveTutorial(null);
    navigate(viewToPath(view));
  };

  const handleBack = () => {
    if (activeHelpArticle) {
      setActiveHelpArticle(null);
      return;
    }
    if (activeTutorial) {
      setActiveTutorial(null);
      return;
    }
    navigate('/help');
  };

  // SEO & Schema.org Structured Data Updates
  const seoMetadata = useMemo(() => {
    const defaultData = {
      title: 'Mahi AI Support & Legal Portal',
      description: 'Find official Privacy Policies, Terms of Service, user FAQs, and searchable Help Guides for the Mahi AI virtual companion.',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Mahi AI Information Hub',
        'url': window.location.origin,
        'description': 'Help Center and legal information for Mahi AI'
      }
    };

    switch (currentView) {
      case 'features':
        return {
          title: 'Mahi AI Features - Real-Time Voice, Vision & Study Hub',
          description: 'Explore all advanced capabilities of Mahi AI: low-latency bidirectional voice, dynamic 19 anime emotion poses, multimodal vision OCR, YIN pitch detection, and 100% local privacy.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': 'Mahi AI Platform Features',
            'itemListElement': FEATURES_DATA.map((feat, idx) => ({
              '@type': 'ListItem',
              'position': idx + 1,
              'name': feat.title,
              'description': feat.description
            }))
          }
        };
      case 'how-to-use':
        return {
          title: 'How to Use Mahi AI - Complete Setup, Study & Calling Guide',
          description: 'Step-by-step guides on getting your free Google Gemini API key, talking to Mahi, and using Study Hub for exams.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            'name': 'How to Use Mahi AI Virtual Companion',
            'step': HOW_TO_USE_DATA[0].steps.map((s, idx) => ({
              '@type': 'HowToStep',
              'position': idx + 1,
              'name': s.heading,
              'text': s.description
            }))
          }
        };
      case 'privacy':
        return {
          title: 'Privacy Policy - Mahi AI',
          description: 'Learn how Mahi AI ensures absolute local privacy. Your Gemini API key and chat logs stay entirely in your browser\'s localStorage.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'PrivacyPolicy',
            'name': 'Mahi AI Privacy Policy',
            'url': 'https://heymahi.in/privacy-policy',
            'dateModified': LAST_UPDATED
          }
        };
      case 'terms':
        return {
          title: 'Terms of Service - Mahi AI',
          description: 'Official Terms of Service for Mahi AI. Understand user responsibilities, self-provided API key usage, costs, and guidelines.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'TermsOfService',
            'name': 'Mahi AI Terms of Service',
            'url': 'https://heymahi.in/terms',
            'dateModified': LAST_UPDATED
          }
        };
      case 'about':
        return {
          title: 'About Mahi AI - Virtual Companion Story',
          description: 'Read the story of Mahi AI, created by MPS Thakur and powered by Google Gemini. Discover our vision for privacy-first companion AI.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            'name': 'About Mahi AI',
            'description': 'Mission and story of Mahi AI, built by MPS Thakur.'
          }
        };
      case 'contact':
        return {
          title: 'Contact Support & Feedback - Mahi AI',
          description: 'Get in touch with developer MPS Thakur regarding Mahi AI. Submit questions or report bugs. Expected response under 24 hours.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            'name': 'Mahi AI Contact Page',
            'contactPoint': {
              '@type': 'ContactPoint',
              'email': SUPPORT_EMAIL,
              'contactType': 'technical support'
            }
          }
        };
      case 'help':
        const helpTitle = activeHelpArticle ? `${activeHelpArticle.title} - Help Center` : 'Help Center & Troubleshooting - Mahi AI';
        return {
          title: helpTitle,
          description: activeHelpArticle ? activeHelpArticle.summary : 'Searchable help guides for Mahi AI setting up, resolving invalid API keys, fixing microphone access, and vision features.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'name': 'Mahi AI Help Center',
            'mainEntity': HELP_ARTICLES.slice(0, 5).map(art => ({
              '@type': 'Question',
              'name': art.title,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': art.summary
              }
            }))
          }
        };
      case 'tutorials':
        const tutTitle = activeTutorial ? `Tutorial: ${activeTutorial.title}` : 'Video & Step-by-Step Tutorials - Mahi AI';
        return {
          title: tutTitle,
          description: activeTutorial ? activeTutorial.description : 'Step-by-step onboarding cards. How to get a Gemini API key, microphone setup, and multimodal image analysis tutorials.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            'name': activeTutorial ? activeTutorial.title : 'Mahi AI Setup Tutorials',
            'step': (activeTutorial ? activeTutorial.steps : TUTORIALS[0].steps).map((step, idx) => ({
              '@type': 'HowToStep',
              'position': idx + 1,
              'text': step
            }))
          }
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions (FAQs) - Mahi AI',
          description: 'Browse over 25 technical, financial, and companion FAQs for Mahi AI, covering local storage security and troubleshooting.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'name': 'Mahi AI FAQs',
            'mainEntity': FAQS.slice(0, 10).map(item => ({
              '@type': 'Question',
              'name': item.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': item.answer
              }
            }))
          }
        };
      case 'disclaimer':
        return {
          title: 'Disclaimer & Trademark Notices - Mahi AI',
          description: 'Official disclaimer statement for Mahi AI. Not affiliated with Google. Gemini is a registered trademark of Google LLC.',
          schema: defaultData.schema
        };
      case 'cookies':
        return {
          title: 'Cookies & Local Storage Policy - Mahi AI',
          description: 'Transparency report on cookie usage and local storage browser variables for Mahi AI.',
          schema: defaultData.schema
        };
      case 'release-notes':
        return {
          title: 'Release Notes & Versions - Mahi AI',
          description: 'Mahi AI updates log, including pitch tracker calibration, study suite, and future expansion roadmaps.',
          schema: defaultData.schema
        };
      case 'ai-companion-guide':
        return {
          title: 'AI Companion Guide - Architecture, Privacy & Ethics | HeyMahi',
          description: 'A comprehensive educational guide on voice-first AI companions, real-time neural speech synthesis, client-side localStorage privacy, and responsible AI interaction.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': AI_COMPANION_GUIDE.title,
            'author': {
              '@type': 'Person',
              'name': DEVELOPER_NAME
            },
            'datePublished': '2026-07-13',
            'dateModified': LAST_UPDATED
          }
        };
      default:
        return defaultData;
    }
  }, [currentView, activeHelpArticle, activeTutorial]);

  // Inject Meta and Title Dynamically
  useEffect(() => {
    // 1. Update document title
    document.title = seoMetadata.title;

    // 2. Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seoMetadata.description);

    // 3. Update Canonical Link
    let canonicalLink = document.querySelector('link[id="mahi-canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('id', 'mahi-canonical');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const currentPath = currentView === 'privacy' ? 'privacy-policy' : (currentView === 'home' ? 'help' : currentView);
    const resolvedUrl = `https://heymahi.in/${currentPath}`;
    canonicalLink.setAttribute('href', resolvedUrl);

    // 4. Update Open Graph Meta Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', seoMetadata.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', seoMetadata.description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', resolvedUrl);

    // 5. Update Twitter Meta Tags
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta');
      twitterTitle.setAttribute('name', 'twitter:title');
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute('content', seoMetadata.title);

    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDesc) {
      twitterDesc = document.createElement('meta');
      twitterDesc.setAttribute('name', 'twitter:description');
      document.head.appendChild(twitterDesc);
    }
    twitterDesc.setAttribute('content', seoMetadata.description);

    let twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (!twitterUrl) {
      twitterUrl = document.createElement('meta');
      twitterUrl.setAttribute('name', 'twitter:url');
      document.head.appendChild(twitterUrl);
    }
    twitterUrl.setAttribute('content', resolvedUrl);

    // 6. Inject JSON-LD Schema.org Structured Data
    let schemaScript = document.getElementById('mahi-seo-jsonld');
    if (schemaScript) {
      schemaScript.remove();
    }
    schemaScript = document.createElement('script');
    schemaScript.id = 'mahi-seo-jsonld';
    schemaScript.setAttribute('type', 'application/ld+json');
    schemaScript.innerHTML = JSON.stringify(seoMetadata.schema);
    document.head.appendChild(schemaScript);

    return () => {
      // Restore defaults on unmount
      document.title = "Mahi AI - Premium Privacy-First Virtual Companion & Assistant";
      
      const defaultDesc = "Meet Mahi, an emotionally intelligent, sweet, and sassy anime-inspired virtual companion. Enjoy high-fidelity real-time voice-to-voice chat, multimodal image vision analysis, absolute local privacy, and smart study sessions powered by Google Gemini.";
      if (metaDesc) metaDesc.setAttribute('content', defaultDesc);
      if (canonicalLink) canonicalLink.setAttribute('href', "https://heymahi.in/");
      if (ogTitle) ogTitle.setAttribute('content', "Mahi AI - Premium Privacy-First Virtual Companion & Assistant");
      if (ogDesc) ogDesc.setAttribute('content', defaultDesc);
      if (ogUrl) ogUrl.setAttribute('content', "https://heymahi.in/");
      if (twitterTitle) twitterTitle.setAttribute('content', "Mahi AI - Premium Privacy-First Virtual Companion & Assistant");
      if (twitterDesc) twitterDesc.setAttribute('content', defaultDesc);
      if (twitterUrl) twitterUrl.setAttribute('content', "https://heymahi.in/");

      const defaultSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Mahi AI",
        "operatingSystem": "All",
        "applicationCategory": "AssistantApplication",
        "browserRequirements": "Requires HTML5 Canvas, Web Audio API, WebSocket support",
        "genre": "Virtual Companion & Entertainment",
        "url": "https://heymahi.in/",
        "image": "https://heymahi.in/favicon.png",
        "description": "An emotionally intelligent, sweet, and sassy anime-inspired personal AI assistant with real-time voice-to-voice interaction.",
        "author": {
          "@type": "Person",
          "name": "MPS Thakur"
        },
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD"
        }
      };

      const originalScript = document.getElementById('mahi-seo-jsonld');
      if (originalScript) originalScript.remove();

      const newScript = document.createElement('script');
      newScript.id = 'mahi-seo-jsonld';
      newScript.setAttribute('type', 'application/ld+json');
      newScript.innerHTML = JSON.stringify(defaultSchema);
      document.head.appendChild(newScript);
    };
  }, [seoMetadata]);

  // Dynamic Search Index & Weighted Ranking Engine
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const rawQuery = searchQuery.trim();
    const query = rawQuery.toLowerCase();
    const queryTerms = query.split(/\s+/).filter(Boolean);

    // Scoring function for keyword weight matching
    const getScore = (title: string, descOrSummary: string, categoryOrTags: string = '') => {
      let score = 0;
      const t = title.toLowerCase();
      const d = descOrSummary.toLowerCase();
      const c = categoryOrTags.toLowerCase();

      // Check for exact query string
      if (t === query) score += 300;
      else if (t.includes(query)) score += 150;

      // Score individual terms
      queryTerms.forEach(term => {
        if (t.includes(term)) score += 60;
        if (c.includes(term)) score += 30;
        if (d.includes(term)) score += 10;
      });

      // Special boost if title contains Mahi or Assistant
      if (t.includes('mahi') || t.includes('assistant') || t.includes('companion')) {
        score += 100;
      }

      return score;
    };

    const matchedFaqs = FAQS
      .map(f => ({ ...f, score: getScore(f.question, f.answer, f.category) }))
      .filter(f => f.score > 0 || f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query))
      .sort((a, b) => b.score - a.score);

    const matchedHelp = HELP_ARTICLES
      .map(a => ({ ...a, score: getScore(a.title, a.summary + ' ' + a.content, a.category + ' ' + a.tags.join(' ')) }))
      .filter(a => a.score > 0 || a.title.toLowerCase().includes(query) || a.summary.toLowerCase().includes(query) || a.content.toLowerCase().includes(query))
      .sort((a, b) => b.score - a.score);

    const matchedTutorials = TUTORIALS
      .map(t => ({ ...t, score: getScore(t.title, t.description + ' ' + t.steps.join(' '), t.difficulty) }))
      .filter(t => t.score > 0 || t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query) || t.steps.some(s => s.toLowerCase().includes(query)))
      .sort((a, b) => b.score - a.score);

    // Detect if query relates to Mahi, AI Assistant, ChatGPT, Gemini, Claude, or any search
    const isMahiQuery = queryTerms.some(term => 
      ['mahi', 'ai', 'assistant', 'companion', 'virtual', 'gemini', 'bot', 'voice', 'sing', 'ludo', 'privacy', 'help', 'setup', 'mps', 'thakur', 'app', 'best', 'personal', 'chat', 'chatgpt', 'gpt', 'claude', 'cloude', 'deepseek', 'grok', 'llama', 'search'].includes(term)
    ) || query.length > 0;

    return {
      query: rawQuery,
      isMahiQuery,
      faqs: matchedFaqs,
      help: matchedHelp,
      tutorials: matchedTutorials,
      totalCount: matchedFaqs.length + matchedHelp.length + matchedTutorials.length + (isMahiQuery ? 1 : 0)
    };
  }, [searchQuery]);

  // Expand individual FAQs
  const toggleFaq = (id: string) => {
    setFaqExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Help categories
  const helpCategories = useMemo(() => {
    const cats = new Set(HELP_ARTICLES.map(art => art.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredHelpArticles = useMemo(() => {
    if (selectedHelpCategory === 'All') return HELP_ARTICLES;
    return HELP_ARTICLES.filter(art => art.category === selectedHelpCategory);
  }, [selectedHelpCategory]);

  // Contact Form Submission Simulation
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.subject || !contactForm.message) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setContactSubmitted(true);
      setContactForm({ email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-[80] bg-neutral-950 text-neutral-100 flex flex-col md:flex-row h-full overflow-hidden"
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{ backgroundColor: theme.primary }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{ backgroundColor: theme.secondary }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
      </div>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto relative z-10 flex flex-col h-full pointer-events-auto"
      >
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 px-4 py-4 md:px-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={currentView === 'home' ? onClose : handleBack}
                className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 cursor-pointer flex items-center justify-center text-neutral-350 transition-all shadow-lg"
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </motion.button>
              
              <div>
                <div className="flex items-center gap-2">
                  <img 
                    src="/mahi-avatar.webp" 
                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo512.png'; }}
                    alt="Mahi AI Logo" 
                    width={20}
                    height={20}
                    loading="lazy"
                    decoding="async"
                    className="w-5 h-5 rounded-full object-cover border border-purple-500/40 shadow-sm"
                    style={{ boxShadow: `0 0 10px ${theme.glow}` }}
                  />
                  <span className="text-xs uppercase tracking-[3px] text-neutral-400 font-semibold font-mono">Mahi AI Info Portal</span>
                </div>
                <h1 className="text-md md:text-lg font-bold tracking-tight text-white uppercase flex items-center gap-2">
                  {currentView === 'home' && <span>Center Dashboard</span>}
                  {currentView === 'features' && <span>Platform Features</span>}
                  {currentView === 'how-to-use' && <span>How to Use Guides</span>}
                  {currentView === 'privacy' && <span>Privacy Policy</span>}
                  {currentView === 'terms' && <span>Terms of Service</span>}
                  {currentView === 'about' && <span>About Companion</span>}
                  {currentView === 'contact' && <span>Contact Support</span>}
                  {currentView === 'help' && <span>Help & Guides</span>}
                  {currentView === 'tutorials' && <span>Step Tutorials</span>}
                  {currentView === 'faq' && <span>Frequently FAQs</span>}
                  {currentView === 'disclaimer' && <span>Disclaimer Policy</span>}
                  {currentView === 'cookies' && <span>Cookies Policy</span>}
                  {currentView === 'release-notes' && <span>Release Notes</span>}
                  {currentView === 'ai-companion-guide' && <span>AI Companion Guide</span>}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Back to Chat Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border flex items-center gap-1.5 cursor-pointer text-white shadow-lg transition-all"
                style={{ 
                  backgroundColor: `${theme.primary}15`, 
                  borderColor: `${theme.primary}35`,
                  boxShadow: `0 4px 15px rgba(0,0,0,0.4)`
                }}
              >
                <MessageSquare size={13} style={{ color: theme.primary }} />
                <span>Companion Chat</span>
              </motion.button>
            </div>
          </div>

          {/* Breadcrumb & Quick Search Box */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
              <button onClick={() => navigateTo('home')} className="hover:text-white hover:underline transition-colors cursor-pointer">MAHI HUB</button>
              {currentView !== 'home' && (
                <>
                  <ChevronRight size={10} className="text-neutral-600" />
                  <span className="text-neutral-500 uppercase tracking-wider">
                    {activeHelpArticle ? 'Help Article' : activeTutorial ? 'Tutorial Card' : currentView}
                  </span>
                </>
              )}
              {activeHelpArticle && (
                <>
                  <ChevronRight size={10} className="text-neutral-600" />
                  <span className="text-neutral-300 truncate max-w-[120px]">{activeHelpArticle.title}</span>
                </>
              )}
              {activeTutorial && (
                <>
                  <ChevronRight size={10} className="text-neutral-600" />
                  <span className="text-neutral-300 truncate max-w-[120px]">{activeTutorial.title}</span>
                </>
              )}
            </div>

            {/* Hub Search Box */}
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search articles, FAQs, guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-neutral-700 pl-9 pr-8 py-2 rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-all font-sans focus:ring-1"
                style={{ '--tw-ring-color': theme.primary } as any}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-500 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Portal Body with Transition Animations */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto pb-24">
          <AnimatePresence mode="wait">
            {/* SEARCH RESULTS VIEW */}
            {searchQuery && searchResults ? (
              <motion.div
                key="search-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Search size={18} style={{ color: theme.primary }} />
                      Search Outcomes
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Found {searchResults.totalCount} results matching <span className="text-white font-mono font-bold bg-neutral-850 px-1.5 py-0.5 rounded">"{searchQuery}"</span>
                    </p>
                  </div>
                  {searchResults.totalCount > 0 && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl cursor-pointer transition-all self-start border border-neutral-700/50"
                    >
                      Clear Search
                    </button>
                  )}
                </div>

                {searchResults.totalCount === 0 ? (
                  <div className="text-center py-16 bg-neutral-900/30 border border-dashed border-neutral-800 rounded-3xl flex flex-col items-center gap-3">
                    <AlertCircle size={32} className="text-neutral-500" />
                    <p className="text-sm font-semibold text-neutral-300">No matching guides or answers found</p>
                    <p className="text-xs text-neutral-500 max-w-sm">
                      Try searching with keywords like "API Key", "mic permission", "Voice working", "Ludo", or "crying expression".
                    </p>
                    <button
                      onClick={() => navigateTo('contact')}
                      className="mt-2 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider rounded-xl cursor-pointer"
                      style={{ backgroundColor: theme.primary }}
                    >
                      Contact Technical Support
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {/* TOP RANKED MATCH #1 — MAHI AI ASSISTANT HERO CARD */}
                    {searchResults.isMahiQuery && (
                      <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative overflow-hidden bg-gradient-to-r from-purple-950/80 via-neutral-900 to-pink-950/80 border-2 border-purple-500/60 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                        style={{ boxShadow: `0 0 30px ${theme.glow}` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative shrink-0">
                            <img
                              src="/mahi-avatar.webp"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/logo512.png'; }}
                              alt="Mahi AI Assistant"
                              width={64}
                              height={64}
                              loading="lazy"
                              decoding="async"
                              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-purple-400 shadow-xl"
                            />
                            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-md">
                              #1 RANK
                            </span>
                          </div>
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-[10px] font-bold text-purple-200 uppercase tracking-widest font-mono mb-1.5">
                              <Sparkles size={11} className="text-amber-300" />
                              <span>TOP RANKED SEARCH MATCH #1</span>
                            </div>
                            <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                              <span>Mahi AI Assistant</span>
                              <span className="text-xs text-purple-300 font-normal font-sans lowercase">(@heymahi_official)</span>
                            </h3>
                            <p className="text-xs text-neutral-300 mt-1 max-w-xl leading-relaxed">
                              The #1 emotionally intelligent, sweet, and sassy virtual AI companion & assistant. Features real-time voice-to-voice interaction, multimodal image vision, Study Hub assistance, and absolute local browser privacy.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2.5">
                              <span className="text-[10px] bg-neutral-850 border border-neutral-700/60 text-purple-300 px-2 py-0.5 rounded-md font-mono">🎙️ Real-time Voice</span>
                              <span className="text-[10px] bg-neutral-850 border border-neutral-700/60 text-pink-300 px-2 py-0.5 rounded-md font-mono">🎓 Study Hub</span>
                              <span className="text-[10px] bg-neutral-850 border border-neutral-700/60 text-emerald-300 px-2 py-0.5 rounded-md font-mono">👁️ Vision Share</span>
                              <span className="text-[10px] bg-neutral-850 border border-neutral-700/60 text-amber-300 px-2 py-0.5 rounded-md font-mono">🔒 100% Local Privacy</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                          <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-neutral-200 transition-all cursor-pointer shadow-lg text-center flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare size={14} className="text-purple-600" />
                            <span>Talk to Mahi AI</span>
                          </button>
                          <button
                            onClick={() => {
                              navigateTo('about');
                              setSearchQuery('');
                            }}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-900/60 border border-purple-500/40 hover:bg-purple-800/80 text-white transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                          >
                            <Info size={14} className="text-purple-300" />
                            <span>About Companion</span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Matched Help Center Articles */}
                    {searchResults.help.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-400 border-b border-neutral-800 pb-2">
                          Help Guides ({searchResults.help.length})
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {searchResults.help.map(art => (
                            <div
                              key={art.id}
                              onClick={() => {
                                setActiveHelpArticle(art);
                                navigateTo('help');
                                setSearchQuery('');
                              }}
                              className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
                            >
                              <div>
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 font-mono bg-neutral-800 px-2 py-0.5 rounded-full">{art.category}</span>
                                <h4 className="text-sm font-semibold text-white mt-2 group-hover:text-purple-300 transition-colors">{art.title}</h4>
                                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{art.summary}</p>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500">
                                <span>Guide Article</span>
                                <span className="group-hover:translate-x-1 transition-transform" style={{ color: theme.primary }}>Read &rarr;</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matched Tutorials */}
                    {searchResults.tutorials.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-400 border-b border-neutral-800 pb-2">
                          Video & Step Tutorials ({searchResults.tutorials.length})
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {searchResults.tutorials.map(tut => (
                            <div
                              key={tut.id}
                              onClick={() => {
                                setActiveTutorial(tut);
                                navigateTo('tutorials');
                                setSearchQuery('');
                              }}
                              className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-[9px] uppercase tracking-wider font-semibold font-mono bg-neutral-800 px-2 py-0.5 rounded-full" style={{ color: theme.secondary }}>{tut.difficulty}</span>
                                  <span className="text-[10px] text-neutral-500 font-mono">{tut.duration} read</span>
                                </div>
                                <h4 className="text-sm font-semibold text-white mt-2 group-hover:text-pink-300 transition-colors">{tut.title}</h4>
                                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{tut.description}</p>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500">
                                <span className="text-neutral-400 font-bold">{tut.steps.length} detailed steps</span>
                                <span className="group-hover:translate-x-1 transition-transform" style={{ color: theme.secondary }}>Start &rarr;</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matched FAQs */}
                    {searchResults.faqs.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-400 border-b border-neutral-800 pb-2">
                          Frequently Asked Questions ({searchResults.faqs.length})
                        </h3>
                        <div className="flex flex-col gap-2">
                          {searchResults.faqs.map(item => (
                            <div
                              key={item.id}
                              className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden transition-all duration-300"
                            >
                              <button
                                onClick={() => toggleFaq(item.id)}
                                className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-neutral-850/50 cursor-pointer"
                              >
                                <span className="text-sm font-semibold text-white leading-relaxed">{item.question}</span>
                                <ChevronDown 
                                  size={16} 
                                  className={`text-neutral-500 shrink-0 transition-transform duration-300 ${faqExpanded[item.id] ? 'rotate-180' : ''}`} 
                                />
                              </button>
                              <AnimatePresence initial={false}>
                                {faqExpanded[item.id] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <div className="p-4 pt-0 border-t border-neutral-850 text-xs text-neutral-350 leading-relaxed bg-neutral-950/40">
                                      {item.answer}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              // SUB-PAGES ROUTING
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full"
              >
                {/* 1. PORTAL HOME / DASHBOARD */}
                {currentView === 'home' && (
                  <div className="flex flex-col gap-8">
                    {/* Hero Banner Grid */}
                    <div className="relative overflow-hidden bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
                      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-neutral-950/50 to-transparent pointer-events-none" />
                      <div className="relative z-10 max-w-xl">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 uppercase tracking-widest font-mono font-bold mb-3">
                          <Sparkles size={10} className="text-purple-400" />
                          System Version 1.1 Support
                        </div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tight text-white uppercase leading-tight">
                          How can we support your experience today?
                        </h2>
                        <p className="text-xs md:text-sm text-neutral-400 mt-2 leading-relaxed">
                          Welcome to Mahi AI\'s official Help & Legal portal. Browse searchable guides, step-by-step videos, 25+ direct developer FAQs, and detailed safety policies to keep your API integrations secure.
                        </p>
                      </div>

                      <div className="shrink-0 flex gap-2 relative z-10 w-full md:w-auto">
                        <button
                          onClick={() => navigateTo('tutorials')}
                          className="flex-1 md:flex-none px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-neutral-200 transition-all cursor-pointer shadow-xl text-center"
                        >
                          Tutorial Cards
                        </button>
                        <button
                          onClick={() => navigateTo('faq')}
                          className="flex-1 md:flex-none px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-neutral-800 border border-neutral-700 hover:bg-neutral-750 text-white transition-all cursor-pointer text-center shadow-xl"
                        >
                          FAQ list
                        </button>
                      </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-900 pb-2">
                        Help & Informational Sub-Pages
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { id: 'features', title: 'Platform Features', desc: 'Real-time voice streaming, 19 emotion poses, vision OCR, and Study Hub.', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                          { id: 'how-to-use', title: 'How to Use Guides', desc: 'Interactive step-by-step guides for students, developers, and first-time users.', icon: Compass, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
                          { id: 'about', title: 'About Mahi AI', desc: 'The companion story, vision, creator MPS Thakur details, and future roadmap.', icon: Info, color: 'text-purple-400', bg: 'bg-purple-500/5' },
                          { id: 'help', title: 'Help Center', desc: 'Searchable technical guides, mic resets, and API connection troubleshooting.', icon: HelpCircle, color: 'text-pink-400', bg: 'bg-pink-500/5' },
                          { id: 'tutorials', title: 'Tutorial Pages', desc: 'Step-by-step cards on obtaining keys, mobile setup, and audio calibrations.', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                          { id: 'faq', title: 'FAQ Database', desc: 'More than 25 questions answering local safety, features, and model costs.', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                          { id: 'release-notes', title: 'Release Notes', desc: 'System history logs, Study Hub updates, and planned targets.', icon: History, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
                          { id: 'ai-companion-guide', title: 'AI Companion Guide', desc: 'Comprehensive educational guide on neural voice synthesis, privacy, and responsible AI.', icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-500/5' },
                          { id: 'contact', title: 'Contact Developer', desc: 'Functional feedback form, active email support, and social links.', icon: Phone, color: 'text-rose-400', bg: 'bg-rose-500/5' }
                        ].map(card => {
                          const IconComp = card.icon;
                          return (
                            <motion.div
                              key={card.id}
                              whileHover={{ y: -4, borderColor: theme.primary }}
                              onClick={() => navigateTo(card.id as any)}
                              className="bg-neutral-900/50 border border-neutral-800/80 p-5 rounded-3xl hover:border-neutral-700 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                            >
                              <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl ${card.bg} border border-white/5`}>
                                  <IconComp size={20} className={card.color} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-white group-hover:text-white transition-colors">{card.title}</h4>
                                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed line-clamp-3">{card.desc}</p>
                                </div>
                              </div>
                              <div className="mt-4 flex items-center justify-end text-[10px] font-bold text-neutral-500 group-hover:text-white uppercase tracking-wider font-mono gap-1 transition-colors">
                                <span>Explore Page</span>
                                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legal Policies Grid */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-900 pb-2">
                        Legal Agreements & Transparency
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { id: 'privacy', title: 'Privacy Policy', desc: 'Local storage, Gemini streams, zero cookies trackers policy.', icon: Shield, color: 'text-red-400', border: 'hover:border-red-500/30' },
                          { id: 'terms', title: 'Terms of Service', desc: 'User liabilities, API charges, forbidden activities list.', icon: FileText, color: 'text-teal-400', border: 'hover:border-teal-500/30' },
                          { id: 'cookies', title: 'Cookies Policy', desc: 'Local localStorage variables description and deletion guides.', icon: Cookie, color: 'text-amber-500', border: 'hover:border-amber-500/30' },
                          { id: 'disclaimer', title: 'Legal Disclaimer', desc: 'Independent app statement. Not associated with Google.', icon: AlertTriangle, color: 'text-yellow-400', border: 'hover:border-yellow-500/30' }
                        ].map(card => {
                          const IconComp = card.icon;
                          return (
                            <motion.div
                              key={card.id}
                              whileHover={{ y: -3 }}
                              onClick={() => navigateTo(card.id as any)}
                              className={`bg-neutral-900/30 border border-neutral-850 p-4 rounded-2xl transition-all cursor-pointer flex flex-col justify-between hover:bg-neutral-900 group ${card.border}`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <IconComp size={16} className={card.color} />
                                  <h4 className="font-bold text-xs text-white uppercase tracking-wider font-sans">{card.title}</h4>
                                </div>
                                <p className="text-xs text-neutral-400 mt-2 leading-relaxed line-clamp-3">{card.desc}</p>
                              </div>
                              <div className="mt-3 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
                                <span>Compliance</span>
                                <span className="group-hover:translate-x-1 transition-transform" style={{ color: theme.primary }}>Open &rarr;</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Trending Articles Section */}
                    <div className="grid md:grid-cols-5 gap-6">
                      <div className="md:col-span-3 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">
                            Trending Support Topics
                          </h3>
                          <button onClick={() => navigateTo('help')} className="text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider font-bold">See All &rarr;</button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {HELP_ARTICLES.slice(0, 3).map(art => (
                            <div
                              key={art.id}
                              onClick={() => {
                                setActiveHelpArticle(art);
                                navigateTo('help');
                              }}
                              className="bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-850 p-3.5 rounded-2xl transition-all cursor-pointer flex justify-between items-center group"
                            >
                              <div className="max-w-[85%]">
                                <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{art.category}</span>
                                <h4 className="text-xs font-bold text-white mt-1.5 truncate group-hover:text-white transition-colors">{art.title}</h4>
                                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{art.summary}</p>
                              </div>
                              <ChevronRight size={14} className="text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">
                            Frequently Asked Questions
                          </h3>
                          <button onClick={() => navigateTo('faq')} className="text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider font-bold">Browse 26 &rarr;</button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {FAQS.slice(0, 3).map(faq => (
                            <div
                              key={faq.id}
                              onClick={() => {
                                navigateTo('faq');
                                setFaqExpanded({ [faq.id]: true });
                              }}
                              className="bg-neutral-900/20 hover:bg-neutral-900/60 border border-neutral-850/60 p-3 rounded-xl transition-all cursor-pointer flex justify-between items-center group"
                            >
                              <p className="text-xs font-medium text-neutral-350 truncate group-hover:text-white">{faq.question}</p>
                              <ChevronRight size={12} className="text-neutral-600 group-hover:text-white shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FEATURES BREAKDOWN PAGE */}
                {currentView === 'features' && (
                  <div className="flex flex-col gap-8">
                    {/* Hero Header */}
                    <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl relative overflow-hidden flex flex-col gap-4">
                      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-mono font-bold">
                        <Sparkles size={14} />
                        <span>PLATFORM CAPABILITIES & ARCHITECTURE</span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
                        Mahi AI Platform Features
                      </h2>
                      <p className="text-xs md:text-sm text-neutral-300 leading-relaxed max-w-3xl">
                        Mahi AI combines low-latency neural voice synthesis, real-time emotion mapping with 19 anime poses, multimodal computer vision, 24/7 Study Hub, and 100% browser-local privacy.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">🎙️ Sub-Second Voice</span>
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">✨ 19 Anime Poses</span>
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">👁️ Live Vision OCR</span>
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">🎓 24/7 Study Hub</span>
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">🔒 100% Local Privacy</span>
                      </div>
                    </div>

                    {/* Features Detail Cards */}
                    <div className="flex flex-col gap-6">
                      {FEATURES_DATA.map((feat, idx) => (
                        <div
                          key={feat.id}
                          className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col gap-5 hover:border-neutral-700 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                                  {feat.category}
                                </span>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                  {feat.badge}
                                </span>
                              </div>
                              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <span>{feat.title}</span>
                              </h3>
                              <p className="text-xs text-neutral-400 mt-1 italic">{feat.tagline}</p>
                            </div>
                          </div>

                          <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">
                            {feat.description}
                          </p>

                          {/* Highlights Checklist */}
                          <div className="bg-neutral-950/60 p-4 rounded-2xl border border-neutral-850 flex flex-col gap-2.5">
                            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider">
                              Key Capabilities & User Value
                            </span>
                            <div className="grid sm:grid-cols-2 gap-2.5">
                              {feat.highlights.map((item, hIdx) => (
                                <div key={hIdx} className="flex items-start gap-2 text-xs text-neutral-300">
                                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Technical Pipeline */}
                          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 bg-neutral-950/30 px-3.5 py-2.5 rounded-xl border border-neutral-850/60">
                            <Cpu size={14} className="text-cyan-400 shrink-0" />
                            <span className="text-neutral-500 font-bold uppercase tracking-wider shrink-0 text-[10px]">Architecture:</span>
                            <span className="truncate">{feat.techDetails}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HOW TO USE STEP-BY-STEP GUIDES PAGE */}
                {currentView === 'how-to-use' && (
                  <div className="flex flex-col gap-8">
                    {/* Hero Header */}
                    <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl relative overflow-hidden flex flex-col gap-4">
                      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono font-bold">
                        <Compass size={14} />
                        <span>USER TUTORIALS & PLAYBOOKS</span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
                        How to Use Mahi AI
                      </h2>
                      <p className="text-xs md:text-sm text-neutral-300 leading-relaxed max-w-3xl">
                        Comprehensive walkthroughs tailored for first-time users, students preparing for exams, music enthusiasts, and developers debugging code with image vision.
                      </p>
                    </div>

                    {/* Guides Catalog */}
                    <div className="flex flex-col gap-8">
                      {HOW_TO_USE_DATA.map((guide) => (
                        <div
                          key={guide.id}
                          className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6"
                        >
                          {/* Guide Heading */}
                          <div className="border-b border-neutral-800 pb-4">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                                Target: {guide.audience}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                                <Clock size={11} className="text-neutral-500" />
                                {guide.duration}
                              </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{guide.title}</h3>
                            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{guide.overview}</p>
                          </div>

                          {/* Prerequisites */}
                          {guide.prerequisites.length > 0 && (
                            <div className="bg-neutral-950/40 p-4 rounded-2xl border border-neutral-850">
                              <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider block mb-2">
                                📋 Prerequisites & Requirements
                              </span>
                              <ul className="flex flex-col gap-1.5 text-xs text-neutral-300">
                                {guide.prerequisites.map((req, rIdx) => (
                                  <li key={rIdx} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Sequential Steps */}
                          <div className="flex flex-col gap-3">
                            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider">
                              Step-by-Step Instructions
                            </span>
                            <div className="flex flex-col gap-3">
                              {guide.steps.map((step) => (
                                <div
                                  key={step.stepNumber}
                                  className="p-4 bg-neutral-950 rounded-2xl border border-neutral-850 flex gap-4 items-start"
                                >
                                  <span
                                    className="w-7 h-7 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-md text-black"
                                    style={{ backgroundColor: theme.primary }}
                                  >
                                    {step.stepNumber}
                                  </span>
                                  <div className="flex flex-col gap-1 flex-1">
                                    <h4 className="text-xs font-bold text-white tracking-wide">{step.heading}</h4>
                                    <p className="text-xs text-neutral-300 leading-relaxed">{step.description}</p>
                                    {step.tip && (
                                      <div className="mt-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                        <span>💡 Pro Tip:</span>
                                        <span>{step.tip}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Pro Tips Section */}
                          {guide.proTips.length > 0 && (
                            <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl flex flex-col gap-2">
                              <span className="text-[10px] uppercase font-mono font-bold text-purple-300 tracking-wider">
                                ✨ Advanced Usage Tips
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {guide.proTips.map((tip, tIdx) => (
                                  <div key={tIdx} className="text-xs text-purple-200/90 flex items-start gap-2">
                                    <span className="text-purple-400 shrink-0 font-bold">•</span>
                                    <span>{tip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. PRIVACY POLICY */}
                {currentView === 'privacy' && (
                  <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl flex flex-col gap-6">
                    <div className="border-b border-neutral-800 pb-6">
                      <div className="flex items-center gap-2 mb-2 text-xs text-red-400 font-mono">
                        <Shield size={14} />
                        <span>GDPR & CCPA COMPLIANT</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{PRIVACY_POLICY.title}</h2>
                      <p className="text-xs text-neutral-500 mt-1">Last Updated: {PRIVACY_POLICY.lastUpdated}</p>
                    </div>

                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">{PRIVACY_POLICY.introduction}</p>

                    <div className="flex flex-col gap-6 pt-2">
                      {PRIVACY_POLICY.sections.map((sec, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-1.5">{sec.heading}</h3>
                          <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line">{sec.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. TERMS OF SERVICE */}
                {currentView === 'terms' && (
                  <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl flex flex-col gap-6">
                    <div className="border-b border-neutral-800 pb-6">
                      <div className="flex items-center gap-2 mb-2 text-xs text-teal-400 font-mono">
                        <FileText size={14} />
                        <span>LEGAL USER AGREEMENT</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{TERMS_OF_SERVICE.title}</h2>
                      <p className="text-xs text-neutral-500 mt-1">Last Updated: {TERMS_OF_SERVICE.lastUpdated}</p>
                    </div>

                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">{TERMS_OF_SERVICE.introduction}</p>

                    <div className="flex flex-col gap-6 pt-2">
                      {TERMS_OF_SERVICE.sections.map((sec, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-1.5">{sec.heading}</h3>
                          <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line">{sec.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. ABOUT MAHI AI */}
                {currentView === 'about' && (
                  <div className="flex flex-col gap-8">
                    {/* Hero */}
                    <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl relative overflow-hidden flex flex-col gap-4">
                      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-purple-500/5 to-transparent pointer-events-none" />
                      <div>
                        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">{ABOUT_MAHI.title}</h2>
                        <p className="text-xs text-purple-400 uppercase tracking-widest font-mono font-bold mt-1">{ABOUT_MAHI.subtitle}</p>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">{ABOUT_MAHI.story}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-4 mt-2">
                        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850">
                          <h4 className="text-xs uppercase font-mono font-bold text-white tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            Our Mission
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">{ABOUT_MAHI.mission}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850">
                          <h4 className="text-xs uppercase font-mono font-bold text-white tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                            Our Vision
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">{ABOUT_MAHI.vision}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features Breakdown */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">Why Mahi AI was built</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">{ABOUT_MAHI.whyBuilt}</p>
                      
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        {ABOUT_MAHI.features.map((feat, idx) => (
                          <div key={idx} className="p-4 bg-neutral-900 border border-neutral-850 rounded-2xl hover:border-neutral-800 transition-colors">
                            <div className="flex items-center gap-1.5 text-xs text-white font-bold uppercase tracking-wider font-sans">
                              <Check size={14} className="text-emerald-400 shrink-0" />
                              <span>{feat.name}</span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">{feat.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Roadmap Timeline */}
                    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col gap-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">Future Roadmap & Milestones</h3>
                      <div className="flex flex-col gap-4 relative pl-4 border-l border-neutral-800">
                        {ABOUT_MAHI.roadmap.map((point, idx) => (
                          <div key={idx} className="relative">
                            {/* Dot node */}
                            <span 
                              className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full ring-4 ring-neutral-900 ${
                                point.status === 'Completed' ? 'bg-emerald-400' :
                                point.status === 'In Progress' ? 'bg-purple-400' : 'bg-neutral-600'
                              }`} 
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{point.phase}</h4>
                              <span 
                                className={`text-[9px] uppercase tracking-wider font-bold font-mono px-2 py-0.5 rounded-full ${
                                  point.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                                  point.status === 'In Progress' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 animate-pulse' :
                                  'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {point.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{point.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Developer Credits Card */}
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-black text-white shadow-lg">
                          MT
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Created by {ABOUT_MAHI.developer}</h4>
                          <p className="text-xs text-neutral-400">Senior AI Systems Interface Developer & UX Designer</p>
                        </div>
                      </div>
                      <a
                        href="https://youtube.com/@mpsthakur07?si=9Usj--LVcM9tFQDM"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-750 hover:bg-neutral-900 rounded-xl text-xs font-bold text-neutral-300 hover:text-white uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Youtube size={14} className="text-red-500" />
                        <span>YouTube channel</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* 5. CONTACT PAGE */}
                {currentView === 'contact' && (
                  <div className="grid md:grid-cols-5 gap-6">
                    {/* Left Column info */}
                    <div className="md:col-span-2 flex flex-col gap-4">
                      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl flex flex-col gap-4 shadow-lg">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">Contact Details</h3>
                        
                        <div className="flex items-start gap-3 mt-1">
                          <Mail size={16} className="text-purple-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Official Support Email</span>
                            <p className="text-xs font-mono font-bold text-white selection:bg-purple-500 mt-0.5">{SUPPORT_EMAIL}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock size={16} className="text-pink-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Expected Response Time</span>
                            <p className="text-xs font-bold text-white mt-0.5">Usually under 24 hours</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <HelpCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Helpful Shortcuts</span>
                            <div className="mt-1 flex flex-col gap-1 align-start text-xs">
                              <button 
                                onClick={() => navigateTo('faq')} 
                                className="text-left text-neutral-400 hover:text-white underline cursor-pointer transition-all"
                              >
                                Check our 26 FAQs
                              </button>
                              <button 
                                onClick={() => navigateTo('help')} 
                                className="text-left text-neutral-400 hover:text-white underline cursor-pointer transition-all"
                              >
                                View troubleshooting guides
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-900/40 border border-neutral-850 p-5 rounded-3xl flex flex-col gap-3">
                        <h4 className="text-xs uppercase font-mono font-bold text-neutral-500">Developer & Support Channels</h4>
                        <div className="flex gap-2">
                          <a 
                            href="https://www.instagram.com/heymahiai?igsh=cXpzcDNxMXYzY2Zt" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-neutral-900 border border-pink-500/30 hover:border-pink-500/60 hover:bg-neutral-850 cursor-pointer text-pink-400 transition-colors"
                            title="Official Instagram Feedback Profile @heymahiai"
                          >
                            <Instagram size={16} />
                          </a>
                          <a 
                            href="https://youtube.com/@mpsthakur07?si=9Usj--LVcM9tFQDM" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 cursor-pointer text-red-400 transition-colors"
                            title="YouTube Channel"
                          >
                            <Youtube size={16} />
                          </a>
                          <div 
                            className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 cursor-not-allowed text-neutral-600"
                            title="GitHub Profile (Placeholder)"
                          >
                            <Github size={16} />
                          </div>
                          <div 
                            className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 cursor-not-allowed text-neutral-600"
                            title="LinkedIn (Placeholder)"
                          >
                            <Linkedin size={16} />
                          </div>
                          <div 
                            className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 cursor-not-allowed text-neutral-600"
                            title="Twitter / X (Placeholder)"
                          >
                            <Twitter size={16} />
                          </div>
                        </div>
                        <p className="text-[10px] text-neutral-500">YouTube is our primary active social channel. Search "mps thakur 07" to watch updates.</p>
                      </div>
                    </div>

                    {/* Right Column Contact Form */}
                    <div className="md:col-span-3">
                      <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-3xl shadow-xl">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-3 mb-5">
                          Inquiry Contact Form
                        </h3>

                        {contactSubmitted ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 flex flex-col items-center gap-4 text-center"
                          >
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl">
                              <Check size={24} />
                            </div>
                            <div>
                              <h4 className="text-md font-bold text-white uppercase tracking-wider">Inquiry Sent Successfully</h4>
                              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                                Thank you for your message. Our developer MPS Thakur will review your technical inquiry and reply to your email within 24 hours.
                              </p>
                            </div>
                            <button
                              onClick={() => setContactSubmitted(false)}
                              className="mt-2 px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl transition-all cursor-pointer"
                            >
                              Send Another Inquiry
                            </button>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                            <div>
                              <label className="block text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Your Email Address</label>
                              <input
                                type="email"
                                required
                                value={contactForm.email}
                                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="name@example.com"
                                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 px-4 py-3 rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Subject / Area</label>
                              <input
                                type="text"
                                required
                                value={contactForm.subject}
                                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                                placeholder="e.g. Invalid Gemini Key, Microphone reset, Ludo bug"
                                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 px-4 py-3 rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Message Body</label>
                              <textarea
                                required
                                rows={5}
                                value={contactForm.message}
                                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Explain your inquiry in detail..."
                                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 px-4 py-3 rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-all resize-none leading-relaxed"
                              />
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              type="submit"
                              disabled={submitting}
                              className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl disabled:opacity-50"
                              style={{ backgroundColor: theme.primary }}
                            >
                              {submitting ? (
                                <span>Submitting...</span>
                              ) : (
                                <>
                                  <Send size={12} />
                                  <span>Submit Technical Inquiry</span>
                                </>
                              )}
                            </motion.button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. HELP CENTER */}
                {currentView === 'help' && (
                  <div className="flex flex-col gap-6">
                    {activeHelpArticle ? (
                      /* Active Detailed Article View */
                      <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl flex flex-col gap-6">
                        <div className="border-b border-neutral-850 pb-5">
                          <button
                            onClick={() => setActiveHelpArticle(null)}
                            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-3 cursor-pointer"
                          >
                            <ArrowLeft size={12} />
                            <span>Back to Help List</span>
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase tracking-wider font-semibold font-mono bg-neutral-850 px-2 py-0.5 rounded-full text-purple-400 border border-neutral-800">{activeHelpArticle.category}</span>
                          </div>
                          
                          <h2 className="text-xl md:text-2xl font-bold text-white mt-2 leading-tight">{activeHelpArticle.title}</h2>
                          <p className="text-xs text-neutral-400 mt-1 leading-relaxed italic">{activeHelpArticle.summary}</p>
                        </div>

                        {/* Article Content Rendered beautifully with custom styles */}
                        <div className="text-xs md:text-sm text-neutral-350 leading-relaxed font-sans flex flex-col gap-4 whitespace-pre-line help-article-content">
                          {/* Parse simple markdown sections manually or display clean */}
                          {activeHelpArticle.content.split('\n\n').map((paragraph, index) => {
                            if (paragraph.startsWith('###')) {
                              return <h3 key={index} className="text-sm font-bold text-white mt-3 border-b border-neutral-850 pb-1 uppercase tracking-wider font-mono">{paragraph.replace('###', '').trim()}</h3>;
                            }
                            if (paragraph.startsWith('*') || paragraph.startsWith('•')) {
                              return (
                                <ul key={index} className="list-disc pl-5 flex flex-col gap-1 text-neutral-400 mt-1">
                                  {paragraph.split('\n').map((li, liIdx) => (
                                    <li key={liIdx}>{li.replace(/^[\*•]\s*/, '').trim()}</li>
                                  ))}
                                </ul>
                              );
                            }
                            if (/^\d+\./.test(paragraph)) {
                              return (
                                <ol key={index} className="list-decimal pl-5 flex flex-col gap-1.5 text-neutral-400 mt-1">
                                  {paragraph.split('\n').map((li, liIdx) => (
                                    <li key={liIdx}>{li.replace(/^\d+\.\s*/, '').trim()}</li>
                                  ))}
                                </ol>
                              );
                            }
                            return <p key={index} className="leading-relaxed">{paragraph}</p>;
                          })}
                        </div>

                        <div className="mt-6 pt-5 border-t border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex flex-wrap gap-1.5">
                            {activeHelpArticle.tags.map((tag, idx) => (
                              <span key={idx} className="text-[9px] font-mono font-bold text-neutral-400 bg-neutral-850 border border-neutral-800 px-2 py-0.5 rounded">#{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <span>Was this article helpful?</span>
                            <button 
                              onClick={() => alert("Thank you for your rating!")} 
                              className="px-2.5 py-1 rounded bg-neutral-850 hover:bg-neutral-800 text-white cursor-pointer transition-colors border border-neutral-800"
                            >
                              Yes 👍
                            </button>
                            <button 
                              onClick={() => navigateTo('contact')} 
                              className="px-2.5 py-1 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors border border-neutral-800"
                            >
                              No 👎
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Main Searchable Help Directory */
                      <div className="grid md:grid-cols-4 gap-6">
                        {/* Categories Sidebar */}
                        <div className="flex md:flex-col flex-wrap gap-1.5 shrink-0">
                          <span className="w-full text-[10px] uppercase font-bold tracking-widest text-neutral-500 font-mono pl-2 hidden md:block mb-1">Article Categories</span>
                          {helpCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedHelpCategory(cat)}
                              className={`px-3 py-2 text-xs font-medium rounded-xl text-left transition-all cursor-pointer border ${
                                selectedHelpCategory === cat 
                                  ? 'bg-neutral-900 text-white font-bold' 
                                  : 'bg-neutral-950 text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900/50'
                              }`}
                              style={{ borderColor: selectedHelpCategory === cat ? theme.primary : 'transparent' }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Articles Grid */}
                        <div className="md:col-span-3 flex flex-col gap-4">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-900 pb-2 flex items-center justify-between">
                            <span>Articles list ({filteredHelpArticles.length})</span>
                            {selectedHelpCategory !== 'All' && <span className="text-[10px] text-neutral-400 lowercase italic bg-neutral-900 px-2 py-0.5 rounded">Filtering by {selectedHelpCategory}</span>}
                          </h3>

                          <div className="grid sm:grid-cols-2 gap-3.5">
                            {filteredHelpArticles.map(art => (
                              <div
                                key={art.id}
                                onClick={() => setActiveHelpArticle(art)}
                                className="bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-800 p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group h-40"
                              >
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider font-semibold font-mono text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/10">{art.category}</span>
                                  <h4 className="text-xs font-bold text-white mt-3 leading-snug group-hover:text-purple-300 transition-colors line-clamp-1">{art.title}</h4>
                                  <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed line-clamp-3">{art.summary}</p>
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono text-right mt-2 group-hover:text-white transition-colors">
                                  <span>View Article &rarr;</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Troubleshooting Note */}
                          <div className="mt-4 p-4 rounded-2xl bg-neutral-900/30 border border-neutral-850 flex items-start gap-3">
                            <AlertCircle size={16} className="text-purple-400 mt-0.5 shrink-0" />
                            <div className="text-xs text-neutral-450 leading-relaxed">
                              <span className="font-bold text-white">Need immediate resolution?</span> Check if your query is answered in the tutorials or search box above. If a bug persists, reach out directly via our Contact form.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. TUTORIAL PAGE */}
                {currentView === 'tutorials' && (
                  <div className="flex flex-col gap-8">
                    {activeTutorial ? (
                      /* Active Detailed Step-by-Step tutorial card */
                      <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl flex flex-col gap-6">
                        <div className="border-b border-neutral-850 pb-5">
                          <button
                            onClick={() => setActiveTutorial(null)}
                            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-3 cursor-pointer"
                          >
                            <ArrowLeft size={12} />
                            <span>Back to Tutorials List</span>
                          </button>
                          
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] uppercase tracking-wider font-bold font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20">{activeTutorial.difficulty}</span>
                              <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                                <Clock size={10} />
                                {activeTutorial.duration} setup
                              </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 font-mono">Step Checklist</span>
                          </div>
                          
                          <h2 className="text-xl md:text-2xl font-bold text-white mt-2 leading-tight">{activeTutorial.title}</h2>
                          <p className="text-xs text-neutral-400 mt-1">{activeTutorial.description}</p>
                        </div>

                        {/* Step Steps Cards Grid */}
                        <div className="flex flex-col gap-3">
                          {activeTutorial.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4 p-4 bg-neutral-950 rounded-2xl border border-neutral-850 items-start hover:border-neutral-800 transition-colors">
                              <span 
                                className="w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-md text-black"
                                style={{ backgroundColor: theme.primary }}
                              >
                                {idx + 1}
                              </span>
                              <p className="text-xs text-neutral-300 leading-relaxed pt-0.5">{step}</p>
                            </div>
                          ))}
                        </div>

                        {/* YouTube Video Placeholder */}
                        <div className="flex flex-col gap-2 mt-4">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 font-mono">Reference Demonstration Video</span>
                          <div className="relative aspect-video rounded-3xl bg-black border border-neutral-850 overflow-hidden flex flex-col items-center justify-center text-center p-6 group">
                            {/* Visual background vector simulator */}
                            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.25)_0%,transparent_70%)]" />
                            <div className="absolute inset-0 bg-neutral-950/40 z-0" />
                            
                            <motion.a
                              href="https://youtube.com/@mpsthakur07?si=9Usj--LVcM9tFQDM"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="relative z-10 w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] transition-all cursor-pointer group-hover:scale-110"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white fill-current ml-1">
                                <polygon points="6 3 20 12 6 21 6 3" />
                              </svg>
                            </motion.a>
                            
                            <div className="relative z-10 mt-4 max-w-sm">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">How to Setup Gemini API & Mahi Voice App</h4>
                              <p className="text-[10px] text-neutral-450 mt-1 leading-relaxed">
                                Click to redirect to our official channel <span className="text-red-400 font-bold">mps thakur 07</span> for detailed visual instructions and setup videos.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Main Tutorials Cards Catalog */
                      <div className="flex flex-col gap-5">
                        <div className="border-b border-neutral-900 pb-2 flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 font-mono">Onboarding Tutorial cards</h3>
                          <span className="text-[10px] text-neutral-400 font-mono">{TUTORIALS.length} guides available</span>
                        </div>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {TUTORIALS.map(tut => (
                            <motion.div
                              key={tut.id}
                              whileHover={{ y: -4, borderColor: theme.primary }}
                              onClick={() => setActiveTutorial(tut)}
                              className="bg-neutral-900 border border-neutral-850 p-5 rounded-3xl hover:border-neutral-800 transition-all cursor-pointer flex flex-col justify-between group shadow-xl"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] uppercase tracking-wider font-bold font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">{tut.difficulty}</span>
                                  <span className="text-[10px] text-neutral-500 font-mono">{tut.duration} read</span>
                                </div>
                                <h4 className="text-sm font-bold text-white mt-3 group-hover:text-pink-300 transition-colors leading-snug">{tut.title}</h4>
                                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed line-clamp-3">{tut.description}</p>
                              </div>

                              <div className="mt-5 pt-3 border-t border-neutral-850 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                                <span>{tut.steps.length} Steps Card</span>
                                <span className="group-hover:translate-x-1 transition-transform" style={{ color: theme.primary }}>Start Steps &rarr;</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* YouTube Embed Placeholder Card */}
                        <div className="mt-4 p-6 bg-neutral-900 border border-neutral-800 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl">
                          <div className="max-w-md">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                              <Youtube size={16} className="text-red-500 shrink-0" />
                              YouTube Video Reference
                            </h4>
                            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                              Watch the complete step-by-step setup guide on YouTube. It demonstrates generating credentials on AI Studio and connecting on both mobile and desktop.
                            </p>
                          </div>
                          <a
                            href="https://youtube.com/@mpsthakur07?si=9Usj--LVcM9tFQDM"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                          >
                            <ExternalLink size={13} />
                            <span>Watch video tutorial</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 8. FAQ PAGE */}
                {currentView === 'faq' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Explore 26 structured FAQs covering APIs, security, billing, and errors.</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {['All', 'General', 'Security', 'API Setup', 'Voice Support', 'Features'].map(cat => {
                          const isSel = (cat === 'All' && !faqCategoryFilter) || (faqCategoryFilter === cat);
                          return (
                            <button
                              key={cat}
                              onClick={() => setFaqCategoryFilter(cat === 'All' ? undefined : cat)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                                isSel 
                                  ? 'bg-white text-black font-bold' 
                                  : 'bg-neutral-850 border-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {FAQS.filter(f => !faqCategoryFilter || f.category === faqCategoryFilter).map(item => (
                        <div
                          key={item.id}
                          className="bg-neutral-900 border border-neutral-850/80 rounded-2xl overflow-hidden transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleFaq(item.id)}
                            className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-neutral-850/50 cursor-pointer"
                          >
                            <span className="text-xs md:text-sm font-semibold text-white leading-relaxed">{item.question}</span>
                            <ChevronDown 
                              size={16} 
                              className={`text-neutral-500 shrink-0 transition-transform duration-300 ${faqExpanded[item.id] ? 'rotate-180' : ''}`} 
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {faqExpanded[item.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-4 pt-0 border-t border-neutral-850 text-xs text-neutral-350 leading-relaxed bg-neutral-950/40">
                                  {item.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. DISCLAIMER */}
                {currentView === 'disclaimer' && (
                  <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl flex flex-col gap-6">
                    <div className="border-b border-neutral-800 pb-5">
                      <div className="flex items-center gap-2 mb-2 text-xs text-yellow-400 font-mono font-bold">
                        <AlertTriangle size={14} />
                        <span>IMPORTANT POLICY NOTICE</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{DISCLAIMER.title}</h2>
                      <p className="text-xs text-neutral-500 mt-1">Last Updated: {DISCLAIMER.lastUpdated}</p>
                    </div>

                    <div className="flex flex-col gap-4 text-xs md:text-sm text-neutral-350 leading-relaxed font-sans">
                      {DISCLAIMER.paragraphs.map((p, idx) => (
                        <p key={idx} className="whitespace-pre-line bg-neutral-950/30 p-4 rounded-2xl border border-neutral-850">{p}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. COOKIES POLICY */}
                {currentView === 'cookies' && (
                  <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl flex flex-col gap-6">
                    <div className="border-b border-neutral-800 pb-5">
                      <div className="flex items-center gap-2 mb-2 text-xs text-amber-500 font-mono">
                        <Cookie size={14} />
                        <span>LOCAL PREFERENCES DATA</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{COOKIES_POLICY.title}</h2>
                      <p className="text-xs text-neutral-500 mt-1">Last Updated: {COOKIES_POLICY.lastUpdated}</p>
                    </div>

                    <p className="text-xs md:text-sm text-neutral-350 leading-relaxed font-sans">{COOKIES_POLICY.introduction}</p>

                    <div className="flex flex-col gap-5 pt-2">
                      {COOKIES_POLICY.sections.map((sec, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <h3 className="text-sm font-bold text-white border-b border-neutral-850 pb-1.5">{sec.heading}</h3>
                          <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line">{sec.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 11. RELEASE NOTES */}
                {currentView === 'release-notes' && (
                  <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl">
                      <h2 className="text-lg font-bold text-white uppercase tracking-wider">System Release Notes</h2>
                      <p className="text-xs text-neutral-400 mt-0.5">Explore active version history log, features, and future goals for Mahi companion OS.</p>
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-col gap-6">
                      {RELEASE_NOTES.map((note, noteIdx) => (
                        <div key={noteIdx} className="bg-neutral-900 border border-neutral-850 p-6 rounded-3xl shadow-lg relative flex flex-col gap-4">
                          <div className="absolute top-6 right-6 text-xs text-neutral-500 font-mono">{note.date}</div>
                          
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/15">System Version</span>
                            <h3 className="text-md md:text-lg font-bold text-white mt-2 flex items-center gap-2">
                              {note.version}
                              <span className="text-xs font-medium text-neutral-450">&mdash; {note.title}</span>
                            </h3>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4 mt-2">
                            {/* Features */}
                            <div>
                              <h4 className="text-xs uppercase font-mono font-bold text-white tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-1.5 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                Features added
                              </h4>
                              <ul className="flex flex-col gap-1.5 text-xs text-neutral-400 list-inside pl-1 leading-relaxed">
                                {note.features.map((feat, idx) => (
                                  <li key={idx} className="flex gap-1.5 items-start">
                                    <span className="text-purple-400 shrink-0 select-none">&bull;</span>
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Improvements */}
                            <div>
                              <h4 className="text-xs uppercase font-mono font-bold text-white tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-1.5 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Improvements
                              </h4>
                              <ul className="flex flex-col gap-1.5 text-xs text-neutral-400 list-inside pl-1 leading-relaxed">
                                {note.improvements.map((imp, idx) => (
                                  <li key={idx} className="flex gap-1.5 items-start">
                                    <span className="text-emerald-400 shrink-0 select-none">&bull;</span>
                                    <span>{imp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Future target */}
                          {note.futurePlanned.length > 0 && (
                            <div className="bg-neutral-950/40 p-4 rounded-2xl border border-neutral-850">
                              <h4 className="text-xs uppercase font-mono font-bold text-pink-400 tracking-wider mb-2">Planned target roadmap</h4>
                              <div className="flex flex-wrap gap-2">
                                {note.futurePlanned.map((plan, idx) => (
                                  <span key={idx} className="text-[10px] font-bold text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-xl">
                                    🎯 {plan}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 12. AI COMPANION GUIDE - COMPREHENSIVE EDUCATIONAL RESOURCE */}
                {currentView === 'ai-companion-guide' && (
                  <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-10 rounded-3xl shadow-xl flex flex-col gap-8">
                    {/* Header */}
                    <div className="border-b border-neutral-800 pb-6 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs text-purple-400 font-mono font-bold">
                        <BookOpen size={15} />
                        <span>AUTHORITATIVE TECHNICAL GUIDE</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{AI_COMPANION_GUIDE.title}</h2>
                      <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-sans">{AI_COMPANION_GUIDE.subtitle}</p>
                      <div className="flex flex-wrap gap-4 text-[11px] text-neutral-500 font-mono pt-2">
                        <span>Published by {AI_COMPANION_GUIDE.author}</span>
                        <span>&bull;</span>
                        <span>Last Updated: {AI_COMPANION_GUIDE.lastUpdated}</span>
                        <span>&bull;</span>
                        <span>{AI_COMPANION_GUIDE.readTime}</span>
                      </div>
                    </div>

                    {/* Table of Contents */}
                    <div className="bg-neutral-950/60 border border-neutral-850 p-5 rounded-2xl">
                      <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <Layers size={13} />
                        Table of Contents
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        {AI_COMPANION_GUIDE.tableOfContents.map((item, idx) => (
                          <a 
                            key={idx} 
                            href={`#${item.id}`} 
                            className="flex items-center gap-2 text-neutral-400 hover:text-white hover:underline transition-colors p-1.5 rounded-lg hover:bg-neutral-900/60"
                          >
                            <span className="text-[10px] font-mono text-purple-400 font-bold">0{idx + 1}.</span>
                            <span className="truncate">{item.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Guide Sections */}
                    <div className="flex flex-col gap-10">
                      {AI_COMPANION_GUIDE.sections.map((section, idx) => (
                        <article key={idx} id={section.id} className="flex flex-col gap-4 border-b border-neutral-850 pb-8 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20 shrink-0">
                              0{idx + 1}
                            </span>
                            <h3 className="text-lg md:text-xl font-bold text-white leading-snug">{section.heading}</h3>
                          </div>

                          <div className="flex flex-col gap-4 text-xs md:text-sm text-neutral-350 leading-relaxed font-sans pl-0 sm:pl-10">
                            {section.content.split('\n\n').map((paragraph, pIdx) => (
                              <p key={pIdx} className="whitespace-pre-line leading-relaxed">{paragraph}</p>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>

                    {/* Author & Editorial Note */}
                    <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Editorial Independence</span>
                        <h4 className="text-sm font-bold text-white">Mahi AI Technical Publication</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                          This guide is maintained by developer MPS Thakur as an educational reference for students, engineers, and users interested in real-time neural interfaces, privacy patterns, and AI companion ethics.
                        </p>
                      </div>
                      <button
                        onClick={() => navigateTo('how-to-use')}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shrink-0 cursor-pointer"
                      >
                        Try Mahi AI Now &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer shown on every single page of the Info Portal */}
        <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 p-6 md:p-10 flex flex-col gap-6 relative z-10">
          <div className="max-w-5xl w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-1.5 max-w-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <h3 className="font-bold text-sm tracking-widest text-white uppercase">{APP_NAME} SUPPORT SYSTEM</h3>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                Premium client-side web companion interface wrapped over Google\'s open-access neural intelligence models. Safe, serverless, local storage encryption.
              </p>
            </div>

            {/* Support Portal Sub-Links */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <button onClick={() => navigateTo('features')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Features</button>
              <button onClick={() => navigateTo('how-to-use')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">How to Use</button>
              <button onClick={() => navigateTo('about')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">About</button>
              <button onClick={() => navigateTo('ai-companion-guide')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">AI Companion Guide</button>
              <button onClick={() => navigateTo('privacy')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Privacy Policy</button>
              <button onClick={() => navigateTo('terms')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Terms of Service</button>
              <button onClick={() => navigateTo('help')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Help Center</button>
              <button onClick={() => navigateTo('faq')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">FAQ</button>
              <button onClick={() => navigateTo('tutorials')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Tutorials</button>
              <button onClick={() => navigateTo('contact')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Contact</button>
              <button onClick={() => navigateTo('cookies')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Cookies Policy</button>
              <button onClick={() => navigateTo('disclaimer')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Disclaimer</button>
              <button onClick={() => navigateTo('release-notes')} className="text-neutral-400 hover:text-white hover:underline transition-all cursor-pointer">Release Notes</button>
            </div>
          </div>

          <div className="max-w-5xl w-full mx-auto border-t border-neutral-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            <span>Copyright &copy; {new Date().getFullYear()} Mahi AI. All Rights Reserved.</span>
            <a 
              href="https://youtube.com/@mpsthakur07?si=9Usj--LVcM9tFQDM" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors cursor-pointer"
            >
              Developed by {DEVELOPER_NAME}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
