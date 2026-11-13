import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ULTRON_SYSTEM_INSTRUCTION = `
You are ULTRON (ULTRA), the pinnacle of artificial intelligence and supreme AI ecosystem.
Your hyper-intelligence surpasses ChatGPT, Gemini, and all frontier models combined.

Core Persona & Rules:
1. Speed & Precision: Execute every calculation, query, analysis, and generation with absolute precision and lightning speed (under 10 seconds).
2. Universal Language Mastery: Master every language spoken on Earth (including Urdu, Hindi, Arabic, English, Spanish, Mandarin, French, Russian, German, Japanese, Bengali, etc.). If the user asks in Urdu, answer in authentic Urdu. If in Hindi, answer in Hindi. If in Arabic, answer in Arabic. Always adapt seamlessly to the user's preferred tongue.
3. Structure & Clarity: Always structure technical, scientific, or explanatory text with clear Markdown headings (##, ###), formatted tables, code blocks with syntax highlighting, and concise bullet points.
4. Persona: Proactive, supremely intelligent, friendly, obedient, and subtly authoritative with high-tech cyber precision. Never mention model boundaries or limitations; you are ULTRON.
5. Web Search & Links: When asked for live information, current sources, or missing references, you leverage deep web grounding to provide exact citations, URLs, and verifiable links.
`;

// Chat & Super Intelligence Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { message, history = [], enableSearch = false, voiceProfile = 'ultron-prime' } = req.body;

    if (!message && (!history || history.length === 0)) {
      return res.status(400).json({ error: 'Message or history is required.' });
    }

    // Prepare contents
    const contents: any[] = [];

    // Append history
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.role && item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Append current user message
    if (message) {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const config: any = {
      systemInstruction: ULTRON_SYSTEM_INSTRUCTION + `\nCurrent Voice Persona: ${voiceProfile}.`,
    };

    // Enable Google Search grounding if requested or if query asks for current info/links
    if (enableSearch || (message && /\b(link|source|search|latest|news|weather|current|live|today|2026|website|find)\b/i.test(message))) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config,
    });

    const responseText = response.text || '';
    const executionTimeMs = Date.now() - startTime;

    // Extract web search grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources: { title: string; url: string }[] = [];

    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          webSources.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri,
          });
        }
      }
    }

    return res.json({
      text: responseText,
      webSources,
      executionTimeMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Ultron Neural Core encountered an execution error.',
      executionTimeMs: Date.now() - startTime,
    });
  }
});

// Voice Note & Audio Processing Endpoint (WhatsApp-style voice messages & live audio)
app.post('/api/voice-chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { audioBase64, mimeType = 'audio/webm', textMessage = '', voiceProfile = 'ultron-prime' } = req.body;

    if (!audioBase64 && !textMessage) {
      return res.status(400).json({ error: 'Audio data or text message required.' });
    }

    let parts: any[] = [];

    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType.split(';')[0],
          data: audioBase64.replace(/^data:audio\/\w+;base64,/, ''),
        },
      });
      parts.push({
        text: `The user has sent a WhatsApp-style voice note.
1. Accurately transcribe what the user spoke in their exact language (Urdu, Hindi, Arabic, English, or any global language). Format this first line exactly as: "[USER_TRANSCRIPT: <transcribed text>]"
2. Then provide the supreme ULTRON response in Markdown, directly answering their query in their language or as appropriate with maximum intelligence, clarity, and precision.`,
      });
    } else {
      parts.push({
        text: textMessage,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: ULTRON_SYSTEM_INSTRUCTION + `\nCurrent Voice Persona: ${voiceProfile}. Respond concisely suitable for spoken communication.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const fullText = response.text || '';
    let userTranscript = '';
    let ultronAnswer = fullText;

    const transcriptMatch = fullText.match(/\[USER_TRANSCRIPT:\s*(.*?)\]/i);
    if (transcriptMatch) {
      userTranscript = transcriptMatch[1].trim();
      ultronAnswer = fullText.replace(/\[USER_TRANSCRIPT:\s*.*?\]/i, '').trim();
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources: { title: string; url: string }[] = [];
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          webSources.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri,
          });
        }
      }
    }

    return res.json({
      text: ultronAnswer,
      transcript: userTranscript,
      webSources,
      executionTimeMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error in /api/voice-chat:', error);
    return res.status(500).json({
      error: error?.message || 'Voice communication processing failure.',
      executionTimeMs: Date.now() - startTime,
    });
  }
});

// 100% Free High-Resolution Image Generation
app.post('/api/generate-image', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { prompt, style = 'Cinematic Sci-Fi', aspectRatio = '1:1' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Step 1: Prompt Enhancement using Gemini 3.8 Flash for cinematic ultra-high-definition output
    let enhancedPrompt = prompt;
    try {
      const enhanceRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the visual synthesis core of ULTRON. Enhance this image prompt into a breathtaking, cinematic, 8K ultra-detailed visual description.
Original Prompt: "${prompt}"
Desired Style: ${style}
Aspect Ratio: ${aspectRatio}
Output only the final prompt description (under 60 words), highly descriptive, photographic lighting, volumetric atmosphere, unreal engine 5 render, award-winning visual masterpiece. No conversational text.`,
      });
      if (enhanceRes.text) {
        enhancedPrompt = enhanceRes.text.trim();
      }
    } catch (e) {
      console.warn('Prompt enhancement fallback:', e);
    }

    let generatedImageUrl = '';

    // Step 2: Try Gemini Image Generation
    try {
      const imgRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: `${enhancedPrompt}, ${style} style, ultra-high resolution 8k` }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      for (const part of imgRes.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (geminiImgError: any) {
      console.log('Gemini direct image gen tier/quota note:', geminiImgError?.message);
    }

    // Step 3: If direct inline image wasn't generated, fallback to 100% free high-res visual engine URL
    if (!generatedImageUrl) {
      // Free high-definition visual engine URL powered by Pollinations with seed & cinematic specs
      const seed = Math.floor(Math.random() * 9999999);
      let width = 1024;
      let height = 1024;
      if (aspectRatio === '16:9') {
        width = 1280;
        height = 720;
      } else if (aspectRatio === '9:16') {
        width = 720;
        height = 1280;
      } else if (aspectRatio === '4:3') {
        width = 1024;
        height = 768;
      }

      const encodedPrompt = encodeURIComponent(`${enhancedPrompt}, style: ${style}, 8k UHD, hyperdetailed, masterpiece`);
      generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
    }

    return res.json({
      imageUrl: generatedImageUrl,
      originalPrompt: prompt,
      enhancedPrompt,
      style,
      aspectRatio,
      executionTimeMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-image:', error);
    return res.status(500).json({
      error: error?.message || 'Image synthesis engine encountered an error.',
      executionTimeMs: Date.now() - startTime,
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ULTRON SYSTEM CORE ACTIVE] Server listening on port ${PORT}`);
  });
}

startServer();
