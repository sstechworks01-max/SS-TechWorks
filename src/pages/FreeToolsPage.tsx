import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ImageIcon,
  Music,
  Mic,
  MicOff,
  MessageSquare,
  Volume2,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  RefreshCw,
  Send,
  UploadCloud,
  AlertCircle,
  Wand2,
  ArrowRight,
  Layers,
  Cpu,
  WhatsAppIcon,
} from '../components/common/IconHelper';
import { companyInfo } from '../data/companyData';
import {
  generateAIImage,
  generateAIMusic,
  transcribeAudio,
  sendAIChat,
  generateAISpeech,
  checkGeminiHealth,
  ChatMessage,
} from '../lib/geminiApi';

type ToolTab = 'image' | 'music' | 'transcribe' | 'chat' | 'speech';

export const FreeToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('image');
  const [apiStatus, setApiStatus] = useState<{ hasKey: boolean; checked: boolean }>({
    hasKey: true,
    checked: false,
  });

  useEffect(() => {
    checkGeminiHealth().then((res) => {
      setApiStatus({ hasKey: res.hasKey, checked: true });
    });
  }, []);

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SS TECHWORKS AI INNOVATION LAB</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-600 text-white font-bold uppercase tracking-wider">
            100% Free
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Free Next-Gen <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">AI Tools</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Experience the bleeding edge of artificial intelligence. Create studio-grade images, compose original music tracks, transcribe voice notes, chat with technical architects, and synthesize natural speech.
        </p>

        {!apiStatus.hasKey && apiStatus.checked && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Server Gemini API key is initializing or can be attached in Settings &gt; Secrets.</span>
          </div>
        )}
      </div>

      {/* Modern Tabs Bar */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'image'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('music')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'music'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Music Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('transcribe')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'transcribe'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Audio Transcriber</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Tech Architect</span>
        </button>

        <button
          onClick={() => setActiveTab('speech')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'speech'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Voice & Speech</span>
        </button>
      </div>

      {/* Main Tool Container */}
      <div className="bg-white dark:bg-[#0c101c] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
        {activeTab === 'image' && <ImageStudioTab />}
        {activeTab === 'music' && <MusicStudioTab />}
        {activeTab === 'transcribe' && <TranscribeStudioTab />}
        {activeTab === 'chat' && <ChatStudioTab />}
        {activeTab === 'speech' && <SpeechStudioTab />}
      </div>
    </div>
  );
};

