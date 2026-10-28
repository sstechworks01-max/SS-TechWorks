/**
 * Centralized API service for SS TECHWORKS Free AI Tools.
 * Calls server-side proxy routes to ensure Gemini API key remains secure on the server.
 */

export interface ImageGenerationParams {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  imageSize?: '1K' | '2K';
  base64InputImage?: string;
  mimeType?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl: string;
  model: string;
  prompt: string;
  textResponse?: string;
}

export interface MusicGenerationParams {
  prompt: string;
  genre?: string;
  mood?: string;
  duration?: string;
}

export interface MusicGenerationResult {
  success: boolean;
  audioBase64: string;
  mimeType: string;
  lyrics?: string;
  prompt: string;
}

export interface TranscriptionParams {
  audioBase64: string;
  mimeType?: string;
}

export interface TranscriptionResult {
  success: boolean;
  transcription: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatParams {
  messages: ChatMessage[];
  systemInstruction?: string;
}

export interface ChatResult {
  success: boolean;
  reply: string;
}

export interface SpeechParams {
  text: string;
  voiceName?: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  style?: string;
}

export interface SpeechResult {
  success: boolean;
  audioBase64: string;
  mimeType: string;
}

// 1. Check server API health
export async function checkGeminiHealth(): Promise<{ hasKey: boolean; status: string }> {
  try {
    const res = await fetch('/api/gemini/health');
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return { hasKey: false, status: 'error' };
  }
}

// 2. Generate Image
export async function generateAIImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const res = await fetch('/api/gemini/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate image');
  }
  return data;
}

// 3. Generate Music
export async function generateAIMusic(params: MusicGenerationParams): Promise<MusicGenerationResult> {
  const res = await fetch('/api/gemini/generate-music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate music');
  }
  return data;
}

// 4. Transcribe Audio
export async function transcribeAudio(params: TranscriptionParams): Promise<TranscriptionResult> {
  const res = await fetch('/api/gemini/transcribe-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to transcribe audio');
  }
  return data;
}

// 5. Send Chat Message
export async function sendAIChat(params: ChatParams): Promise<ChatResult> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Chat request failed');
  }
  return data;
}

// 6. Generate Speech
export async function generateAISpeech(params: SpeechParams): Promise<SpeechResult> {
  const res = await fetch('/api/gemini/generate-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Speech generation failed');
  }
  return data;
}
