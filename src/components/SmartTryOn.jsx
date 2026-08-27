'use client';
import React, { useState, useRef } from 'react';
import { Upload, Sparkles, RotateCcw } from 'lucide-react';

export default function SmartTryOn() {
  const [skinImage, setSkinImage] = useState(null);
  const [tattooImage, setTattooImage] = useState(null);
  const [tattooScale, setTattooScale] = useState(1);
  const [tattooX, setTattooX] = useState(0);
  const [tattooY, setTattooY] = useState(0);
  const [isEnhanced, setIsEnhanced] = useState(false);
  
  const skinInputRef = useRef(null);
  const tattooInputRef = useRef(null);

  const handleImageUpload = (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setSkinImage(null);
    setTattooImage(null);
    setTattooScale(1);
    setTattooX(0);
    setTattooY(0);
    setIsEnhanced(false);
  };

  return (
    <section className="relative py-24 bg-ink-black border-t border-line" id="try-on">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            <span className="text-gold">Smart</span> Tattoo Try-On
          </h2>
          <p className="text-gray-400 font-sans">
            Upload a photo of your placement area, add your design, and enhance it to see how the ink blends with your skin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Canvas Area */}
          <div className="relative bg-ink-panel rounded-xl overflow-hidden shadow-gold border border-line aspect-[4/5] lg:aspect-square flex items-center justify-center">
            {!skinImage ? (
              <div className="text-center p-8">
                <Upload size={48} className="mx-auto text-gold mb-4 opacity-50" />
                <p className="text-gray-500">Upload a background photo to begin</p>
              </div>
            ) : (
              <div className="relative w-full h-full overflow-hidden" style={{ touchAction: 'none' }}>
                <img src={skinImage} alt="Skin Base" className="w-full h-full object-cover" />
                
                {tattooImage && (
                  <img
                    src={tattooImage}
                    alt="Tattoo Overlay"
                    className="absolute top-1/2 left-1/2 cursor-move"
                    style={{
                      transform: `translate(calc(-50% + ${tattooX}px), calc(-50% + ${tattooY}px)) scale(${tattooScale})`,
                      // THE MAGIC TRICK: Pure CSS blending
                      mixBlendMode: isEnhanced ? 'multiply' : 'normal',
                      filter: isEnhanced ? 'contrast(110%) saturate(115%) opacity(0.85)' : 'none',
                      transition: 'filter 0.3s ease, mix-blend-mode 0.3s ease',
                      maxWidth: '50%'
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <input type="file" ref={skinInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setSkinImage)} />
              <button onClick={() => skinInputRef.current?.click()} className="w-full py-4 border border-line rounded-lg text-white hover:border-gold transition-colors flex justify-center items-center gap-2">
                <Upload size={18} /> {skinImage ? 'Change Canvas Image' : '1. Upload Skin Photo'}
              </button>

              <input type="file" ref={tattooInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setTattooImage)} />
              <button onClick={() => tattooInputRef.current?.click()} className="w-full py-4 border border-line rounded-lg text-white hover:border-gold transition-colors flex justify-center items-center gap-2 disabled:opacity-50" disabled={!skinImage}>
                <Upload size={18} /> {tattooImage ? 'Change Tattoo Design' : '2. Upload Tattoo Design'}
              </button>
            </div>

            {tattooImage && (
              <div className="space-y-6 bg-ink-panel p-6 rounded-lg border border-line">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gold mb-2 block">Size</label>
                  <input type="range" min="0.5" max="2.5" step="0.1" value={tattooScale} onChange={(e) => setTattooScale(parseFloat(e.target.value))} className="w-full accent-gold" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gold mb-2 block">Move X</label>
                    <input type="range" min="-200" max="200" value={tattooX} onChange={(e) => setTattooX(parseInt(e.target.value))} className="w-full accent-gold" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gold mb-2 block">Move Y</label>
                    <input type="range" min="-200" max="200" value={tattooY} onChange={(e) => setTattooY(parseInt(e.target.value))} className="w-full accent-gold" />
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <button onClick={() => setIsEnhanced(!isEnhanced)} className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${isEnhanced ? 'bg-gold text-black' : 'bg-transparent border border-gold text-gold'}`}>
                    <Sparkles size={18} /> {isEnhanced ? 'Enhanced' : 'Enhance & Apply'}
                  </button>
                  <button onClick={handleReset} className="py-3 rounded-lg font-medium border border-line text-gray-400 hover:text-white flex items-center justify-center gap-2">
                    <RotateCcw size={18} /> Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
                    }
