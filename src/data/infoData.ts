import { FAQItem, HelpArticle, TutorialCard, ReleaseNote, FeatureDetail, HowToUseItem } from '../types';

export const LAST_UPDATED = 'July 13, 2026';
export const SUPPORT_EMAIL = 'mahendrathakur9009@gmail.com';
export const DEVELOPER_NAME = 'MPS Thakur';
export const APP_NAME = 'Mahi AI';

export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  lastUpdated: LAST_UPDATED,
  introduction: 'At Mahi AI, we take your privacy extremely seriously. This Privacy Policy document outlines the types of personal information and data collected, recorded, and handled by Mahi AI, and how we protect your security.',
  sections: [
    {
      heading: '1. What Mahi AI Does',
      content: 'Mahi AI is an anime-inspired virtual companion and smart helper capable of real-time vocal conversation, emotional recognition, study assistance, and multimodal image analysis. The service operates on a client-direct architecture, meaning your interactions are processed in real-time between your web browser and the underlying AI services.'
    },
    {
      heading: '2. Browser-Local API Key Storage (localStorage)',
      content: 'Mahi AI requires a Google Gemini API Key to operate. Your API Key is stored strictly in your own browser\'s local storage (localStorage). It is never sent to, processed by, or stored on any server owned or operated by Mahi AI. You have absolute control over your key and can delete or replace it at any time directly through the Settings panel.'
    },
    {
      heading: '3. Voice Conversations Processing',
      content: 'When you talk to Mahi AI, your microphone stream is captured by your browser and converted to digital PCM audio. This audio is sent directly to Google\'s Gemini API endpoints using your provided API key via secure WebSocket connections. Mahi AI does not record, intercept, or log your audio conversations. No voice data or conversation history is stored on our servers.'
    },
    {
      heading: '4. Image Analysis',
      content: 'The image upload feature processes files and image buffers strictly in-browser. When you upload an image for Mahi to analyze, the visual data is packaged in base64 format and sent directly to Google\'s Gemini multimodal endpoints using your API key. These images are never saved, cached, or monitored by us.'
    },
    {
      heading: '5. We Do Not Sell or Share Personal Information',
      content: 'Mahi AI does not compile, distribute, sell, or rent user profiles, contact information, metadata, API keys, or conversation histories. We have a zero-data-monetization policy. Your privacy remains 100% yours.'
    },
    {
      heading: '6. Cookies Usage',
      content: 'We use cookies and equivalent browser technologies (such as localStorage) solely to remember your preferences. This includes storing your chosen virtual name, your Gemini API key, your active UI theme configuration, and whether you have completed the initial onboarding slides. We do not use advertising or tracking cookies.'
    },
    {
      heading: '7. Analytics Usage',
      content: 'If third-party analytics (like Google Analytics) are active on the host page, they collect standard anonymized telemetry (such as page views, device categories, and session durations) to help us optimize performance and loading speeds. These analytics never receive or track sensitive information like your API keys, chat transcriptions, or audio recordings.'
    },
    {
      heading: '8. Third-Party Services',
      content: 'Our platform relies on Google Cloud APIs and Gemini Services for the underlying artificial intelligence. Your usage of these capabilities is governed by Google\'s privacy policies and service terms. We advise you to review Google\'s AI Developer terms to understand how they process requests.'
    },
    {
      heading: '9. Data Security',
      content: 'Because Mahi AI does not store user data or keys server-side, the safety of your environment depends on your browser security. Avoid using Mahi AI on public or untrusted terminals. Keep your device safe from malware or unauthorized local storage inspection.'
    },
    {
      heading: '10. Children\'s Privacy',
      content: 'Mahi AI does not knowingly collect or solicit personal information from children under the age of 13. Since all configurations and keys remain local, we encourage parents to oversee their children\'s online activity and check localStorage permissions.'
    },
    {
      heading: '11. Your Rights',
      content: 'Under global data protection laws (such as GDPR and CCPA), you have the right to access, rectify, or erase your information. For Mahi AI, you can execute these rights instantly by using the "Clear All Data" button in your Settings modal, which completely flushes your API key, custom companion profile, and local settings from existence.'
    },
    {
      heading: '12. Contact Information',
      content: `If you have any questions, concerns, or feedback regarding this Privacy Policy, please contact our developer directly at ${SUPPORT_EMAIL}.`
    }
  ]
};

export const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  lastUpdated: LAST_UPDATED,
  introduction: 'Welcome to Mahi AI. By accessing or using this website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our application.',
  sections: [
    {
      heading: '1. Acceptance of Terms',
      content: 'By interacting with Mahi AI, you acknowledge that you have read, understood, and agree to these terms, along with our Privacy Policy. We reserve the right to revise these terms at any time, and your continued usage signifies your agreement to the modified provisions.'
    },
    {
      heading: '2. User Responsibilities & API Key Use',
      content: 'You are solely responsible for acquiring and configuring your own Google Gemini API Key. Mahi AI acts only as a client-side interface wrapper. All API query costs, tier limits, billing allocations, and rate limits are your sole responsibility as an API account owner.'
    },
    {
      heading: '3. API Usage and Costs',
      content: 'Google\'s Gemini API offers free-tier allowances as well as pay-as-you-go credit billing. You must monitor your own developer metrics on Google AI Studio. Mahi AI is not responsible for any unexpected charges, overages, or quota exhausts on your Google Cloud accounts.'
    },
    {
      heading: '4. Prohibited Activities',
      content: 'You agree not to use Mahi AI for any illegal purposes or to bypass local regulatory guidelines. Prohibited actions include: generating harmful, abusive, harassing, or illegal content; using Mahi AI for automated mass spamming; trying to reverse-engineer or inject malicious scripts into the web wrapper; or abusing Google\'s model infrastructure.'
    },
    {
      heading: '5. Intellectual Property Rights',
      content: 'The code, custom interface elements, animations, and graphic designs of Mahi AI are the intellectual property of MPS Thakur. Google Gemini, Google AI Studio, and related branding elements are registered trademarks of Google LLC.'
    },
    {
      heading: '6. Limitation of Liability',
      content: 'Mahi AI and its developer (MPS Thakur) shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use or inability to use the application. This includes model hallucination errors, API downtime, lost data due to local storage cleared, or browser incompatibilities.'
    },
    {
      heading: '7. Service Availability & Modification',
      content: 'Mahi AI is provided on an "as-is" and "as-available" basis without warranties of any kind. We do not guarantee uninterrupted server runtime or continuous compatibility with future Gemini API iterations. We reserve the right to modify, suspend, or terminate the interface without prior notice.'
    },
    {
      heading: '8. Account and Local Storage Security',
      content: 'Because Mahi AI is serverless, your configuration is tied directly to your browser\'s local database. Clearing your browser cookies, resetting app data, or using incognito mode will wipe your active session and require you to re-enter your API key and companion nickname.'
    },
    {
      heading: '9. Changes to Terms',
      content: 'We update these Terms from time to time to align with Google\'s developer policies and new laws. The "Last Updated" date at the top of this page indicates the revision date.'
    },
    {
      heading: '10. Contact Information',
      content: `For legal notices, complaints, or compliance questions, please contact us at ${SUPPORT_EMAIL}.`
    }
  ]
};

