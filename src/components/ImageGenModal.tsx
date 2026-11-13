import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  Palette, 
  Layers, 
  Flame,
  Camera,
  RefreshCw
} from 'lucide-react';
import { GeneratedImage } from '../types';
import { playSound } from '../utils/audio';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated?: (image: GeneratedImage) => void;
}

const STYLE_PRESETS = [
  'Cinematic Sci-Fi',
  'Photorealistic 8K',
  'Cyberpunk Neon',
  'Unreal Engine 5 3D',
  'Dark Surrealism',
  'Anime Masterpiece',
  'Vintage 35mm Film',
  'Hyper-detailed Concept Art',
];

const ASPECT_RATIOS = [
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Widescreen', value: '16:9' },
  { label: '9:16 Portrait', value: '9:16' },
  { label: '4:3 Classic', value: '4:3' },
];

const INSPIRATION_PROMPTS = [
  'Hyper-futuristic metallic red Ultron with glowing crimson ocular sensors standing on a cyberpunk skyscraper in neon rain, volumetric atmospheric lighting, 8k resolution',
  'An ethereal quantum astronaut floating inside an iridescent hyper-dimensional nebula, cinematic lighting, photorealistic masterpiece',
  'Sleek cybernetic supercar accelerating through a rainy Neo-Tokyo street, reflections of red and cyan neon signs, ultra-detailed 8k',
  'Ancient cyber-temple carved into obsidian mountains with glowing red and blue energy conduits, cinematic fantasy concept art',
];

