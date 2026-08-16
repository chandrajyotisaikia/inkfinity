'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { MoveHorizontal } from 'lucide-react'

export default function CompareSlider({ beforeSrc, afterSrc, afterIsTransparent }) {
  const containerRef = useRef(null)
  const dragging = useRef(false)
  const [pct, setPct] = useState(50)

  const updateFromClientX = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width)
    setPct((x / rect.width) * 100)
  }, [])

  const handlePointerDown = (e) => {
    dragging.current = true
    updateFromClientX(e.touches ? e.touches[0].clientX : e.clientX)
  }
  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging.current) return
      updateFromClientX(e.touches ? e.touches[0].clientX : e.clientX)
    },
    [updateFromClientX],
  )
  const handlePointerUp = () => {
    dragging.current = false
  }

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchmove', handlePointerMove, { passive: false })
    window.addEventListener('touchend', handlePointerUp)
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [handlePointerMove])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-lg mx-auto rounded-xl overflow-hidden select-none border border-ink-line"
      style={{ touchAction: 'none' }}
    >
      {/* After image (full width, bottom layer) */}
      <div className={`absolute inset-0 ${afterIsTransparent ? 'transparency-grid' : 'bg-ink-panel'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterSrc} alt="After" className="w-full h-full object-contain" draggable={false} />
      </div>

      {/* Before image (clipped to left pct, top layer) */}
      <div
        className="absolute inset-0 overflow-hidden bg-ink-panel"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeSrc} alt="Before" className="w-full h-full object-contain" draggable={false} />
      </div>

      {/* Divider handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize"
        style={{ left: `${pct}%` }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center">
          <MoveHorizontal size={16} className="text-ink-black" />
        </div>
      </div>

      <span className="absolute top-3 left-3 text-[11px] uppercase tracking-wide bg-black/60 px-2 py-1 rounded-full text-white/70">
        Before
      </span>
      <span className="absolute top-3 right-3 text-[11px] uppercase tracking-wide bg-black/60 px-2 py-1 rounded-full text-white/70">
        After
      </span>
    </div>
  )
}