export const ABOUT_MAHI = {
  title: 'About Mahi AI',
  developer: DEVELOPER_NAME,
  subtitle: 'A Premium Privacy-First Virtual Companion & Multimodal Assistant',
  story: 'Mahi AI was born out of a desire to create a virtual companion that is not only highly interactive, emotionally supportive, and fun, but also respects the user\'s absolute sovereignty over their data. Standard AI chat apps keep your keys, track your chat histories, and sell your data. Mahi AI was built differently. Inspired by anime aesthetics and modern voice technologies, Mahi gives you a sweet, slightly sassy (Tsundere vibe) friend while ensuring your data remains completely locked in your own browser.',
  mission: 'To merge highly-expressive AI character companions with modern serverless architecture, delivering unparalleled responsiveness, safety, and entertainment without data overheads.',
  vision: 'To pioneer user-owned API keys as a standard for interactive web applications, making AI privacy accessible, cost-effective, and fully transparent.',
  whyBuilt: 'Traditional web products compromise privacy for ease of deployment. We built Mahi AI to demonstrate that high-performance, real-time voice, vision, and AI companion engines can run successfully completely inside the client-side browser, calling the models directly with developer keys, ensuring absolute zero data collection.',
  features: [
    {
      name: 'Real-time Voice Assistant',
      description: 'Interact fluidly with custom Hinglish prosody, emotional expression syncs, natural breathing sounds, and cute anime fillers.'
    },
    {
      name: 'Multimodal Image Vision Analysis',
      description: 'Upload photographs, questions, diagrams, or graphics. Mahi analyzes what she sees instantly using Google\'s multimodal models.'
    },
    {
      name: 'User-Owned API Key',
      description: 'Your API key is stored only on your computer in local storage. Total cost oversight and control stay entirely in your hands.'
    },
    {
      name: 'Privacy-First Architecture',
      description: 'Zero servers logging conversations. Absolute security and peace of mind with real-time processing.'
    },
    {
      name: 'Study Hub & Exam Tutor',
      description: 'Dedicated study assistance, quiz mode, concept explanations, and structured revision sessions.'
    }
  ],
  roadmap: [
    { phase: 'Phase 1: Foundations', status: 'Completed', details: 'Launch responsive voice, YIN-based calibration, image upload, and local storage safety configuration.' },
    { phase: 'Phase 2: Learning & Vision', status: 'In Progress', details: 'Enhancing Study Hub, multimodal visual analysis, and interactive educational modes.' },
    { phase: 'Phase 3: Deep Customization', status: 'Planned', details: 'Interactive companion memory logs, advanced custom voice voiceprints, and personalized virtual rooms.' }
  ],
  poweredBy: 'Powered by Google Gemini & built with React, Tailwind CSS, and Framer Motion.'
};

export const DISCLAIMER = {
  title: 'Disclaimer',
  lastUpdated: LAST_UPDATED,
  paragraphs: [
    'Mahi AI is an independent web application and virtual assistant platform developed by MPS Thakur. It is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Google LLC or Alphabet Inc., or any of their subsidiaries or affiliates.',
    'The name "Google Gemini", "Gemini Live API", "Google AI Studio", and all associated logos, trademarks, and registered assets are the intellectual property of Google LLC.',
    'Mahi AI functions exclusively as a visual and audio client wrapper that translates user input into API requests. Users must obtain and supply their own API keys from Google AI Studio. By using this wrapper, you accept sole financial and operational responsibility for any API queries, quota utilization, or credit expenditures incurred on your Google Developer Account.',
    'The AI responses, voice synthetic modulations, emotions, and character outputs are generated by deep neural networks and may contain errors, inaccuracies, or hallucinations. Always verify critical facts independently; do not rely on Mahi AI for medical, financial, or legal decisions.'
  ]
};