export const ImageGenModal: React.FC<ImageGenModalProps> = ({
  isOpen,
  onClose,
  onImageGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [latestImage, setLatestImage] = useState<GeneratedImage | null>(null);
  const [copied, setCopied] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([
    {
      id: 'demo-1',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      prompt: 'Ultron Cybernetic Core Architecture with Red and Blue Quantum Resonators',
      style: 'Cinematic Sci-Fi',
      aspectRatio: '16:9',
      timestamp: 'Demo Masterpiece',
    },
    {
      id: 'demo-2',
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
      prompt: 'Cyberpunk Red Neon Cityscape with Flying Drones and Holograms',
      style: 'Cyberpunk Neon',
      aspectRatio: '1:1',
      timestamp: 'Demo Masterpiece',
    },
  ]);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    playSound('beep');

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          aspectRatio: selectedAspectRatio,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        const newImg: GeneratedImage = {
          id: 'img-' + Date.now(),
          url: data.imageUrl,
          prompt: data.originalPrompt || prompt,
          enhancedPrompt: data.enhancedPrompt,
          style: data.style || selectedStyle,
          aspectRatio: data.aspectRatio || selectedAspectRatio,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setLatestImage(newImg);
        setGallery((prev) => [newImg, ...prev]);
        onImageGenerated?.(newImg);
        playSound('receive');
      } else {
        alert(data.error || 'Failed to synthesize visual output.');
      }
    } catch (err: any) {
      console.error('Image gen error:', err);
      alert('Visual neural core error: ' + (err?.message || 'Check network'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Expand this brief image idea into a magnificent 8K visual art prompt with photographic lighting, unreal engine render, and vivid details: "${prompt}"`,
        }),
      });
      const data = await res.json();
      if (data.text) {
        // Clean markdown backticks or quotes
        const cleaned = data.text.replace(/[*#`_"]/g, '').split('\n')[0].trim();
        setPrompt(cleaned);
        playSound('beep');
      }
    } catch (e) {
      console.warn('Enhance error:', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopyPrompt = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (imgUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070e]/95 backdrop-blur-xl p-2 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-5xl max-h-[92vh] rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0a0f1d] via-[#060a14] to-[#04060c] shadow-[0_0_60px_rgba(0,210,255,0.25)] flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(0,210,255,0.5)]">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-orbitron text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  ULTRON 100% FREE AI IMAGE STUDIO
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-950/60 text-green-400 border border-green-500/30">
                  NO PAID TIERS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">
                Cinematic 8K High-Resolution visual synthesis powered by Google AI Vision Logic.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* PROMPT INPUT & CONTROLS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Visual Prompt Architecture
              </label>

              {/* AI Enhance Prompt Button */}
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-purple-500/40 bg-purple-950/30 text-purple-300 hover:text-purple-200 hover:border-purple-400 text-xs font-rajdhani font-bold transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{isEnhancing ? 'Enhancing...' : 'AI Enhance Prompt'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe any scene, creature, futuristic vehicle, cybernetic portrait, or landscape in full detail..."
                rows={3}
                className="w-full rounded-2xl bg-slate-950/90 border border-cyan-500/30 p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all font-rajdhani"
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Inspirations:</span>
              {INSPIRATION_PROMPTS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sample)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-700/60 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition-all font-rajdhani truncate max-w-[240px]"
                >
                  {sample.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>

          {/* STYLE & ASPECT RATIO CONTROLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-orbitron font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-red-400" /> Visual Aesthetic Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STYLE_PRESETS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStyle(st)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-rajdhani text-center transition-all ${
                      selectedStyle === st
                        ? 'bg-gradient-to-r from-red-600/40 to-blue-600/40 border border-cyan-400 text-white font-bold shadow-[0_0_10px_rgba(0,210,255,0.3)]'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-orbitron font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Dimension & Aspect Ratio
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.value}
                    type="button"
                    onClick={() => setSelectedAspectRatio(ar.value)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-rajdhani text-center transition-all ${
                      selectedAspectRatio === ar.value
                        ? 'bg-cyan-950/60 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,210,255,0.3)]'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GENERATE ACTION BUTTON */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-orbitron font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,26,64,0.4)] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>ULTRON RENDERING HIGH-RESOLUTION VISUAL (UNDER 10s)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>SYNTHESIZE FREE 8K IMAGE INSTANTLY</span>
              </>
            )}
          </button>

          {/* LATEST GENERATION PREVIEW */}
          {latestImage && (
            <div className="p-4 rounded-2xl border border-red-500/40 bg-gradient-to-b from-red-950/20 to-black/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-orbitron text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500" /> Latest Visual Masterpiece
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyPrompt(latestImage.enhancedPrompt || latestImage.prompt)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(latestImage.url, latestImage.prompt)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-xs text-slate-950 font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setLightboxImage(latestImage)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                onClick={() => setLightboxImage(latestImage)}
                className="relative rounded-xl overflow-hidden cursor-pointer group border border-slate-700/80 aspect-video max-h-[420px] bg-black flex items-center justify-center"
              >
                <img
                  src={latestImage.url}
                  alt={latestImage.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-xs text-slate-200 line-clamp-2 font-rajdhani">
                    {latestImage.enhancedPrompt || latestImage.prompt}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* GALLERY OF PAST GENERATIONS */}
          <div className="space-y-3">
            <h3 className="font-orbitron text-xs font-bold text-slate-400 uppercase tracking-wider">
              Visual Archives Gallery ({gallery.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxImage(img)}
                  className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-400/60 bg-black cursor-pointer aspect-square"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                    <span className="text-[10px] text-cyan-300 font-bold truncate font-rajdhani">{img.style}</span>
                    <span className="text-[10px] text-slate-300 line-clamp-1 font-rajdhani">{img.prompt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.prompt}
              className="max-w-full max-h-[82vh] object-contain rounded-2xl border border-cyan-500/50 shadow-2xl"
            />
            <div className="mt-3 text-center max-w-2xl">
              <p className="text-xs sm:text-sm text-slate-200 font-rajdhani">
                {lightboxImage.enhancedPrompt || lightboxImage.prompt}
              </p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(lightboxImage.url, lightboxImage.prompt);
                  }}
                  className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Full 8K
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
