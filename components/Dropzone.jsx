'use client'

import React, { useCallback, useRef, useState } from 'react'
import { UploadCloud, ImageIcon } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function Dropzone({ onFileSelected, disabled }) {
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState('')
  const inputRef = useRef(null)

  const validateAndEmit = useCallback(
    (file) => {
      if (!file) return
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setLocalError('Please use a JPEG, PNG, or WebP image.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setLocalError('File is too large — max 10MB.')
        return
      }
      setLocalError('')
      onFileSelected(file)
    },
    [onFileSelected],
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    validateAndEmit(file)
  }

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    validateAndEmit(file)
    e.target.value = ''
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
          px-8 py-16 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-accent bg-accent/5' : 'border-ink-line hover:border-white/30'}
          ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
          {dragActive ? (
            <UploadCloud size={24} className="text-accent" />
          ) : (
            <ImageIcon size={24} className="text-white/40" />
          )}
        </div>
        <p className="text-white/80 font-medium">
          Drag &amp; drop an image, or click to browse
        </p>
        <p className="text-white/40 text-sm">JPEG, PNG, or WebP — up to 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {localError && <p className="mt-3 text-sm text-red-400">{localError}</p>}
    </div>
  )
}