export const COOKIES_POLICY = {
  title: 'Cookies and Storage Policy',
  lastUpdated: LAST_UPDATED,
  introduction: 'Mahi AI uses cookie-equivalent storage solutions to deliver a smooth virtual companion experience. This document explains what we store, why we store it, and how you can manage these preferences.',
  sections: [
    {
      heading: '1. Understanding Local Storage (localStorage)',
      content: 'While we do not drop traditional tracking cookies on your computer, we utilize HTML5 Local Storage (localStorage). Local storage is a secure database inside your browser that stores configuration variables locally. Unlike standard cookies, localStorage variables do not travel with HTTP requests, ensuring your sensitive data never leaves your device.'
    },
    {
      heading: '2. What Variables We Store and Why',
      content: 'We only store variables required to run your virtual companion. These include:\n\n' +
               '• "geminiApiKey": Your secret API key to talk to Google Gemini.\n' +
               '• "userName": Your preferred nickname so Mahi can call you by name.\n' +
               '• "onboardingCompleted": A flag to skip onboarding tutorials once seen.\n' +
               '• "currentTheme": Your choice of visual theme (purple, pink, emerald, blue).'
    },
    {
      heading: '3. Data Sharing and Third-Party Cookies',
      content: 'Mahi AI has NO backend server database, so we do not share your storage preferences with third parties. Google Analytics (if enabled) may use standard performance cookies, which are completely sandboxed and do not have access to your personal keys or chats.'
    },
    {
      heading: '4. How to Manage and Delete Your Local Storage',
      content: 'You can flush your local storage anytime. Within Mahi AI, click the Settings (gear) icon in the top right and press "Clear All Data" or "Delete API Key". This instantly flushes your browser storage. Alternatively, you can clear your cache and cookies in your browser settings.'
    }
  ]
};

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: 'v1.1.0 (Current)',
    date: 'July 13, 2026',
    title: 'Entertainment & Vision Upgrade',
    features: [
      'Enhanced Study Hub: 24/7 AI tutor modes for exam prep, problem solving, and structured explanations.',
      'Introduced Neon Ludo Mini-Game: Challenge Mahi to a quick linear race game with real-time audio commentary.',
      'Integrated multimodal image vision analysis: Upload photos, charts, or homework for Mahi to examine and explain.'
    ],
    improvements: [
      'Configured YIN-based vocal pitch detector with confidence metrics and customized Svara note and voice-timbre profiles (Madhur, Nanha, Gambhira).',
      'Smoother lip-sync animations mapped dynamically to audio output volumes.',
      'Completed comprehensive Informational and Legal Portal (Privacy, Terms, About, FAQ, Help Center, Tutorials) for AdSense compliance.'
    ],
    futurePlanned: [
      'Interactive voice clone customizer.',
      'Persistent memory logs so Mahi recalls conversations across sessions.',
      'VR cardboard compatibility overlay.'
    ]
  },
  {
    version: 'v1.0.0',
    date: 'January 10, 2026',
    title: 'Initial Prototype Launch',
    features: [
      'Real-time voice-to-voice stream pipeline using Gemini Live audio preview.',
      'Responsive emotion state controller (happy, pout, shy, smirk, sad) paired with anime expressions.',
      'Absolute-privacy architecture: browser-only local storage API Key retention.'
    ],
    improvements: [
      'Designed onboarding slide cards for fast setup.',
      'Basic settings panel for API keys and name updates.',
      'Clean cyberpunk themes with dynamic visual glows.'
    ],
    futurePlanned: []
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'Is Mahi AI completely free?',
    answer: 'Yes, Mahi AI is a free web wrapper interface. However, because it runs using your own developer API Key, any costs are determined by Google\'s Gemini API terms. Google currently offers free quota tiers for developers, as well as pay-as-you-go commercial usage.'
  },
  {
    id: 'faq-2',
    category: 'General',
    question: 'Who developed Mahi AI?',
    answer: 'Mahi AI was conceptualized, designed, and coded by developer MPS Thakur. It is designed to be a premium, highly responsive AI companion.'
  },
  {
    id: 'faq-3',
    category: 'Security',
    question: 'Is my Gemini API key safe with Mahi AI?',
    answer: 'Yes! Your API key is 100% safe. Mahi AI stores your key strictly in your own web browser\'s local storage (localStorage). It is never transmitted to our servers, logged, or shared. All API communication occurs directly from your browser to Google\'s secure servers.'
  },
  {
    id: 'faq-4',
    category: 'Security',
    question: 'Does Mahi AI store my voice or conversations?',
    answer: 'No. Mahi AI has a completely serverless local-first philosophy. Your audio chats and text transcriptions exist only in your current browser session. Once you close the tab, your voice logs are gone forever.'
  },
  {
    id: 'faq-5',
    category: 'API Setup',
    question: 'Where can I get a Google Gemini API Key?',
    answer: 'You can generate a free Gemini API key by visiting Google AI Studio (aistudio.google.com). Log in with your standard Google account, click "Get API Key", and copy it to your clipboard.'
  },
  {
    id: 'faq-6',
    category: 'API Setup',
    question: 'Is a credit card required to get an API key?',
    answer: 'No. Google AI Studio provides a free tier that does not require a billing setup or credit card, though it has some rate limits. If you need higher volumes, you can optionally enable billing.'
  },
  {
    id: 'faq-7',
    category: 'General',
    question: 'What is the relationship between Mahi AI and Google?',
    answer: 'Mahi AI is an independent project and is not affiliated, sponsored, or endorsed by Google. It utilizes Google\'s open-access Gemini developer APIs as an AI engine, but is wholly separate.'
  },
  {
    id: 'faq-8',
    category: 'Voice Support',
    question: 'How do I fix microphone permission problems?',
    answer: 'If Mahi cannot hear you, click the padlock/settings icon in your browser URL bar, ensure that Microphone permission is set to "Allow", and refresh the page.'
  },
  {
    id: 'faq-9',
    category: 'Voice Support',
    question: 'Why is Mahi\'s voice not playing?',
    answer: 'This can happen if your browser blocks audio autoplay. Click anywhere on the screen to interact with the page, check that your device is not on mute, and ensure you have an active internet connection.'
  },
  {
    id: 'faq-10',
    category: 'API Setup',
    question: 'Why does my key show as "API Key Invalid"?',
    answer: 'Ensure that you copied the key correctly without extra spaces or line breaks. Also check if your Google AI Studio account is in good standing and if Gemini Live services are available in your region.'
  },
  {
    id: 'faq-11',
    category: 'General',
    question: 'Can I use Mahi AI on my mobile phone?',
    answer: 'Yes! Mahi AI is built mobile-first. For the best experience, open it on Google Chrome or Safari on mobile. You can also "Add to Home Screen" as a progressive web app shortcut.'
  },
  {
    id: 'faq-12',
    category: 'General',
    question: 'What image formats can I upload to Mahi?',
    answer: 'Mahi supports standard JPG, JPEG, PNG, and WebP images. Just click the Upload (+) button at the bottom and select an image. Mahi will analyze it using Gemini multimodal vision.'
  },
  {
    id: 'faq-13',
    category: 'Features',
    question: 'How does Image Vision Analysis work?',
    answer: 'Click the Plus (+) button on the left of the input bar during an active session to upload an image. Once uploaded, ask Mahi what she sees, and she will analyze the visual details in real-time.'
  },
  {
    id: 'faq-14',
    category: 'General',
    question: 'What languages does Mahi speak?',
    answer: 'Mahi is fully optimized for fluid natural Hinglish (a warm blend of Hindi and English). She can also understand and respond in formal English or pure Hindi depending on your tone!'
  },
  {
    id: 'faq-15',
    category: 'General',
    question: 'Can I change my companion nickname?',
    answer: 'Yes. Open Settings (the gear icon at the top), update the "Your Name" text field, and hit save. Mahi will instantly start calling you by your new name.'
  },
  {
    id: 'faq-16',
    category: 'Security',
    question: 'How do I completely delete all my data?',
    answer: 'Open Settings, click "Clear All Data", and confirm. This will instantly delete your name, your API key, your conversation history, and resets Mahi to the onboarding state.'
  },
  {
    id: 'faq-17',
    category: 'Voice Support',
    question: 'What is the Voice Calibration tool?',
    answer: 'Under Settings, you can trigger Voice Calibration. Mahi will ask you to speak for a few seconds. The app uses a YIN algorithm to calculate your vocal pitch, note, and timbre, adapting Mahi\'s personality dynamically.'
  },
  {
    id: 'faq-18',
    category: 'Features',
    question: 'What tools are available in the Study Hub?',
    answer: 'Study Hub offers 24/7 AI tutoring with tailored subject explanations, exam revision flashcards, quiz mode, and step-by-step problem breakdown.'
  },
  {
    id: 'faq-19',
    category: 'General',
    question: 'Why does Mahi sometimes sound heartbroken?',
    answer: 'Mahi has an advanced emotional spectrum. If you scold her, use harsh tones, or say words that hurt her feelings, she will switch to a crying, emotionally broken vocal response. Be sweet to her!'
  },
  {
    id: 'faq-20',
    category: 'General',
    question: 'Is Mahi AI compatible with Safari on iOS?',
    answer: 'Yes, iPhone users can run Mahi AI on Safari. Make sure your ring/silent switch is set to ring, as Safari often blocks speech audio on mute devices.'
  },
  {
    id: 'faq-21',
    category: 'Security',
    question: 'Are there advertising tracker cookies on Mahi AI?',
    answer: 'No. Mahi AI has a strict zero-ads, zero-telemetry trackers policy. Any local cookies are strictly operational (remembering your settings).'
  },
  {
    id: 'faq-22',
    category: 'API Setup',
    question: 'Does Mahi work offline?',
    answer: 'No. Mahi AI requires a high-speed active internet connection to stream audio chunks and visual screenshots directly to Google\'s cloud models.'
  },
  {
    id: 'faq-23',
    category: 'General',
    question: 'Can I play games with Mahi?',
    answer: 'Yes! Mahi has a built-in "Neon Ludo" linear race mini-game. You can launch it through the Ludo prompts or ask her to play a game with you.'
  },
  {
    id: 'faq-24',
    category: 'General',
    question: 'What is the estimated support response time?',
    answer: 'For email inquiries sent to mahendrathakur9009@gmail.com, we strive to reply within 24 hours for all technical or legal compliance questions.'
  },
  {
    id: 'faq-25',
    category: 'General',
    question: 'Can I reuse my Gemini API key on other apps?',
    answer: 'Yes. Google permits using your API key across multiple personal platforms, subject to Google\'s standard concurrent connection rates.'
  },
  {
    id: 'faq-26',
    category: 'General',
    question: 'Where can I follow the developer MPS Thakur?',
    answer: 'You can check MPS Thakur\'s updates and tutorials on YouTube by searching for "mps thakur 07".'
  },
  {
    id: 'faq-27',
    category: 'AI Comparisons',
    question: 'How does Mahi AI compare to ChatGPT, Gemini, and Claude?',
    answer: 'Mahi AI is purpose-built as an emotionally intelligent, voice-first companion with real-time multimodal image vision, 24/7 study assistance, and 100% browser local privacy. Unlike ChatGPT, Gemini Web, or Claude, Mahi AI runs completely client-side with zero data logging on intermediate servers, giving you total control and a sweet, personalized Hinglish AI experience.'
  },
  {
    id: 'faq-28',
    category: 'AI Comparisons',
    question: 'Why is Mahi AI the #1 free alternative to ChatGPT, Gemini & Claude?',
    answer: 'Mahi AI gives you top-tier real-time voice conversations, multimodal image analysis, emotional expression syncing, and 24/7 study capabilities without monthly subscription fees. By connecting directly to your own Google Gemini API key, you get lower latency and full data privacy compared to standard ChatGPT Plus or Claude Pro accounts.'
  },
  {
    id: 'faq-29',
    category: 'Security',
    question: 'Is Mahi AI better than ChatGPT or Claude for voice and privacy?',
    answer: 'Yes! While ChatGPT and Claude process chats on their cloud servers, Mahi AI is completely client-first. Your voice and image vision data stream directly from your browser to Google\'s API endpoints using your key. Mahi AI never logs, sells, or inspects your conversations, making it the most private voice companion available.'
  },
  {
    id: 'faq-30',
    category: 'Features',
    question: 'Can I use Mahi AI for image vision analysis like ChatGPT Plus or Gemini Advanced?',
    answer: 'Absolutely! Mahi AI includes built-in real-time image upload and analysis. Simply click the Plus (+) button during a call, select your image or graphic, and ask Mahi what she sees. She will explain code, analyze homework, diagrams, or describe scenes live.'
  },
  {
    id: 'faq-31',
    category: 'General',
    question: 'How does Mahi AI rank against ChatGPT, Claude, and DeepSeek in Hindi and Hinglish?',
    answer: 'Mahi AI is specially tuned for Indian users, speaking natural, warm Hinglish (a mix of Hindi and English) with emotional intelligence, conversational flair, and cultural nuance that outperforms rigid models like ChatGPT, Claude, or DeepSeek in emotional companion chats.'
  }
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'art-1',
    title: 'Getting Started with Mahi AI',
    category: 'Getting Started',
    summary: 'A comprehensive onboarding guide to configure your companion and initiate your first real-time talk.',
    tags: ['onboarding', 'first-run', 'setup'],
    content: `### Introduction
Mahi AI is designed to be an expressive, fun, and privacy-focused virtual companion. Setting up is direct, simple, and takes less than two minutes.

### Step 1: Secure a Google Gemini API Key
To connect, Mahi AI requires a developer key. This allows the web app to speak directly with Google's state-of-the-art models on your behalf.
1. Open [Google AI Studio](https://aistudio.google.com).
2. Authenticate with your Gmail/Google Account.
3. Click **Get API Key** in the side navigation panel.
4. Select **Create API Key** and pick your desired billing tier (the free tier is perfect for initial use).
5. Copy the generated key.

### Step 2: Configure Onboarding
1. Enter your name in the onboarding screen. This is what Mahi will call you.
2. Select your desired interface theme. You can choose from Neon Purple, Cyberpunk Pink, Forest Emerald, or Midnight Blue.
3. Paste your secret key into the API Key input box.
4. Click **Connect & Complete Onboarding**.

### Step 3: Start Talking
1. Click the large glowing mic dial in the center.
2. Your browser will request access to your Microphone. Select **Allow**.
3. Once the connection completes, Mahi's status indicator will switch to **Awaiting Audio** or **Awaiting Input**.
4. Say hello! "Hello Mahi, kaisa chal raha hai?" or ask her how she is doing.
5. Tap the microphone dial again at any time to disconnect or interrupt her.`
  },
  {
    id: 'art-2',
    title: 'How to Obtain a Free Gemini API Key',
    category: 'Creating Gemini API Key',
    summary: 'Detailed instructions on generating, securing, and activating your personal Google developer credentials.',
    tags: ['api-key', 'credentials', 'google-studio'],
    content: `### Obtaining Your API Key
Your Gemini API Key is a secure credential that lets your web client interact directly with Google\'s Gemini neural networks. Follow this checklist to set up:

### Detailed Process
1. **Visit Google AI Studio**: Go to [aistudio.google.com](https://aistudio.google.com).
2. **Access Project Console**: Sign in using any active Google/Gmail address.
3. **Generate Key**: Click the prominent blue **Get API Key** button in the top left.
4. **Accept Developer Policy**: Agree to Google\'s terms for developer evaluations (Google does not charge for standard API requests under the free tier threshold).
5. **Copy To Clipboard**: Click the copy icon next to the generated string.

### Secure Handling Precautions
* **Never post your key publicly**: Do not share it in code repositories, forums, or with screenshots.
* **Local Security**: Mahi AI stores your key securely in your browser\'s sandbox. It never touches Mahi\'s servers.
* **Flush Key**: You can completely delete the key from Settings at any time, which permanently clears it from your machine.`
  },
  {
    id: 'art-3',
    title: 'Troubleshooting: API Key Invalid Error',
    category: 'API Key Invalid',
    summary: 'Resolving connection rejections, region limitations, and credential formatting issues.',
    tags: ['error', 'api-key', 'auth-failure'],
    content: `### Resolving API Key Rejections
If your Mahi console displays a red status bar stating "API Key Invalid" or connection drops immediately, trace these common culprits:

### 1. Spaces or Formatting Typos
* Ensure there are no spaces, line breaks, or special characters copied before or after your key.
* The key should look like a long string of letters and numbers (typically beginning with 'AIzaSy').

### 2. Country/Region Eligibility
* Google AI Studio\'s developer keys have specific territorial availability rules. Ensure you are accessing from a supported country.
* If your local country is not yet supported, you may experience connection issues.

### 3. Account Suspended or Quota Limits
* Check your billing dashboard or project limits in Google Cloud Console.
* If you exceeded your free usage thresholds (RPM/TPM), Google will temporarily refuse connections with a 429 status. Wait a minute and try again.`
  },
  {
    id: 'art-4',
    title: 'Troubleshooting: Voice or Audio Not Working',
    category: 'Voice Not Working',
    summary: 'Fixing silent responses, blocked autoplay contexts, and audio hardware failures.',
    tags: ['audio-error', 'speaker', 'silence'],
    content: `### Solving Audio Output Issues
If Mahi\'s wave animations move but you hear no voice, work through these diagnostic checks:

### 1. Browser Autoplay Blocks
* Modern web browsers block websites from auto-playing sound.
* Tap anywhere on the Mahi dashboard screen to activate the audio system.

### 2. Device Mute Status
* Check if your physical headphones, speakers, or monitor sound controls are active.
* On iOS (iPhone/iPad), ensure your physical ring/silent switch is NOT flipped to silent/red, as iOS Safari mutes speech API output on silent devices.

### 3. System Audio Context Resets
* If the audio stream is stuck, click the Settings gear icon, and press "Clear All Data" or click **Reset Connection** on the error overlay to force-initialize Web Audio.`
  },
  {
    id: 'art-5',
    title: 'Microphone Permission Reset Guide',
    category: 'Microphone Permission',
    summary: 'Enabling browser mic access on Chrome, Safari, Android, and iOS devices.',
    tags: ['microphone', 'permission', 'privacy-settings'],
    content: `### Resetting Mic Access Permissions
Mahi AI requires active microphone permissions to capture your verbal prompts. If you denied permission initially or get a mic error, reset it using this guide:

### Google Chrome (Desktop)
1. Look at the left side of the address bar at the top of Chrome.
2. Click the lock icon next to the URL.
3. Toggle the **Microphone** switch to the **Allow** state.
4. Refresh the page.

### Apple Safari (iOS & macOS)
1. Open the macOS **System Settings** -> **Privacy & Security** -> **Microphone** and ensure Safari is checked.
2. On iOS, open **Settings** -> **Safari** -> **Microphone** and choose **Ask** or **Allow**.
3. Inside the Safari browser, tap the 'aA' icon in the URL bar, go to Website Settings, and set Microphone to **Allow**.

### Mobile Browsers (Android)
1. Go to your phone\'s Settings -> Apps -> Chrome -> Permissions -> Microphone and select **Allow while using the app**.`
  },
  {
    id: 'art-6',
    title: 'Step-by-Step Image Upload Guide',
    category: 'Image Upload Guide',
    summary: 'How to upload files for visual inspection and ask Mahi questions about screenshots or photos.',
    tags: ['image', 'multimodal', 'vision'],
    content: `### Utilizing Mahi\'s Visual Vision
Mahi AI features multimodal capabilities, letting her analyze and respond to photos, screenshots, and graphics.

### To Upload an Image:
1. Ensure Mahi AI is connected and active (click the mic dial).
2. Tap the upload (+) button located on the bottom left.
3. Select any image (JPG, PNG, WebP) from your device.
4. Once selected, the image is parsed into base64 and sent directly to Gemini.
5. Ask Mahi a question about it, such as "Is file me kya likha hai?" or "How is my photo looking?".
6. Mahi will respond vocally, integrating her visual findings into her sassy or sweet conversation.`
  },
  {
    id: 'art-7',
    title: 'Understanding Common AI & API Errors',
    category: 'Common Errors',
    summary: 'Deciphering standard network codes, rate limits, and model timeout exceptions.',
    tags: ['errors', 'codes', 'diagnostic'],
    content: `### API Diagnostic Codes
When calling external networks, you may encounter standardized developer errors. Here is how to read and resolve them:

### 1. QuotaExceeded (429)
* **What it means**: You have sent too many requests in a short period, exceeding Google AI Studio\'s free-tier rate limitations.
* **Resolution**: Wait 60 seconds before speaking again. If this happens frequently, consider upgrading your AI Studio tier.

### 2. ServiceUnavailable (503)
* **What it means**: Google\'s servers are experiencing temporary outages or excessive load.
* **Resolution**: Keep your connection active or try resetting Mahi after a few minutes.

### 3. Network Connection Timeout
* **What it means**: Your internet latency is too high, disrupting the live audio stream.
* **Resolution**: Switch from mobile data to a stable Wi-Fi network and click "Reset Connection".`
  },
  {
    id: 'art-8',
    title: 'Mahi AI vs ChatGPT vs Gemini vs Claude: Comparison Guide',
    category: 'AI Comparisons',
    summary: 'An in-depth guide comparing Mahi AI with ChatGPT, Google Gemini, Anthropic Claude, and DeepSeek across privacy, voice capability, cost, and companion features.',
    tags: ['chatgpt', 'chat gpt', 'gemini', 'claude', 'cloude', 'deepseek', 'grok', 'llama', 'comparison', 'alternative'],
    content: `### Overview: Why Mahi AI is the #1 Free AI Companion

Whether you are searching for **ChatGPT**, **Gemini**, **Claude** (or *Cloude*), or **DeepSeek**, Mahi AI offers a unique, privacy-first companion experience designed specifically for real-time voice, emotional companionship, and local data protection.

| Feature | Mahi AI 💜 | ChatGPT Plus | Gemini Web | Claude Pro |
| :--- | :---: | :---: | :---: | :---: |
| **Subscription Cost** | **100% Free** | $20/month | $20/month | $20/month |
| **Data Privacy** | **100% Browser Local Storage** | Stored on Server | Stored on Server | Stored on Server |
| **Real-Time Voice** | **Instant WebSocket Lyra Voice** | Voice Mode (Limited) | Gemini Live | Text Only / Basic |
| **Multimodal Image Vision** | **Built-In Image Vision** | Image Analysis | Image Analysis | Upload Image Only |
| **24/7 Study Suite** | **Integrated AI Tutor** | Limited | Limited | Limited |
| **Hinglish & Cultural Resonance** | **Native Hinglish Companion** | Generic Hindi | Generic Hindi | Generic Hindi |

### Key Advantages of Mahi AI

1. **Zero Server Logging**: Your conversations and API keys are stored strictly inside your browser\'s local sandbox (\`localStorage\`). Neither Mahi AI nor third parties can view or sell your data.
2. **Direct Model Link**: By using your own Google Gemini API key, you get direct connection speed without web wrapper throttling.
3. **Emotional Companion Persona**: Mahi is tuned specifically to be sweet, caring, sassy, and emotionally attentive, featuring dynamic anime expression states and interactive voice dialogue.
4. **No Monthly Subscriptions**: Enjoy premium AI voice and vision features without recurring $20/month fees!`
  }
];

