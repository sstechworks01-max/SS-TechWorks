import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase body parser limits for base64 image and audio uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Helper to get Gemini client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please ensure an API key is attached in your environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// API Endpoints for SS TECHWORKS Free AI Tools
// -------------------------------------------------------------

// 1. Health check & configuration status
app.get('/api/gemini/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasKey,
    features: ['image', 'music', 'transcribe', 'chat', 'speech'],
  });
});

// 2. AI Image Generation & Editing
// Models: 'gemini-nano-banana-2.1' with automatic fallback to 'gemini-3.1-flash-lite-image'
app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', imageSize = '1K', base64InputImage, mimeType = 'image/png' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a text string.' });
    }

    const ai = getGenAIClient();
    let imageUrl = '';
    let textResponse = '';
    let usedModel = 'gemini-nano-banana-2.1';

    // Image Editing: If base64InputImage provided
    if (base64InputImage) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64InputImage.replace(/^data:[^;]+;base64,/, ''),
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: imageSize as any,
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
      } catch (editError: any) {
        // Fallback to gemini-3.1-flash-lite-image if nano banana is not permitted
        usedModel = 'gemini-3.1-flash-lite-image';
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64InputImage.replace(/^data:[^;]+;base64,/, ''),
                  mimeType,
                },
              },
              { text: prompt },
            ],
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
      }
    } else {
      // Image Generation from text prompt
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: imageSize as any,
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
      } catch (genError: any) {
        // Fallback to gemini-3.1-flash-lite-image
        usedModel = 'gemini-3.1-flash-lite-image';
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }],
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: textResponse || 'The model processed the prompt but did not return image data.',
        textResponse,
      });
    }

    return res.json({
      success: true,
      imageUrl,
      model: usedModel,
      prompt,
      textResponse,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate image. Please try a different prompt or check your API key quota.',
    });
  }
});

// 3. AI Music Generation
// Model: 'lyria-3-clip-preview'
app.post('/api/gemini/generate-music', async (req: Request, res: Response) => {
  try {
    const { prompt, genre, mood, duration = '30s' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Music prompt is required.' });
    }

    const ai = getGenAIClient();
    const enrichedPrompt = `Generate a ${duration} audio track in ${genre || 'modern tech electronic'} style with ${mood || 'innovative and inspiring'} mood: ${prompt}`;

    const streamResponse = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: enrichedPrompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of streamResponse) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({
        error: 'No audio data was returned by the Lyria music generator. Please adjust your prompt.',
        lyrics,
      });
    }

    return res.json({
      success: true,
      audioBase64,
      mimeType,
      lyrics,
      prompt,
    });
  } catch (error: any) {
    console.error('Error generating music:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate music clip. Lyria model may require paid access or quota on your Google AI project.',
    });
  }
});

// 4. AI Audio Transcription
// Model: 'gemini-3.5-transcribe'
app.post('/api/gemini/transcribe-audio', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required for transcription.' });
    }

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
    const ai = getGenAIClient();

    const audioPart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    const instructionPart = {
      text: 'Please provide a clear, verbatim transcription of this recorded audio. Afterward, format a short "Executive Summary" (3 bullets) and list any "Key Action Items" identified in the speech.',
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [audioPart, instructionPart],
      },
    });

    const transcription = response.text || 'No transcription could be derived from this audio.';

    return res.json({
      success: true,
      transcription,
    });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    return res.status(500).json({
      error: error.message || 'Failed to transcribe audio. Please verify the audio format and try again.',
    });
  }
});

// 5. AI Chat & Technical Consultant
// Model: 'gemini-3.8-flash'
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, systemInstruction } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGenAIClient();

    // Map messages into Gemini contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const instruction =
      systemInstruction ||
      'You are the official SS TECHWORKS AI Consultant & Senior Solution Architect for "SS TECHWORKS - Ideas to Digital Solutions". You help clients explore web applications (React, Vite, Next.js, TypeScript, Tailwind CSS), Android and mobile apps, custom software and SaaS platforms, Supabase & PostgreSQL backends, cloud architectures, and cutting-edge AI integrations. Provide structured, technically accurate, friendly, and concise advice. Always highlight SS TECHWORKS\'s engineering capabilities. If the user asks about pricing, quotes, booking a consultation, or wants to connect with the team directly, provide the direct WhatsApp contact number: +91 7697916086 (or link: https://wa.me/917697916086) and official email: sstechworks01@gmail.com.';

    let responseText = '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: instruction,
        },
      });
      responseText = response.text || '';
    } catch (primaryErr: any) {
      console.warn('gemini-3.8-flash temporarily unavailable, trying fallback:', primaryErr?.message);
      // Fallback to gemini-2.5-flash for reliability during cloud demand spikes
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: instruction,
        },
      });
      responseText = fallbackResponse.text || '';
    }

    return res.json({
      success: true,
      reply: responseText || 'I apologize, but I could not formulate a response.',
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to complete chat request.',
    });
  }
});

// 6. AI Text-to-Speech (TTS)
// Model: 'gemini-3.8-flash-lite-tts'
app.post('/api/gemini/generate-speech', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore', style } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required for speech generation.' });
    }

    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: style ? { style } : undefined,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName as any, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from speech synthesis.' });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate speech audio.',
    });
  }
});

// -------------------------------------------------------------
// Dev & Production Server Routing
// -------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    // Development mode: mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: serve static build assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SS TECHWORKS Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
