import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Video,
  CheckCircle2,
  Download,
  Copy,
  RefreshCw,
  Layers,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  ArrowRight,
  Maximize2,
  X,
  Share2,
  FileText,
  Check,
  Film,
  PhoneCall,
  Clock,
  Sparkle
} from 'lucide-react';
import { getSmartProductAssets } from '../utils/productAssetMatcher';

interface AiProductAssetStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductName?: string;
  initialCategory?: string;
  onApplyToProduct?: (assets: {
    images: string[];
    videoUrl?: string;
    title?: string;
    description?: string;
    highlights?: string;
  }) => void;
}

interface MultiAnglePhoto {
  angleId: 'front' | 'isometric' | 'lifestyle' | 'macro' | 'unboxing';
  title: string;
  urduTitle: string;
  description: string;
  imageUrl: string;
  selected: boolean;
}

export const AiProductAssetStudioModal: React.FC<AiProductAssetStudioModalProps> = ({
  isOpen,
  onClose,
  initialProductName = 'Wireless Noise Cancelling Earbuds Pro',
  initialCategory = 'Consumer Electronics & Mobile Gadgets',
  onApplyToProduct,
}) => {
  const [productQuery, setProductQuery] = useState(initialProductName);
  const [category, setCategory] = useState(initialCategory);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'video' | 'copy'>('photos');

  // Multi-angle studio photos
  const [photos, setPhotos] = useState<MultiAnglePhoto[]>([]);

  // Video Reel State
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('Product Video Demo');
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [activeVideoSlide, setActiveVideoSlide] = useState(0);
  const [videoMode, setVideoMode] = useState<'AUTO_REEL' | 'MP4'>('AUTO_REEL');
  const [watermarkPhone, setWatermarkPhone] = useState('0300-8492019');
  const [videoScriptUrdu, setVideoScriptUrdu] = useState('');
  const [storyboard, setStoryboard] = useState<Array<{ scene: number; duration: string; visual: string; textOverlay: string }>>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Generated listing copy
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedHighlights, setGeneratedHighlights] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGenerateAssets = async (targetName = productQuery) => {
    setIsGenerating(true);
    const assetPack = getSmartProductAssets(targetName);
    const chosenImages = [assetPack.image, ...assetPack.extraImages];

    setVideoUrl(assetPack.videoUrl);
    setVideoTitle(assetPack.videoTitle);

    const generatedPhotos: MultiAnglePhoto[] = [
      {
        angleId: 'front',
        title: '📸 Studio Front Angle (Pure White BG)',
        urduTitle: 'سامنے کا اسٹوڈیو زاویہ (وائٹ بیک گراؤنڈ)',
        description: 'E-commerce catalog main image. Clean, shadow-balanced, Amazon/Daraz compliant.',
        imageUrl: chosenImages[0] || assetPack.image,
        selected: true,
      },
      {
        angleId: 'isometric',
        title: '📐 45° Hero Perspective Angle',
        urduTitle: '45 ڈگری ہیرو زاویہ (بہترین گہرائی)',
        description: 'Highlights 3D depth, craftsmanship, metallic finish, and ergonomic grip.',
        imageUrl: chosenImages[1] || chosenImages[0],
        selected: true,
      },
      {
        angleId: 'lifestyle',
        title: '🏡 Lifestyle Context Angle (In-Use)',
        urduTitle: 'استعمال کا لائیو ماحول زاویہ',
        description: 'Shows the product placed in realistic environment. Increases trust by 45%.',
        imageUrl: chosenImages[2] || chosenImages[0],
        selected: true,
      },
      {
        angleId: 'macro',
        title: '🔍 Macro Feature Close-Up',
        urduTitle: 'قریب ترین تفصیلاتی زاویہ',
        description: 'Ultra-sharp focus on durable build, alloy finish, or power controls.',
        imageUrl: chosenImages[3] || chosenImages[0],
        selected: true,
      },
      {
        angleId: 'unboxing',
        title: '📦 Unboxing & Box Scale Angle',
        urduTitle: 'باکس اور سامان کی تفصیل',
        description: 'Shows retail box, included attachments, charging cable, and user manual.',
        imageUrl: chosenImages[4] || chosenImages[0],
        selected: true,
      },
    ];

    setPhotos(generatedPhotos);

    // Initial base texts from matching catalog
    setGeneratedTitle(`[100% Original] ${targetName} - Heavy Duty Quality`);
    setGeneratedHighlights(assetPack.highlights.map((h) => `✓ ${h}`).join('\n'));
    setGeneratedDescription(
      `پروڈکٹ کی خصوصیات (Urdu Pitch):\n${assetPack.urduPitch}\n\nوارنٹی و ڈلیوری:\n✓ 7 دن کی ریپلیسمنٹ وارنٹی۔\n✓ پورے پاکستان میں کیش آن ڈیلیوری دستیاب ہے۔`
    );
    setVideoScriptUrdu(
      `"${assetPack.urduPitch}\nابھی نیچے دیے گئے نمبر پر واٹس ایپ آرڈر کریں: ${watermarkPhone}"`
    );
    setStoryboard([
      { scene: 1, duration: '0-3s', visual: 'High energy hook showing product in action', textOverlay: '🔥 پاکستان میں ٹاپ ٹرینڈنگ' },
      { scene: 2, duration: '3-8s', visual: 'Multi-angle features and practical demonstration', textOverlay: targetName },
      { scene: 3, duration: '8-12s', visual: 'Quality guarantee and durability check', textOverlay: '✓ 7 Days Check Warranty' },
      { scene: 4, duration: '12-15s', visual: 'Final call to action with WhatsApp & COD', textOverlay: `Order WhatsApp: ${watermarkPhone}` },
    ]);

    // Attempt Gemini Generation via server for ultra personalized Urdu copy & Storyboard
    try {
      const res = await fetch('/api/ai/generate-product-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: targetName, category }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          if (json.data.seoTitle) setGeneratedTitle(json.data.seoTitle);
          if (json.data.urduPitch) {
            setGeneratedDescription(
              `پروڈکٹ کی خصوصیات (Urdu Pitch):\n${json.data.urduPitch}\n\nوارنٹی و ڈلیوری:\n✓ 7 دن کی ریپلیسمنٹ وارنٹی۔\n✓ پورے پاکستان میں کیش آن ڈیلیوری دستیاب ہے۔`
            );
          }
          if (Array.isArray(json.data.highlights) && json.data.highlights.length > 0) {
            setGeneratedHighlights(json.data.highlights.map((h: string) => `✓ ${h}`).join('\n'));
          }
          if (json.data.videoScriptUrdu) {
            setVideoScriptUrdu(json.data.videoScriptUrdu);
          }
          if (Array.isArray(json.data.videoStoryboard) && json.data.videoStoryboard.length > 0) {
            setStoryboard(json.data.videoStoryboard);
          }
        }
      }
    } catch (e) {
      // Gracefully uses assetPack fallbacks
    }

    setIsGenerating(false);
    setToastMessage('✨ AI Studio: 5 Studio Angles & Video Ad Ready!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (isOpen) {
      setProductQuery(initialProductName);
      setCategory(initialCategory);
      handleGenerateAssets(initialProductName);
    }
  }, [isOpen, initialProductName, initialCategory]);

  // Video Reel auto slideshow animation
  useEffect(() => {
    if (!isPlayingVideo || photos.length === 0) return;
    const interval = setInterval(() => {
      setActiveVideoSlide((prev) => (prev + 1) % photos.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPlayingVideo, photos]);

  if (!isOpen) return null;

  const toggleSelectPhoto = (angleId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.angleId === angleId ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleApplyToProductForm = () => {
    const selectedImages = photos.filter((p) => p.selected).map((p) => p.imageUrl);
    if (onApplyToProduct) {
      onApplyToProduct({
        images: selectedImages.length > 0 ? selectedImages : photos.map((p) => p.imageUrl),
        videoUrl: videoUrl,
        title: generatedTitle,
        description: generatedDescription,
        highlights: generatedHighlights,
      });
    }
    setToastMessage('✓ تمام تصاویر اور ویڈیو پروڈکٹ لسٹنگ پر لاگو ہو گئیں!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const currentSlidePhoto = photos[activeVideoSlide] || photos[0];

  return (
    <div
      id="ai-asset-studio-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-5xl rounded-3xl border border-violet-500/40 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600/30 text-violet-400 border border-violet-500/40 shadow-lg">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/40 uppercase tracking-wider">
                  AI Commercial Media Studio
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> High-Converting Media Assets
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                AI Product Pictures & Video Reel Studio
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {toastMessage && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/80 p-3 text-xs text-emerald-200 font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Search / Target Product Query */}
          <div className="flex flex-col sm:flex-row gap-3 items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Enter product title or SKU (e.g. Wireless Earbuds, Garlic Press, T9 Trimmer)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleGenerateAssets(productQuery)}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'AI Generating...' : 'Generate Photos & Video'}</span>
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>5 Multi-Angle Studio Photos ({photos.filter((p) => p.selected).length}/5)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>TikTok / Reel Video Ad Maker (9:16)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('copy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'copy'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>AI Urdu & English Sales Copy</span>
            </button>
          </div>

          {/* TAB 1: 5 MULTI-ANGLE STUDIO PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Daraz, Shopify aur TikTok par conversion barhane ke liye har product ke 5 studio angles:
                </span>
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.map((p) => ({ ...p, selected: true })))}
                  className="text-violet-400 hover:underline font-bold cursor-pointer"
                >
                  Select All 5 Angles
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {photos.map((photo) => (
                  <div
                    key={photo.angleId}
                    onClick={() => toggleSelectPhoto(photo.angleId)}
                    className={`rounded-2xl border overflow-hidden cursor-pointer transition flex flex-col justify-between ${
                      photo.selected
                        ? 'border-violet-500 bg-slate-900 ring-2 ring-violet-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="relative aspect-square w-full bg-slate-950 overflow-hidden group">
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            photo.selected
                              ? 'bg-violet-600 text-white shadow'
                              : 'bg-slate-900/80 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {photo.selected ? '✓' : ''}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider backdrop-blur-xs">
                        {photo.angleId}
                      </div>
                    </div>

                    <div className="p-2.5 space-y-1 text-left">
                      <div className="text-[11px] font-bold text-white leading-tight">{photo.title}</div>
                      <div className="text-[10px] text-violet-300 font-semibold">{photo.urduTitle}</div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{photo.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TIKTOK / REEL VIDEO AD CREATOR */}
          {activeTab === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* 9:16 Vertical Video Preview Player */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setVideoMode('AUTO_REEL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      videoMode === 'AUTO_REEL'
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    AI Motion Reel (High Converting)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoMode('MP4')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      videoMode === 'MP4'
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Product Video Clip
                  </button>
                </div>

                <div className="relative w-64 h-[440px] rounded-3xl border-4 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col justify-between p-3 select-none">
                  {videoMode === 'MP4' && videoUrl ? (
                    <video
                      key={videoUrl}
                      ref={videoRef}
                      src={videoUrl}
                      autoPlay
                      loop
                      muted={isAudioMuted}
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    /* AI Motion Reel with Pan/Zoom & Product Angles */
                    <div className="absolute inset-0 h-full w-full overflow-hidden bg-slate-950">
                      {currentSlidePhoto && (
                        <img
                          key={currentSlidePhoto.imageUrl}
                          src={currentSlidePhoto.imageUrl}
                          alt=""
                          className="h-full w-full object-cover scale-105 animate-pulse transition-all duration-1000"
                        />
                      )}
                    </div>
                  )}

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85 pointer-events-none" />

                  {/* Top Overlay: Urdu Eye Catching Hook */}
                  <div className="relative z-10 space-y-1">
                    <div className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 text-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow">
                      🔥 پاکستان میں سب سے زیادہ فروخت
                    </div>
                    <div className="text-xs font-black text-white drop-shadow-md truncate">
                      {productQuery}
                    </div>
                  </div>

                  {/* Center Animated Badge */}
                  <div className="relative z-10 text-center my-auto">
                    <div className="inline-block rounded-xl bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 shadow-lg transform -rotate-2">
                      7 Days Check Warranty!
                    </div>
                  </div>

                  {/* Bottom Overlay: Reseller WhatsApp & Offer */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="rounded-xl bg-slate-900/95 border border-emerald-500/40 p-2 text-left backdrop-blur-xs shadow-lg">
                      <div className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                        <span>🚚 فری کیش آن ڈیلیوری دستیاب ہے</span>
                      </div>
                      <div className="text-[11px] font-black text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                        <PhoneCall className="h-3 w-3 text-emerald-400" />
                        <span>Order WhatsApp: {watermarkPhone}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                        className="p-1 rounded-lg bg-black/60 hover:bg-black/90 text-white cursor-pointer"
                      >
                        {isPlayingVideo ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </button>

                      <div className="flex items-center gap-1">
                        {photos.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveVideoSlide(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              activeVideoSlide === idx ? 'w-4 bg-violet-400' : 'w-1.5 bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAudioMuted(!isAudioMuted)}
                        className="p-1 rounded-lg bg-black/60 hover:bg-black/90 text-white cursor-pointer"
                      >
                        {isAudioMuted ? <VolumeX className="h-3 w-3 text-slate-400" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Storyboard & Customization */}
              <div className="space-y-4 text-xs">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <label className="text-slate-300 font-bold block">
                    Reseller WhatsApp Number (Shown on Video):
                  </label>
                  <input
                    type="text"
                    value={watermarkPhone}
                    onChange={(e) => setWatermarkPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono font-bold text-xs focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* 15-Sec Storyboard breakdown */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Film className="h-3.5 w-3.5 text-violet-400" />
                      <span>15-Second Video Ad Storyboard:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">TikTok / Instagram Reels</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {storyboard.map((scene) => (
                      <div
                        key={scene.scene}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-2 text-left"
                      >
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-300 shrink-0">
                          {scene.duration}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 text-[11px]">{scene.visual}</p>
                          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Badge: "{scene.textOverlay}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voiceover Script */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-bold">Urdu Audio Voiceover Script:</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(videoScriptUrdu);
                        setToastMessage('✓ Urdu script copied!');
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="text-violet-400 hover:underline text-[11px] flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy Script</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={videoScriptUrdu}
                    onChange={(e) => setVideoScriptUrdu(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white text-xs font-sans leading-relaxed focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI URDU & ENGLISH SALES COPY */}
          {activeTab === 'copy' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-bold">High-Converting SEO Product Title:</label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedTitle);
                      setToastMessage('✓ Title copied!');
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    className="text-violet-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Title</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-bold">Key Product Highlights (Bullet Points):</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedHighlights);
                        setToastMessage('✓ Highlights copied!');
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="text-violet-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={generatedHighlights}
                    onChange={(e) => setGeneratedHighlights(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white font-mono leading-relaxed"
                  />
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-300 font-bold">Urdu Sales Pitch & Warranty Copy:</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedDescription);
                        setToastMessage('✓ Urdu pitch copied!');
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="text-violet-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={generatedDescription}
                    onChange={(e) => setGeneratedDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span>
              {photos.filter((p) => p.selected).length} multi-angle photos selected • Commercial high-res
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyToProductForm}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black transition shadow-lg shadow-violet-950/50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Apply Assets to Product (تصاویر اور ویڈیو لاگو کریں)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