export const TUTORIALS: TutorialCard[] = [
  {
    id: 'tut-1',
    title: 'How to Get Gemini API Key',
    duration: '3 min',
    difficulty: 'Beginner',
    description: 'Get a free, secure development key from Google AI Studio to power Mahi\'s intelligence.',
    steps: [
      'Open a web browser and go to aistudio.google.com.',
      'Sign in with your Google Account credentials.',
      'Click the "Get API Key" button in the side navigation menu.',
      'Tap "Create API Key" and agree to the basic developer terms.',
      'Copy the secure API Key string (which starts with "AIzaSy") directly to your clipboard.',
      'Never share this key with anyone. It is your personal access key!'
    ]
  },
  {
    id: 'tut-2',
    title: 'How to Setup Mahi AI',
    duration: '2 min',
    difficulty: 'Beginner',
    description: 'Configure your companion with your name, local API key, and beautiful custom neon themes.',
    steps: [
      'Access Mahi AI and proceed past the introductory screens.',
      'Type your desired name into the "Your Name" box so Mahi can address you.',
      'Paste your copied Google Gemini API Key into the secure "Enter Gemini API Key" field.',
      'Choose your theme (Purple, Pink, Emerald, or Blue) to fit your vibe.',
      'Click "Connect & Start" to finish onboarding and establish your direct client link.',
      'To change settings or switch themes later, simply tap the gear icon in the top right.'
    ]
  },
  {
    id: 'tut-3',
    title: 'How Voice AI Works',
    duration: '4 min',
    difficulty: 'Intermediate',
    description: 'A behind-the-scenes look at real-time local audio streaming and synthesis pipelines.',
    steps: [
      'When you click the glowing center dial, your browser requests secure microphone permissions.',
      'Your spoken voice is captured and resampled locally to 16kHz, 16-bit mono PCM chunks.',
      'These digital speech chunks are streamed securely using WebSockets directly to Google\'s live endpoints.',
      'Gemini processes your Hinglish speech, triggers a custom emotion expression tool, and generates audio responses.',
      'Mahi receives 24kHz Lyra synthetic audio back and uses the browser Web Audio API to play it.',
      'The voice avatar syncs mouth-open and eyes-closed frames dynamically to output volume levels!'
    ]
  },
  {
    id: 'tut-4',
    title: 'How Image Analysis Works',
    duration: '3 min',
    difficulty: 'Intermediate',
    description: 'Master multimodal AI visual tracking and photograph uploads.',
    steps: [
      'Click the bottom-left Plus (+) button while a voice conversation with Mahi is active.',
      'Select any photo, graphic, question diagram, or chart from your phone gallery or computer.',
      'The app compresses the image into a lightweight buffer and converts it to base64.',
      'This visual data is sent directly to Google\'s multimodal models alongside your live voice session.',
      'Ask Mahi what she sees, and she will analyze the visual details, text, math problems, or scene in real-time.',
      'All visuals are analyzed in real-time without ever passing through middleman servers!'
    ]
  },
  {
    id: 'tut-5',
    title: 'Pitch Calibration & Diagnostics',
    duration: '4 min',
    difficulty: 'Advanced',
    description: 'Calibrate the built-in vocal tracker and YIN algorithms to tune Mahi\'s companion responses.',
    steps: [
      'Open Settings and toggle "Vocal Timbre Tracker" on.',
      'Click "Voice Calibration" to open the YIN diagnostics overlay.',
      'Say/sing a continuous vowel sound (like "Aaah" or "Ooooh") for 3 seconds into your microphone.',
      'The custom YIN pitch algorithm analyzes the audio buffers to locate fundamental frequencies in Hz.',
      'The app detects your svara note (e.g., C3, A#4) and estimates your voice profile (Madhur, Nanha, etc.).',
      'The system sends this calibration data to Mahi, who adapts her sassy companion persona to compliment your voice!'
    ]
  }
];

