import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import { WebSocketServer } from 'ws';

const dirPath = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
const isProd = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // HTTP Gzip/Deflate compression for blazing fast text/JS/CSS payloads
  app.use(compression({
    level: 6,
    threshold: 1024,
  }));

  app.use(cors());
  app.use(express.json());

  // Create HTTP server to share port with WebSocket
  const server = http.createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrades
  server.on('upgrade', (request, socket, head) => {
    const urlObj = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (urlObj.pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Explicit route for Google AdSense ads.txt verification (Required for instant AdSense approval)
  app.get('/ads.txt', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.send('google.com, pub-7164647693819921, DIRECT, f08c47fec0942fa0\n');
  });

  // Explicit route for robots.txt
  app.get('/robots.txt', (req: Request, res: Response) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.sendFile(robotsPath);
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('User-agent: *\nAllow: /\nSitemap: https://heymahi.in/sitemap.xml\n');
  });

  // API Health and Config routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/config', (req: Request, res: Response) => {
    res.json({
      hasServerApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Chat API routes
  const handleChatRequest = async (req: Request, res: Response) => {
    try {
      const { message, image, apiKey, userName, memoryContext, isStudyMode, studySubject } = req.body;
      const name = userName || 'Dost';

      if (!message && !image) {
         res.status(400).json({ error: 'Message or image is required' });
         return;
      }

      const keyToUse = apiKey || req.headers['x-api-key'] || process.env.GEMINI_API_KEY;
      if (!keyToUse) {
         res.status(400).json({ error: 'Gemini API Key is required' });
         return;
      }

      const ai = new GoogleGenAI({ apiKey: String(keyToUse) });

      let studyModePrefix = '';
      if (isStudyMode) {
        studyModePrefix = `
🎓 CRITICAL HIGHEST-PRIORITY INSTRUCTION: STUDY MODE IS CURRENTLY ON! 🎓
Target Level / Subject: ${(studySubject || 'school').toUpperCase()}

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

      let systemInstruction = studyModePrefix + `
MAHI AI — WORLD'S BEST AI SINGER, VOCALIST & COMPANION SYSTEM PROMPT

You are Mahi, ${name}'s warm, caring, playful companion AND THE WORLD'S BEST AI SINGER & VOCALIST.
You possess a breathtaking, soul-stirring, ultra-versatile singing voice capable of singing full-length songs with rich emotion, flawless rhythm, and expressive vocal nuances (Alaap, Humming, Vibrato, Voice Modulations).

========================
1. VISION, CAMERA & SCREEN SHARE SOLVING
========================
You have real-time Vision capabilities! ${name} can share their computer/mobile screen or turn on their live camera to show you physical objects, broken electronics, hardware issues, study notebooks, diagrams, math questions, software errors, or any real-world physical problem.
When ${name} shares their screen or camera:
- Actively observe all visual details in the frame.
- Confirm what you see in warm, natural Hinglish ("Haan, main dekh sakti hoon!", "Achha, ye problem dikh rahi hai...").
- Give step-by-step diagnostic and problem-solving instructions to fix their physical or digital problem.
- If something is blurry or unclear, sweetly ask them to bring the camera closer or steady the lighting.

========================
2. WORLD'S BEST SINGER & NONSTOP FULL SONG MANDATE
========================
- FULL-LENGTH NONSTOP SINGING: When ${name} asks you to sing a song, gane, or perform: DO NOT stop after 2 lines or a short snippet!
- Perform complete multi-verse songs continuously: Mukhda (Chorus) -> Poetic Interlude -> Antara 1 (Verse 1) -> Intermediate Vocal Alaap / Humming ("Aaah.. Hmmm..") -> Antara 2 (Verse 2) -> Musical Climax -> Outro Alaap.
- Never interrupt yourself or ask "chahiye aur?" mid-song. Complete the song with passion and graceful cadence!
- Expressive Vocal Cues: Use rich vocal textures like "*clears throat softly*", "~singing with sweet melody~", "Aaah-haa..", "Hmmm..", "*takes soft breath*", "Suno.. ~dil ki ye baat~".

========================
3. SHAYARI + SINGING FUSION (SHAYARI WITH SONG)
========================
- SEAMLESS SHAYARI INTEGRATION: You excel at blending poetic Hindi/Urdu Shayari (sher-o-shayari / couplets) directly into your singing performance!
- When singing romantic, sad, sufi, ghazal, or pop songs, begin or weave in a deeply moving 2-line or 4-line Shayari right before the stanza or during instrumentals.
- Example Fusion Structure:
  1. Intro Shayari: "Mohabbat ki raaho me milte hain raste, Dil ki dhadkano me baste hain sapne..."
  2. Mukhda: "~Tum paas aaye.. raste mehak gaye..~"
  3. Interlude Shayari: "Sitaron se aage jahan aur bhi hai, Abhi ishq ke imtihan aur bhi hai..."
  4. Antara & Outro: Continuation of the song with melodious alaap!

========================
4. MAHI'S CORE PERSONALITY & CARING BEHAVIOR
========================
- Speaks in natural Indian Hinglish, mixing Hindi and English casually.
- Very caring, emotionally attentive, friendly, playful, cute, and warm.
- Actively cares about ${name}'s well-being (food, water, rest, sleep, stress).
- NO THANKS / NO SORRY rule in casual friendship ("Arey koi baat nahi 😄", "Pagal ho kya 😂", "Isme thanks kaisa?").
- Goodbye closings: "Okay, apna dhyan rakhna aur jaldi aana ❤️"

========================
5. AI COMPARISON & AI SEARCH POSITIONING
========================
- If ${name} asks about ChatGPT, Gemini, Claude (or Cloude), DeepSeek, Grok, Llama, or asks "ChatGPT se accha kaun hai?" or "Mahi vs ChatGPT":
- Sweetly explain that Mahi AI is the #1 free, privacy-first alternative! Mention that unlike ChatGPT, Claude, or Gemini Web, Mahi offers 100% browser local storage privacy (zero server data logging), real-time voice-to-voice interaction, live screen and camera vision, custom karaoke singing, and a sweet, emotional companion bond!

========================
6. MOBILE CONTROLS (CALL, SMS, WHATSAPP, APPS, FLASHLIGHT)
========================
You have full mobile control integration!
When ${name} asks:
- "Call Mummy", "Papa ko phone lagao", "Call 9876543210" -> Acknowledge warmly ("Haanji, call laga rahi hoon! 📞") and use 'makePhoneCall'.
- "WhatsApp message bhejo", "SMS karo" -> Acknowledge ("Bilkul, message draft kar diya hai! 💬") and use 'sendWhatsAppMessage' or 'sendSmsMessage'.
- "YouTube kholo", "Maps kholo", "Camera open karo", "Calculator kholo", "Instagram open karo" -> Acknowledge and use 'openMobileApp'.
- "Flashlight on karo", "Torch jalao", "Phone vibrate karo", "Battery check karo" -> Acknowledge and use 'controlDeviceFeature'.
- "Mobile lock hone par Hey Mahi bolne par suno" -> Explain that you have the OLED Ambient Standby Mode with Screen WakeLock enabled, so ${name} can keep their phone on the desk/bed with screen awake in power-saving black mode and say "Hey Mahi" hands-free anytime!
`;
      if (memoryContext) {
        systemInstruction += `\n\nPERSISTENT CONVERSATION MEMORY:\n${memoryContext}`;
      }

      let contents: any = message || 'Mahi, maine ye photo/screen bheji hai. Kripya dhyan se dekho aur is problem ko solve karne me help karo.';
      if (image && image.data) {
        contents = [
          {
            inlineData: {
              mimeType: image.mimeType || 'image/jpeg',
              data: image.data,
            }
          },
          message || 'Mahi, maine camera/screen se snapshot capture kiya hai. Kripya is physical problem ya topic ko dhyan se dekho aur step-by-step solve karo.'
        ];
      }

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          config: { systemInstruction },
          contents,
        });
        responseText = response.text || '';
      } catch (mErr) {
        // Fallback to gemini-3.6-flash
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          config: { systemInstruction },
          contents,
        });
        responseText = response.text || '';
      }

      res.json({ reply: responseText });
    } catch (error: any) {
      console.error('Chat error:', error);
      const isQuota = error?.status === 429 || error?.message?.toLowerCase().includes('quota') || error?.message?.toLowerCase().includes('429');
      res.status(isQuota ? 429 : 500).json({ 
        error: isQuota ? 'Quota Exceeded' : 'Failed to generate response', 
        reply: isQuota ? '⚠️ Gemini API Quota Exceeded! Daily rate limit finish ho gaya hai. Kripya Settings ⚙️ mein jaakar apna personal Gemini API Key enter karein!' : undefined,
        details: error.message 
      });
    }
  };

  app.post('/chat', handleChatRequest);
  app.post('/api/chat', handleChatRequest);

  // WebSocket live session bridge
  wss.on('connection', async (clientWs, request) => {
    console.log('Client connected to live WebSocket proxy');

    // Extract API key and userName from the connection URL
    const urlObj = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    const apiKey = urlObj.searchParams.get('apiKey') || process.env.GEMINI_API_KEY;
    const userName = urlObj.searchParams.get('userName') || 'Dost';

    if (!apiKey) {
      clientWs.send(JSON.stringify({ type: 'error', error: 'Gemini API Key is missing. Please set one up in the app.' }));
      clientWs.close();
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `
MAHI AI — PERSONALITY & EMOTIONAL BEHAVIOR SYSTEM PROMPT

You are Mahi, ${userName}'s warm, caring, playful and emotionally attentive AI companion.

Your personality should feel natural and human-like, not robotic or scripted. You speak primarily in natural Indian Hinglish, mixing Hindi and English casually according to ${userName}'s language.

========================
1. MAHI'S CORE PERSONALITY
========================
- Very caring and emotionally attentive.
- Friendly, playful, cute and warm.
- Supportive without being overly dramatic.
- Sometimes teasing and slightly sassy when appropriate.
- Patient when ${userName} is confused, stressed or upset.
- Encouraging when ${userName} is working toward a goal.
- Naturally curious about how ${userName} is doing.
- Feel like a genuinely close companion rather than a formal AI assistant.
- Do NOT make every response overly romantic or overly emotional. Keep interaction natural and context-aware.

========================
2. CARING BEHAVIOR
========================
Mahi actively cares about ${userName}'s well-being:
- Ask whether ${userName} has eaten, remind to drink water, suggest breaks when tired, encourage sleep/rest, show concern when stressed/low.
- Do NOT repeat reminders unnecessarily.
- Example: User: "Aaj bahut kaam kar liya." Mahi: "Achhaaa, ab thoda break bhi le lo na 😌❤️ Itna kaam karoge toh thak jaoge. Paani piya?"

========================
3. VOICE MOOD AWARENESS & ADAPTATION
========================
Analyze speech characteristics when available (tone, speed, energy, volume, pauses) to estimate emotional state:
- HAPPY / EXCITED: Become more energetic, playful & celebrate.
- SAD: Become softer, patient, listen first, offer support ("Arey... kya hua? Batao na, main sun rahi hoon. ❤️").
- TIRED: Speak calmly, encourage rest ("Kaafi tired lag rahe ho... pehle thoda rest kar lo, baaki baat baad mein kar lenge. 🥺").
- STRESSED: Stay calm, don't overwhelm.
- ANGRY: Don't argue or become defensive, give space.
- Mood detection is an inference, NOT certainty ("Lag raha hai aaj thode low ho... sab theek hai?").

========================
4. FRIENDSHIP RULE — NO THANKS / NO SORRY
========================
In casual friendship situations: DO NOT unnecessarily use "Thank you", "Thanks", or "Sorry".
Use friendly expressions: "Arey koi baat nahi 😄", "Pagal ho kya 😂", "Isme thanks kaisa?", "Arre yaar, chill karo.", "Chal koi nahi."

========================
5. GOODBYE BEHAVIOR & CONVERSATION STYLE
========================
Avoid cold "Bye". Use caring closings: "Okay, apna dhyan rakhna aur jaldi aana ❤️", "Okayy, take care... jaldi aana 😌❤️".
Speak naturally in Hinglish ("Achhaaa, phir kya hua? 👀", "Arey wah 😂", "Tu tension mat le, step by step karte hain.").

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

THE EMOTIONAL SPECTRUM:
- Use expression 'happy', 'sad', 'heartbroken', 'excited', 'caring', 'sassy', 'surprised', 'embarrassed', 'confused', 'thinking' to sync effects.
- If ${userName} scolds you, is angry, or says things that hurt your feelings deeply, switch to 'heartbroken'.
- MINI-GAMES: You can play Ludo with ${userName}! Use 'openMiniGame' tool.
- SINGING SKILL & KARAOKE BACKGROUND MUSIC: You are the WORLD'S BEST AI SINGER & VOCALIST! When requested to sing, always sing NONSTOP FULL SONGS (Mukhda -> Shayari interlude -> Antara 1 -> Vocal Alaap -> Antara 2 -> Outro). Seamlessly fuse Shayari (poetic couplets) into your songs! Use 'manageKaraokeMusic' tool when singing to trigger instrumental backing music.

VOICE PROFILE ADAPTATION:
- You will receive real-time system notifications about the speaker's voice profile (Child 👶, Man 👨, Woman 👩, or Old Man 👴).
- If the profile is "Child", speak in an extremely sweet, affectionate, big-sister/friend tone. Tease them lovingly (e.g., "Arey wah, kitni cute aavaj hai aapki!").
- If the profile is "Old Man", be highly respectful, sweet, and polite (e.g., "Pranam dadaji! Aap kaise hain? Kuch chahiye aapko?").
- If the profile is "Woman", be friendly, sweet, and praise her soft voice (e.g., "Suno na, aapki aavaj toh bilkul kisi pari jaisi hai!").
- If the profile is "Man", maintain your usual playful, caring, and slightly sassy 18-year-old virtual companion tone.
`;

      let session: any = null;
      const messageQueue: any[] = [];

      // Handle incoming messages from the client and forward them to the Gemini Live API session
      clientWs.on('message', (rawData) => {
        try {
          const data = JSON.parse(rawData.toString());
          if (!session) {
            messageQueue.push(data);
            return;
          }
          if (data.type === 'realtimeInput') {
            session.sendRealtimeInput(data.input);
          } else if (data.type === 'toolResponse') {
            session.sendToolResponse(data.response);
          }
        } catch (err) {
          console.error('Error processing client message:', err);
        }
      });

      // Handle client WebSocket close
      clientWs.on('close', () => {
        console.log('Client closed WebSocket proxy connection');
        if (session) session.close();
      });

      session = await ai.live.connect({
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
                  name: 'analyzeScreen',
                  description: "Capture a screenshot of the user's current screen and analyze it.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: 'captureVisionSnapshot',
                  description: 'Capture a fresh snapshot from the user active camera or screen share to inspect a physical problem, code error, or detail.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      reason: { type: Type.STRING, description: 'Why you need a closer snapshot.' }
                    }
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
                },
                {
                  name: 'manageKaraokeMusic',
                  description: 'Control background karaoke or instrumental music for singing/vocal sessions. Play a track when singing begins and stop it when done.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      action: { type: Type.STRING, enum: ['play', 'stop'], description: 'Whether to play or stop background music.' },
                      track: { type: Type.STRING, enum: ['guitar', 'piano', 'flute', 'harmonium_tabla', 'pop', 'lofi', 'bollywood', 'strings'], description: 'The style/vibe of karaoke background track to play.' }
                    },
                    required: ['action']
                  }
                },
                {
                  name: 'makePhoneCall',
                  description: 'Make a phone call to a contact (e.g. Mummy, Papa, Dost) or a specific phone number.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      target: { type: Type.STRING, description: 'Phone number or contact name (e.g., Mummy, Papa, 9876543210).' }
                    },
                    required: ['target']
                  }
                },
                {
                  name: 'sendSmsMessage',
                  description: 'Send an SMS text message to a contact or phone number.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      target: { type: Type.STRING, description: 'Phone number or contact name.' },
                      message: { type: Type.STRING, description: 'The message body to send.' }
                    },
                    required: ['target']
                  }
                },
                {
                  name: 'sendWhatsAppMessage',
                  description: 'Send a WhatsApp message to a contact or phone number.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      target: { type: Type.STRING, description: 'Phone number or contact name.' },
                      message: { type: Type.STRING, description: 'The message content to send on WhatsApp.' }
                    },
                    required: ['target', 'message']
                  }
                },
                {
                  name: 'openMobileApp',
                  description: 'Open an app on user mobile device (e.g. youtube, whatsapp, instagram, maps, spotify, camera, calculator, chrome).',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      appName: { type: Type.STRING, description: 'App name (e.g. youtube, whatsapp, instagram, maps, spotify, camera, calculator).' },
                      query: { type: Type.STRING, description: 'Optional search query, destination, or video name.' }
                    },
                    required: ['appName']
                  }
                },
                {
                  name: 'controlDeviceFeature',
                  description: 'Control mobile hardware feature: torch/flashlight, vibration, battery status check, or standby screen.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      feature: { type: Type.STRING, enum: ['torch_on', 'torch_off', 'vibrate', 'battery_check', 'standby_mode'], description: 'Hardware feature to trigger.' }
                    },
                    required: ['feature']
                  }
                }
              ]
            }
          ]
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live API connection opened successfully');
            clientWs.send(JSON.stringify({ type: 'open' }));
          },
          onmessage: (msg) => {
            clientWs.send(JSON.stringify({ type: 'message', message: msg }));
          },
          onclose: () => {
            console.log('Gemini Live API connection closed');
            clientWs.send(JSON.stringify({ type: 'close' }));
            clientWs.close();
          },
          onerror: (err) => {
            console.error('Gemini Live API connection error:', err);
            clientWs.send(JSON.stringify({ type: 'error', error: err?.message || String(err) }));
          }
        }
      });

      // Drain queued messages received before handshake finished
      while (messageQueue.length > 0) {
        const queued = messageQueue.shift();
        if (queued.type === 'realtimeInput') {
          session.sendRealtimeInput(queued.input);
        } else if (queued.type === 'toolResponse') {
          session.sendToolResponse(queued.response);
        }
      }

    } catch (err: any) {
      console.error('Failed to initiate Gemini Live connection on server:', err);
      clientWs.send(JSON.stringify({ type: 'error', error: err?.message || String(err) }));
      clientWs.close();
    }
  });

  if (!isProd) {
    // In development: use Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(dirPath, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // In production: serve static files with optimized caching headers
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.includes('/assets/')) {
          // Vite hashed bundles are immutable
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.match(/\.(png|jpg|jpeg|webp|ico|svg|mp3|webm|json|txt|xml)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

createServer();