// =========================================================================
// 1. IMAGE STUDIO TAB
// =========================================================================
const ImageStudioTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K'>('1K');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imageUrl: string; prompt: string; model: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePrompts = [
    'Futuristic corporate AI laboratory with floating holographic interfaces and cyan neon accents',
    'Minimalist 3D glass isometric mobile application icon for a fintech platform, 8k render',
    'Sleek autonomous electric hypercar navigating neon-lit streets of Tokyo at twilight',
    'Modern tech startup founders brainstorming in front of a giant curved panoramic monitor',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await generateAIImage({
        prompt: prompt.trim(),
        aspectRatio,
        imageSize,
        base64InputImage: inputImage || undefined,
      });
      setResult({
        imageUrl: res.imageUrl,
        prompt: res.prompt,
        model: res.model,
      });
    } catch (err: any) {
      setError(err.message || 'Image generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wand2 className="w-5 h-5 text-blue-500" />
            AI Image Generator & Editor
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate ultra high-resolution visual assets or edit existing images with text prompts.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          <Cpu className="w-3.5 h-3.5" />
          <span>Nano Banana 2.1 Engine</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Creative Prompt
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate in detail (lighting, materials, composition, style)..."
              className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Quick Prompt Ideas */}
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
              Try a sample prompt:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 transition-colors text-left"
                >
                  {p.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          {/* Configuration options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1:1">1:1 (Square)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Story / Reel)</option>
                <option value="4:3">4:3 (Desktop)</option>
                <option value="3:4">3:4 (Portrait)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Resolution
              </label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1K">1K High Definition</option>
                <option value="2K">2K Ultra Crisp</option>
              </select>
            </div>
          </div>

          {/* Optional Reference Image for Editing */}
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Optional: Upload Image to Edit
                </span>
              </div>
              {inputImage && (
                <button
                  type="button"
                  onClick={() => setInputImage(null)}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            {inputImage ? (
              <div className="mt-2.5 flex items-center gap-3">
                <img
                  src={inputImage}
                  alt="Reference"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs text-slate-500">Image attached for AI modification</span>
              </div>
            ) : (
              <div className="mt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Choose an image from your computer to modify
                </button>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating High-Resolution Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{inputImage ? 'Edit & Transform Image' : 'Generate Image Now'}</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Right Output Preview Column */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[360px] p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="text-center space-y-3 py-16">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto animate-pulse">
                <Wand2 className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Rendering image with Gemini Nano Banana...
              </p>
              <p className="text-xs text-slate-500">Synthesizing high fidelity details and lighting</p>
            </div>
          ) : result ? (
            <div className="w-full space-y-3">
              <div className="relative group rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-md">
                <img
                  src={result.imageUrl}
                  alt={result.prompt}
                  className="w-full max-h-[460px] object-contain mx-auto"
                />
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500 truncate max-w-xs">{result.prompt}</span>
                <a
                  href={result.imageUrl}
                  download={`sstechworks-ai-${Date.now()}.png`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">No image generated yet</p>
              <p className="text-xs max-w-xs mx-auto">
                Enter your prompt on the left and click "Generate Image Now" to create original visual assets.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. MUSIC STUDIO TAB (Lyria)
// =========================================================================
const MusicStudioTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Cyberpunk Synthwave');
  const [mood, setMood] = useState('Futuristic & Inspiring');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const genres = [
    'Cyberpunk Synthwave',
    'Ambient Tech Chill',
    'Epic Cinematic Orchestral',
    'Lofi Coding Beats',
    'Modern Corporate Inspiring',
    'Deep House Electronic',
  ];

  const moods = [
    'Futuristic & Inspiring',
    'Focused & Relaxing',
    'High Energy & Bold',
    'Dramatic & Mysterious',
    'Uplifting & Positive',
  ];

  const samplePrompts = [
    'Pulsing synthesizers with deep sub-bass and crisp cyber percussion for a tech product launch',
    'Calm ambient pads with gentle guitar arpeggios ideal for late-night software engineering',
    'Epic swelling orchestral strings transitioning into futuristic electronic drops',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setLyrics(null);
    setIsPlaying(false);

    try {
      const res = await generateAIMusic({
        prompt: prompt.trim(),
        genre,
        mood,
        duration: '30s',
      });

      // Convert base64 to playable Blob URL
      const byteCharacters = atob(res.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: res.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setLyrics(res.lyrics || null);
    } catch (err: any) {
      setError(err.message || 'Music generation failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Music className="w-5 h-5 text-indigo-500" />
            AI Music Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compose original musical tracks, intros, and thematic soundscapes using Google Lyria.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lyria 3 Preview Model</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Track Prompt & Theme
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the musical atmosphere, instruments, tempo, and emotional vibe..."
              className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
              Try a sample track idea:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 transition-colors text-left"
                >
                  {p.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Musical Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Atmosphere & Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {moods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Composing Audio with Lyria Engine...</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                <span>Compose AI Music Track</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Right Output Player Column */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[360px] p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="text-center space-y-4 py-16">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto animate-pulse">
                <Music className="w-7 h-7 animate-bounce" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Generating 30s audio composition...
              </p>
              <div className="flex justify-center items-center gap-1.5 h-6">
                {[40, 70, 30, 90, 50, 80, 60, 100, 45, 85].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-indigo-500 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          ) : audioUrl ? (
            <div className="w-full max-w-md space-y-5 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                <Music className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {genre} Track
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mood: {mood} · Duration: 30 seconds
                </p>
              </div>

              {/* Waveform graphic visualization */}
              <div className="flex items-center justify-center gap-1 h-12 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/60 rounded-xl">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isPlaying ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                    style={{
                      height: `${Math.max(15, Math.sin(i * 0.4) * 80 + 20)}%`,
                    }}
                  />
                ))}
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <a
                  href={audioUrl}
                  download={`sstechworks-music-${Date.now()}.wav`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download WAV</span>
                </a>
              </div>

              {lyrics && (
                <div className="text-left p-3.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold block mb-1 text-slate-900 dark:text-white">Generated Lyrics/Concept:</span>
                  <p className="whitespace-pre-line leading-relaxed">{lyrics}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-2">
              <Music className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">No music composed yet</p>
              <p className="text-xs max-w-xs mx-auto">
                Select your genre and describe the vibe on the left to synthesize original music.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. AUDIO TRANSCRIBER TAB
// =========================================================================
const TranscribeStudioTab: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState('audio/webm');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioMime('audio/webm');
        setAudioPreviewUrl(URL.createObjectURL(audioBlob));

        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to turn off red mic dot
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError('Microphone access denied or not available. You can also upload an audio file below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setAudioMime(file.type || 'audio/mp3');
    setAudioPreviewUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      setAudioBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTranscribe = async () => {
    if (!audioBase64) return;
    setLoading(true);
    setError(null);

    try {
      const res = await transcribeAudio({
        audioBase64,
        mimeType: audioMime,
      });
      setTranscription(res.transcription);
    } catch (err: any) {
      setError(err.message || 'Failed to transcribe audio');
    } finally {
      setLoading(false);
    }
  };

  const copyTranscript = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Mic className="w-5 h-5 text-emerald-500" />
            AI Audio Transcriber & Summarizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Capture meetings, voice notes, or upload recordings for verbatim text and executive action items.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.5 Transcribe</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Record Button Card */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="relative inline-block">
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
              )}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {isRecording ? 'Recording in progress...' : 'Click Microphone to Record'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isRecording ? `Duration: ${formatSeconds(recordTime)}` : 'Speak clearly into your microphone'}
              </p>
            </div>
          </div>

          {/* Or File Upload Dropzone */}
          <div className="relative p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center">
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex flex-col items-center gap-1.5 py-2 cursor-pointer"
            >
              <UploadCloud className="w-5 h-5 text-slate-400" />
              <span className="font-semibold">Or upload an audio file</span>
              <span className="text-[11px] text-slate-400">MP3, WAV, WebM, M4A up to 25MB</span>
            </button>
          </div>

          {/* Audio Preview if ready */}
          {audioPreviewUrl && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Recorded / Uploaded Audio
              </span>
              <audio src={audioPreviewUrl} controls className="w-full h-8" />
            </div>
          )}

          <button
            type="button"
            onClick={handleTranscribe}
            disabled={loading || !audioBase64}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Transcribing & Summarizing Audio...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Transcribe Audio Now</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Right Output Transcription Column */}
        <div className="lg:col-span-7 flex flex-col min-h-[360px] p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Transcription & Executive Summary
            </span>
            {transcription && (
              <button
                type="button"
                onClick={copyTranscript}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Processing speech signals...
              </p>
              <p className="text-xs text-slate-500">Gemini 3.5 is transcribing and structuring executive notes</p>
            </div>
          ) : transcription ? (
            <div className="flex-1 overflow-y-auto max-h-[460px] text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {transcription}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-slate-400 dark:text-slate-500 space-y-2">
              <Mic className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">Ready to transcribe</p>
              <p className="text-xs max-w-xs mx-auto">
                Record your voice or upload an audio file to receive immediate word-for-word transcriptions with action items.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. AI CHATBOT TAB (Gemini 3.8 Flash)
// =========================================================================
const ChatStudioTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am your SS TECHWORKS Technical Consultant. How can I assist you today with software architecture, cloud platforms, React/TypeScript, Supabase schemas, or modern AI implementations?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState('architect');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const personas: Record<string, { label: string; system: string }> = {
    architect: {
      label: '🏛️ Cloud & System Architect',
      system:
        'You are the Chief Systems Architect at SS TECHWORKS. Provide high-level, production-grade architecture recommendations, scalable database models, and cloud infrastructure best practices.',
    },
    mvp: {
      label: '💡 Startup & MVP Strategist',
      system:
        'You are the Lead Product Strategist at SS TECHWORKS. Guide founders on feature prioritization, MVP scoping, agile delivery, and rapid market validation.',
    },
    uiux: {
      label: '🎨 UI/UX & Design Systems Engineer',
      system:
        'You are the Principal Design Systems Engineer at SS TECHWORKS. Advise on micro-interactions, dark/light accessibility, Tailwind CSS patterns, and intuitive user experiences.',
    },
    coder: {
      label: '⚡ Senior Full-Stack Debugger',
      system:
        'You are a senior full-stack engineer at SS TECHWORKS. Provide concise TypeScript, React, PostgreSQL/Supabase queries, and bug resolution code.',
    },
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: textToSend.trim() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAIChat({
        messages: newMessages,
        systemInstruction: personas[persona].system,
      });

      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the AI model. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'How should I structure my Supabase database schema for a multi-tenant SaaS?',
    'What are the key trade-offs between Next.js SSR and React Vite SPA for our agency?',
    'How do we implement Row Level Security (RLS) properly to avoid infinite recursion?',
    'Can you outline a 4-week MVP development roadmap for a mobile health app?',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            SS TECHWORKS AI Consultant & Architect
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time advisory on full-stack development, cloud architecture, Supabase, and startup tech stacks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(personas).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="min-h-[380px] max-h-[460px] overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 rounded-tr-none'
                  : 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Synthesizing expert answer...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[11px] font-medium text-slate-500 mr-1 self-center">Suggestions:</span>
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(q)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            {q.slice(0, 36)}...
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about software architecture, stack selection, mobile apps, or AI..."
          className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Direct WhatsApp Consultation Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <WhatsAppIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-current shrink-0" />
          <div>
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
              Prefer speaking with a human software engineer?
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
              Chat directly on WhatsApp at <strong>{companyInfo.whatsappFormatted}</strong> for quick project quotes.
            </span>
          </div>
        </div>
        <a
          href={companyInfo.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shrink-0 shadow-xs"
        >
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

// =========================================================================
// 5. VOICE & SPEECH STUDIO TAB (Gemini 3.8 Flash Lite TTS)
// =========================================================================
const SpeechStudioTab: React.FC = () => {
  const [text, setText] = useState(
    'Welcome to SS TECHWORKS. We build high-performance web applications, scalable cloud backends, and custom artificial intelligence solutions designed to accelerate your business.'
  );
  const [voiceName, setVoiceName] = useState<'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'>('Kore');
  const [style, setStyle] = useState('Clear, professional tech narrator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices = [
    { id: 'Kore', label: 'Kore (Balanced & Articulate)' },
    { id: 'Puck', label: 'Puck (Enthusiastic & Bright)' },
    { id: 'Charon', label: 'Charon (Deep & Authoritative)' },
    { id: 'Fenrir', label: 'Fenrir (Warm & Resonant)' },
    { id: 'Zephyr', label: 'Zephyr (Smooth & Calm)' },
  ];

  const styles = [
    'Clear, professional tech narrator',
    'Enthusiastic and energetic podcast host',
    'Calm and reassuring product tour guide',
    'Crisp, fast-paced commercial presenter',
  ];

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const res = await generateAISpeech({
        text: text.trim(),
        voiceName,
        style,
      });

      const byteCharacters = atob(res.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: res.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message || 'Speech generation failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-amber-500" />
            AI Voice & Speech Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Synthesize natural, emotive human speech in studio-grade WAV quality.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto text-xs px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.8 Flash Lite TTS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Script / Text to Speak
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to voice..."
              className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prebuilt Voice Persona
              </label>
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Delivery Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSynthesize}
            disabled={loading || !text.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Studio Audio...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Generate Natural Speech</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Right Output Player Column */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[360px] p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="text-center space-y-4 py-16">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
                <Volume2 className="w-7 h-7 animate-bounce" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Synthesizing speech with voice '{voiceName}'...
              </p>
            </div>
          ) : audioUrl ? (
            <div className="w-full max-w-md space-y-5 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 text-white">
                <Volume2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Voice: {voiceName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Style: {style}
                </p>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <a
                  href={audioUrl}
                  download={`sstechworks-speech-${voiceName}-${Date.now()}.wav`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download WAV</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-2">
              <Volume2 className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">No speech synthesized yet</p>
              <p className="text-xs max-w-xs mx-auto">
                Type your message on the left, pick your voice persona, and click "Generate Natural Speech".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