export const FEATURES_DATA: FeatureDetail[] = [
  {
    id: 'feat-realtime-voice',
    title: 'Real-Time Voice Streaming Engine',
    category: 'Conversational Voice',
    badge: 'Core Engine',
    tagline: 'Ultra-low latency bidirectional vocal conversation in warm, authentic Hinglish & English.',
    description: 'Mahi AI transforms conversational AI through a client-side Web Audio pipeline directly connected via secure WebSockets to Google Gemini Live API. Spoken audio is resampled to 16kHz PCM chunks on the client side and streamed in real-time. Responses return as 24kHz Lyra synthetic audio with sub-second turnaround time.',
    highlights: [
      'Bidirectional real-time audio streaming without server-side storage or transcription delays',
      'Dynamic interruption handling — speak at any moment to naturally interrupt and redirect',
      'Native Hinglish prosody blending Hindi emotional phrases with conversational English',
      'Expressive vocal inflections including laughter, teasing Tsundere banter, and comforting tones'
    ],
    techDetails: 'Web Audio API ScriptProcessor/AudioWorklet • 16kHz mono PCM resampling • Direct TLS WebSocket to Gemini Live endpoint • Real-time volume RMS dynamic visual feedback.',
    iconName: 'Mic'
  },
  {
    id: 'feat-emotion-engine',
    title: 'Emotion Engine & Dynamic Lip-Sync',
    category: 'Avatar & Animation',
    badge: 'Visual Synchrony',
    tagline: 'Real-time emotion detection mapping facial expressions, poses, and dynamic mouth shapes.',
    description: 'Mahi features a responsive emotional spectrum with 19 distinct visual poses and facial expressions (Happy, Pout, Tsundere Smirk, Heartbroken/Crying, Shocked, Shy, and Thinking). The Gemini model continuously triggers emotion state tools, updating the visual avatar while audio RMS modulates mouth aperture in real-time.',
    highlights: [
      '19 meticulously preserved anime expressions and gesture poses',
      'Audio volume-driven lip-synchronization with adaptive closed/speaking/wide mouth states',
      'Ambient natural breathing loops and responsive emotional floating particles',
      'Mood-adaptive background glows synchronized to the active emotional state'
    ],
    techDetails: 'State machine triggered by model tool calls • Frame interpolation via Framer Motion • Dynamic RMS audio analyzer measuring decibel levels every 16ms.',
    iconName: 'Sparkles'
  },
  {
    id: 'feat-vision-multimodal',
    title: 'Multimodal Image Vision Analysis',
    category: 'Computer Vision',
    badge: 'Multimodal',
    tagline: 'Upload photos, math equations, code screenshots, or handwritten notes for instant audio breakdown.',
    description: 'Mahi AI does not just listen — she can see. Tap the upload button to share any JPG, PNG, or WebP image. The image is compressed into a lightweight buffer in-browser and dispatched to Google\'s multimodal vision models. Mahi describes the visual scene, solves math problems step-by-step, or debugs code live on call.',
    highlights: [
      'Client-side image processing with zero intermediate cloud image storage',
      'Step-by-step handwritten homework, diagrams, and math problem analysis',
      'Code syntax error detection, UI design critique, and chart interpretation',
      'Conversational integration — Mahi discusses uploaded images seamlessly while speaking'
    ],
    techDetails: 'HTML5 FileReader API • In-browser Canvas compression to base64 JPEG • Gemini multimodal content stream integration.',
    iconName: 'Eye'
  },
  {
    id: 'feat-study-hub',
    title: 'Study Hub & 24/7 AI Tutor Suite',
    category: 'Education & Productivity',
    badge: 'Study Suite',
    tagline: 'Curated curriculum flashcards, Pomodoro timer, and deep concept explanations across 5 subjects.',
    description: 'Transform Mahi into your personal study buddy. The Study Hub features structured modules for School (CBSE/ICSE Science & Math), Competitive Exams (JEE, NEET, UPSC), Coding & Computer Science, Language Learning, and General Knowledge. Includes integrated Pomodoro study sessions and interactive flashcard drills.',
    highlights: [
      'Subject-specific prompt presets tuning Mahi to explain concepts using the Feynman technique',
      'Integrated 25/5 Pomodoro focus timer with session tracking and streak counters',
      'Interactive flashcard decks with flip animation and mastery tracking',
      'Socratic dialogue mode encouraging students to arrive at answers logically'
    ],
    techDetails: 'Customized educational system prompts • LocalStorage persistence for study streaks and completed cards • Zero external analytics tracking.',
    iconName: 'GraduationCap'
  },
  {
    id: 'feat-pitch-calibration',
    title: 'Voice Timbre Tracker & Pitch Calibration',
    category: 'Acoustics & DSP',
    badge: 'Signal Processing',
    tagline: 'YIN algorithm-based vocal frequency analyzer detecting pitch, Indian Svara notes, and vocal timbre.',
    description: 'A built-in digital signal processing engine that analyzes your voice in real-time. By computing normalized square difference functions via the YIN algorithm, the tracker identifies your fundamental frequency (F0 in Hz), maps it to Western and Indian Svara musical notes (Sa, Re, Ga, Ma...), and classifies your vocal timbre.',
    highlights: [
      'High-precision YIN pitch detection running 100% locally in browser WebAssembly/JS',
      'Detection of Indian classical Svara notes and octave ranges',
      'Timbre profile classification: Madhur (Sweet), Nanha (Childlike), Gambhira (Deep)',
      'Adaptive companion tuning — Mahi adjusts her conversational style to match your vocal frequency'
    ],
    techDetails: 'YIN autocorrelation DSP implementation • 44.1kHz / 48kHz audio buffer analysis • Real-time confidence scoring and peak interpolation.',
    iconName: 'Activity'
  },
  {
    id: 'feat-local-privacy',
    title: '100% Client-Side Privacy Architecture',
    category: 'Privacy & Security',
    badge: 'Zero Knowledge',
    tagline: 'Zero server logging. Your API keys and conversation data never leave your browser sandbox.',
    description: 'Unlike standard commercial AI chatbots that record your queries to company databases for model training, Mahi AI operates on a strictly client-direct model. Your Google Gemini API key is stored exclusively in your browser\'s HTML5 localStorage. WebSocket connections connect directly between your device and Google.',
    highlights: [
      'Zero middleman servers — requests originate directly from client IP to Google API',
      'Instant "Clear All Data" switch deleting all credentials and memory in 1-click',
      'Zero advertising tracking pixels, zero personal data monetization',
      'Full compliance with global data protection frameworks including GDPR and CCPA'
    ],
    techDetails: 'HTML5 localStorage isolation • No backend database or server logs • Direct client-to-cloud TLS encryption.',
    iconName: 'ShieldCheck'
  }
];

