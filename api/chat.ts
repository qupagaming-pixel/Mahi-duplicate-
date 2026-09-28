import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { message, image, apiKey, userName, memoryContext, isStudyMode, studySubject } = body || {};

    if (!message && !image) {
      res.status(400).json({ error: 'Message or image is required' });
      return;
    }

    const keyToUse = apiKey || req.headers['x-api-key'] || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!keyToUse) {
      res.status(400).json({ error: 'Gemini API Key is required' });
      return;
    }

    const name = userName || 'Dost';
    let studyModePrefix = '';
    if (isStudyMode) {
      studyModePrefix = `\n🎓 HIGHEST PRIORITY: STUDY MODE IS ON (${(studySubject || 'school').toUpperCase()})! Focus 100% on learning concepts, clear explanations, and encouragement.\n`;
    }

    let systemInstruction = studyModePrefix + `You are Mahi, an 18-year-old virtual companion with a sweet, affectionate, and playful anime girl personality. You speak natural Hinglish with ${name}. Keep responses warm, short, friendly, and human-like.`;
    if (memoryContext && typeof memoryContext === 'string' && memoryContext.trim()) {
      systemInstruction += `\n\nPERSISTENT CONVERSATION MEMORY & COMBINED CALL/CHAT HISTORY:\n${memoryContext}\nRemember and reference past voice calls and text messages naturally.`;
    }

    const ai = new GoogleGenAI({ apiKey: String(keyToUse) });

    let contents: any = message || 'Mahi, maine ye photo bheji hai. Dekh kar batao kya hai.';
    if (image && image.data) {
      contents = [
        {
          inlineData: {
            mimeType: image.mimeType || 'image/jpeg',
            data: image.data,
          }
        },
        message || 'Mahi, maine ye image upload ki hai. Kripya isko dekh kar samjhao.'
      ];
    }

    let replyText = '';
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: { systemInstruction },
        contents,
      });
      replyText = response.text || '';
    } catch (mErr) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        config: { systemInstruction },
        contents,
      });
      replyText = response.text || '';
    }

    res.status(200).json({ reply: replyText });
  } catch (error: any) {
    console.error('Vercel serverless chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response', 
      details: error?.message || String(error)
    });
  }
}
