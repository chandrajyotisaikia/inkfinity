'use client'

import React, { useState } from 'react'
import { Palette, Sparkles, Loader2 } from 'lucide-react'

const PRESET_COLORS = ['#ffffff', '#0a0a0a', '#1e293b', '#dc2626', '#16a34a', '#2563eb', '#eab308']

export default function BackgroundControls({ onApply, loading }) {
  const [mode, setMode] = useState('color')
  const [color, setColor] = useState('#ffffff')
  const [prompt, setPrompt] = useState('')

  const handleApply = () => {
    if (mode === 'color') {
      onApply({ mode: 'color', color })
    } else {
      if (!prompt.trim()) return
      onApply({ mode: 'generative', prompt: prompt.trim() })
    }
  }

  return (
    <div className="bg-ink-panel border border-ink-line rounded-xl p-5">
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setMode('color')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-colors ${
            mode === 'color'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-ink-line text-white/50 hover:border-white/30'
          }`}
        >
          <Palette size={15} />
          Solid Color
        </button>
        <button
          onClick={() => setMode('generative')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-colors ${
            mode === 'generative'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-ink-line text-white/50 hover:border-white/30'
          }`}
        >
          <Sparkles size={15} />
          AI Generative
        </button>
      </div>

      {mode === 'color' ? (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  color === c ? 'border-accent scale-110' : 'border-ink-line'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
            <label className="w-8 h-8 rounded-full border-2 border-ink-line overflow-hidden cursor-pointer relative">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute -top-1 -left-1 w-10 h-10 cursor-pointer"
              />
            </label>
          </div>
          <p className="text-xs text-white/40 mb-4">Selected: {color}</p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm text-white/60 mb-2">
            Describe the new background
          </label>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. a sunlit studio with soft shadows"
            className="w-full bg-black/40 border border-ink-line rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
          />
          <p className="text-xs text-white/30 mt-2">
            Requires Cloudinary's generative AI add-on. Falls back to a clear
            error message if it isn't available on your plan.
          </p>
        </div>
      )}

      <button
        onClick={handleApply}
        disabled={loading || (mode === 'generative' && !prompt.trim())}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Applying...
          </>
        ) : (
          'Apply Background'
        )}
      </button>
    </div>
  )
}