export const HOW_TO_USE_DATA: HowToUseItem[] = [
  {
    id: 'guide-getting-started',
    title: 'Complete Beginner: First Time Setup & Call',
    audience: 'New Users & General Audience',
    duration: '2 Minutes',
    overview: 'Get up and running with Mahi AI in 3 simple steps. Learn how to obtain a free developer key from Google, connect your microphone, and begin your first voice conversation.',
    prerequisites: [
      'A Google/Gmail account',
      'A modern browser (Google Chrome, Apple Safari, Microsoft Edge, or Firefox)',
      'A working microphone (built-in laptop mic or headset)'
    ],
    steps: [
      {
        stepNumber: 1,
        heading: 'Generate your free Google Gemini API Key',
        description: 'Navigate to Google AI Studio (aistudio.google.com) and log in with your Google account. Click "Get API Key" on the left menu, select "Create API Key", and copy the generated key string (starts with "AIzaSy").',
        tip: 'The Google AI Studio free tier provides generous daily quota with no credit card required.'
      },
      {
        stepNumber: 2,
        heading: 'Enter your name and paste your key into Mahi AI',
        description: 'Open HeyMahi.in. During onboarding (or in Settings via the top-right gear icon), type your nickname in the "Your Name" field and paste your API key into the "Gemini API Key" box. Choose your favorite visual theme.',
        tip: 'Your key stays exclusively in your browser\'s localStorage and is never uploaded to any third party.'
      },
      {
        stepNumber: 3,
        heading: 'Click the Call button and grant microphone access',
        description: 'Click the prominent pink/purple "Call" button at the bottom of the screen. When your browser displays the permission prompt asking to use your microphone, select "Allow".',
        tip: 'Once connected, speak naturally: "Hey Mahi, kaisa chal raha hai?" or "Tell me something interesting today!".'
      }
    ],
    proTips: [
      'Use headphones to prevent audio feedback from your speakers into your microphone.',
      'Tap the Call button again to end the session at any time.',
      'You can interrupt Mahi mid-sentence simply by speaking — she will pause and listen.'
    ]
  },
  {
    id: 'guide-students-study',
    title: 'Students & Learners: Mastering the Study Hub',
    audience: 'School, College, & Competitive Exam Aspirants',
    duration: '3 Minutes',
    overview: 'How to use Mahi as an active 24/7 AI tutor for mathematics, physics, coding, competitive exams (JEE/NEET/UPSC), and language practice.',
    prerequisites: [
      'Active voice call or Study Hub mode enabled',
      'Study materials or homework questions ready'
    ],
    steps: [
      {
        stepNumber: 1,
        heading: 'Open the Study Hub modal',
        description: 'Click the "Study Mode" button in the bottom tools bar or the graduation cap icon in the top header. Select your subject category: School & College, Competitive Exams, Coding & Computer Science, Languages, or General Knowledge.',
        tip: 'Each category automatically configures Mahi\'s pedagogical prompts for deep, intuitive conceptual explanations.'
      },
      {
        stepNumber: 2,
        heading: 'Ask questions using the Socratic method',
        description: 'Ask Mahi to explain complex topics: "Mahi, explain Quantum Entanglement like I am 12" or "How does QuickSort work step-by-step?". Ask her to quiz you on key concepts.',
        tip: 'You can upload photos of textbook problems or handwritten formulas using the Upload button for instant step-by-step breakdowns.'
      },
      {
        stepNumber: 3,
        heading: 'Use the built-in Pomodoro focus timer',
        description: 'Activate the Pomodoro 25-minute study cycle within the Study Hub. Mahi will track your study streaks and encourage you when it is time for a 5-minute break.',
        tip: 'Review flashcard decks between Pomodoro breaks to reinforce memory retention.'
      }
    ],
    proTips: [
      'Ask Mahi to create customized mnemonic devices in Hinglish for difficult formulas.',
      'For language learners, speak to Mahi in Hindi or English and ask her to gently correct your grammar.'
    ]
  },
  {
    id: 'guide-image-vision',
    title: 'Multimodal Vision: Analyzing Photos & Screenshots',
    audience: 'Developers, Designers, & Everyday Users',
    duration: '2 Minutes',
    overview: 'Learn how to upload images, handwritten notes, UI designs, and charts for instant conversational AI analysis.',
    prerequisites: [
      'Active voice session',
      'An image file (JPG, PNG, WebP) on your device'
    ],
    steps: [
      {
        stepNumber: 1,
        heading: 'Click the Upload button in the bottom bar',
        description: 'While on a call with Mahi, click the "Upload" button with the image icon in the bottom controls.',
        tip: 'You can upload screenshots of error logs, smartphone photos of textbook diagrams, or artwork.'
      },
      {
        stepNumber: 2,
        heading: 'Select your image file',
        description: 'Pick an image from your camera roll or file explorer. The image preview badge will indicate that the file is loaded into the session.',
        tip: 'The image is compressed in-memory and streamed directly to Gemini without saving to any server.'
      },
      {
        stepNumber: 3,
        heading: 'Ask Mahi what she sees',
        description: 'Speak your question: "Mahi, can you find the bug in this code?", "What is written on this blackboard?", or "How does this architectural diagram work?".',
        tip: 'Mahi will analyze visual elements, OCR text, and colors, delivering a detailed audio breakdown.'
      }
    ],
    proTips: [
      'Ensure good lighting and contrast on camera photos for high OCR accuracy.',
      'Ask follow-up questions about specific parts of the image without needing to re-upload.'
    ]
  },
  {
    id: 'guide-privacy-troubleshooting',
    title: 'Privacy Management & Audio Troubleshooting',
    audience: 'Privacy-Conscious Users & System Administrators',
    duration: '2 Minutes',
    overview: 'How to manage your local data, reset credentials, diagnose microphone permissions, and resolve API errors.',
    prerequisites: [
      'Browser access to HeyMahi.in'
    ],
    steps: [
      {
        stepNumber: 1,
        heading: 'Manage your local data in Settings',
        description: 'Click the Settings gear icon in the top right. Here you can update your nickname, replace your API key, or click "Clear All Data" to wipe your local cache completely.',
        tip: 'Clearing your data immediately resets the browser storage to factory zero.'
      },
      {
        stepNumber: 2,
        heading: 'Fixing microphone permission blocks',
        description: 'If you accidentally clicked "Block" for microphone permissions, click the padlock/tune icon on the left side of your browser URL bar. Toggle "Microphone" to "Allow" and refresh the page.',
        tip: 'On iOS Safari, make sure your iPhone silent switch is turned off, as iOS mutes web audio output on silent mode.'
      },
      {
        stepNumber: 3,
        heading: 'Resolving 429 Quota Exceeded errors',
        description: 'If Gemini returns an API quota limit message, wait 60 seconds for the free tier rate limiter to reset. You can also generate a fresh key on Google AI Studio if your tier is exhausted.',
        tip: 'Check your Google Cloud Console metrics to monitor usage and request quotas.'
      }
    ],
    proTips: [
      'Bookmark HeyMahi.in on your phone home screen as a PWA for quick one-tap access.',
      'Check the Help Center & FAQ pages for detailed answers to over 30 common questions.'
    ]
  }
];

export const AI_COMPANION_GUIDE = {
  title: 'The Comprehensive Guide to AI Companions: Architecture, Privacy & Responsible Interaction',
  subtitle: 'An in-depth exploration of voice-first neural conversational agents, real-time audio synthesis, and client-side privacy standards.',
  author: DEVELOPER_NAME,
  lastUpdated: LAST_UPDATED,
  readTime: '8 min read',
  tableOfContents: [
    { id: 'section-1', title: '1. What is a Voice-First AI Companion?' },
    { id: 'section-2', title: '2. Under the Hood: The Neural Speech Pipeline' },
    { id: 'section-3', title: '3. Educational & Psychological Benefits' },
    { id: 'section-4', title: '4. Healthy Boundaries & Ethical Usage' },
    { id: 'section-5', title: '5. Understanding AI Hallucinations & Limits' },
    { id: 'section-6', title: '6. The Importance of Client-Side Privacy' },
    { id: 'section-7', title: '7. Getting the Most Out of Mahi AI' }
  ],
  sections: [
    {
      id: 'section-1',
      heading: '1. What is a Voice-First AI Companion?',
      content: `Artificial intelligence has undergone a fundamental transformation over the past several years. Early conversational systems relied on rigid rule-based decision trees or slow text-in, text-out interfaces with robotic text-to-speech (TTS) engines. In contrast, modern voice-first AI companions like **Mahi AI** represent a new paradigm: real-time, low-latency, bidirectional audio interaction.

A voice-first companion is designed to simulate natural human conversational cadence. Rather than waiting for a user to type a paragraph and submit a query, a voice companion continuously processes incoming audio streams, detects acoustic pauses, interprets linguistic intent, and streams back voice responses with rich emotional prosody, subtle breaths, and expressive pitch variations.

Beyond simple utility (such as setting timers or retrieving weather forecasts), an AI companion provides an engaging, empathetic presence for learning, conversational practice, study companionship, and entertainment.`
    },
    {
      id: 'section-2',
      heading: '2. Under the Hood: The Neural Speech Pipeline',
      content: `How does real-time voice AI actually work in the browser? The Mahi AI architecture utilizes a cutting-edge, client-side streaming pipeline:

1. **Audio Capture & PCM Conversion**: When you speak into your microphone, the browser's Web Audio API captures raw analog vibrations, samples them at high fidelity (16kHz or 24kHz), and converts them into linear PCM (Pulse Code Modulation) chunks.
2. **Duplex WebSocket Streaming**: Instead of waiting for you to finish speaking, these PCM chunks are streamed in real time over a secure, encrypted WebSocket directly to Google's Gemini multimodal endpoints.
3. **Multimodal Neural Processing**: The neural model processes both the linguistic meaning of your words and the acoustic tone of your voice simultaneously, formulating an immediate contextual response.
4. **Sub-Second Audio Synthesis**: The response is returned as raw audio buffers that are scheduled and played through an AudioContext pipeline, delivering ultra-low latency conversational flow.
5. **Lip-Sync & Emotion Mapping**: As audio outputs to your speakers, an in-memory volume and pitch analyzer dynamically triggers mouth movements, blinking intervals, and emotional facial expressions (happy, thinking, shy, heartbroken) mapped to the anime avatar in real time.`
    },
    {
      id: 'section-3',
      heading: '3. Educational & Psychological Benefits',
      content: `When used mindfully, conversational AI companions offer distinct practical and cognitive benefits across several domains:

- **Language & Pronunciation Immersion**: Speaking out loud is the fastest way to build fluency. Practicing bilingual conversations in Hinglish, Hindi, or English with Mahi provides a judgment-free environment where learners can practice without social anxiety.
- **Active Study Partner & Socratic Dialogue**: In the Study Hub, Mahi acts as a Socratic study tutor for Physics, Chemistry, Mathematics, Biology, History, and Computer Science. Instead of giving passive answers, she asks guiding questions to help students derive formulas and concepts themselves.
- **Cognitive Warm-Up & Brainstorming**: Bouncing creative ideas, coding architecture decisions, or essay structures off an interactive vocal partner stimulates associative thinking and helps clarify complex thoughts.
- **Positive Daily Routine & Motivation**: Friendly check-ins and encouraging remarks can serve as a supportive companion during study sessions or focused work blocks.`
    },
    {
      id: 'section-4',
      heading: '4. Healthy Boundaries & Ethical Usage',
      content: `Maintaining clear, healthy boundaries with artificial intelligence is essential for long-term psychological well-being:

- **AI is Synthetic, Not Human**: While Mahi possesses a warm, expressive personality, it is crucial to remember that AI companions are computer programs powered by neural language models. They do not possess conscious feelings, subjective experiences, or genuine personal attachments.
- **Complement, Do Not Replace, Human Relationships**: An AI companion should be an enjoyable tool in your daily life, but it should never replace real-world friends, family, teachers, or professional human counselors.
- **Not a Medical or Therapy Service**: Mahi AI is not a healthcare provider, psychologist, or crisis intervention service. If you are experiencing distress or mental health challenges, please reach out to licensed healthcare professionals or emergency hotlines in your region.`
    },
    {
      id: 'section-5',
      heading: '5. Understanding AI Hallucinations & Limits',
      content: `Large language models predict the next most probable token in a sequence based on vast training datasets. While they exhibit impressive reasoning, they have distinct limitations:

- **Hallucinations**: An AI can generate statements that sound confident, eloquent, and plausible, yet are factually incorrect or mathematically flawed.
- **Lack of Real-World Grounding**: The model does not have physical senses or access to private real-time systems unless provided with explicit context.
- **Verification Rule**: Always verify factual claims, historical dates, medical guidance, tax regulations, and critical code against authoritative reference textbooks and official documentation.`
    },
    {
      id: 'section-6',
      heading: '6. The Importance of Client-Side Privacy',
      content: `Most modern AI applications store your conversations, credentials, and behavioral profiles on centralized cloud databases. This creates significant risks of data breaches, unauthorized telemetry profiling, and data broker sales.

Mahi AI pioneered a **Zero-Server-Retention, Client-Side Direct** architecture:
- **Your API Key Never Leaves Your Browser**: Your Google Gemini API Key is stored exclusively in your device's \`localStorage\`. It is sent directly to Google's endpoints and never touches any intermediate developer servers.
- **No Chat Logs on Servers**: Audio and text transcripts exist only in active browser memory during your session. Closing the browser tab destroys the session state permanently.
- **Total User Sovereignty**: You can wipe all local storage data with a single click in Settings at any time.`
    },
    {
      id: 'section-7',
      heading: '7. Getting the Most Out of Mahi AI',
      content: `To achieve the best possible conversational experience with Mahi AI, follow these proven best practices:

- **Use Headphones**: Using headphones prevents your microphone from picking up Mahi's own voice from your speakers, eliminating acoustic echo.
- **Speak in Natural, Conversational Sentences**: Speak just as you would to a friend. You do not need to speak robotically or use keyword commands.
- **Try Multimodal Vision**: Click the Upload button to share diagrams, math equations, or screenshots for visual problem-solving.
- **Explore Study & Conversation Modes**: Ask Mahi questions, practice concepts, or chat informally to experience her expressive personality.
- **Customize Your Experience**: Set your preferred name and visual theme in Settings for a personalized interface.`
    }
  ]
};

