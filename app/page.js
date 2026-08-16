'use client'

import React, { useState } from 'react'
import { Download, Loader2, Wand2, RotateCcw, AlertCircle } from 'lucide-react'
import Dropzone from '@/components/Dropzone'
import CompareSlider from '@/components/CompareSlider'
import BackgroundControls from '@/components/BackgroundControls'

export default function Home() {
  const [originalFile, setOriginalFile] = useState(null)
  const [originalPreview, setOriginalPreview] = useState(null) // local object URL, instant preview
  const [publicId, setPublicId] = useState(null)
  const [uploadedUrl, setUploadedUrl] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [removingBg, setRemovingBg] = useState(false)
  const [applyingBg, setApplyingBg] = useState(false)

  const [cutoutUrl, setCutoutUrl] = useState(null) // after background_removal
  const [finalUrl, setFinalUrl] = useState(null) // after color/generative replace
  const [downloading, setDownloading] = useState(false)

  const [error, setError] = useState('')

  const busy = uploading || removingBg || applyingBg || downloading

  const handleFileSelected = async (file) => {
    setError('')
    // Release the previous preview's object URL before creating a new one —
    // otherwise each re-upload in the same session leaks memory, since blob
    // URLs are never automatically garbage-collected by the browser.
    if (originalPreview) URL.revokeObjectURL(originalPreview)

    setOriginalFile(file)
    setOriginalPreview(URL.createObjectURL(file))
    setPublicId(null)
    setUploadedUrl(null)
    setCutoutUrl(null)
    setFinalUrl(null)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed.')
      setPublicId(data.publicId)
      setUploadedUrl(data.secureUrl)
    } catch (err) {
      setError(err.message)
      // Revoking here (not just clearing state) is required — setting
      // originalPreview to null does not itself free the blob URL created
      // above, so skipping this would leak memory on every failed upload.
      setOriginalPreview((current) => {
        if (current) URL.revokeObjectURL(current)
        return null
      })
      setOriginalFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveBackground = async () => {
    if (!publicId) return
    setError('')
    setRemovingBg(true)
    try {
      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Background removal failed.')
      setCutoutUrl(data.url)
      setFinalUrl(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setRemovingBg(false)
    }
  }

  const handleApplyBackground = async ({ mode, color, prompt }) => {
    if (!publicId) return
    setError('')
    setApplyingBg(true)
    try {
      const res = await fetch('/api/replace-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, mode, color, prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Background replace failed.')
      setFinalUrl(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setApplyingBg(false)
    }
  }

  const handleReset = () => {
    if (originalPreview) URL.revokeObjectURL(originalPreview)
    setOriginalFile(null)
    setOriginalPreview(null)
    setPublicId(null)
    setUploadedUrl(null)
    setCutoutUrl(null)
    setFinalUrl(null)
    setError('')
  }

  const handleDownload = async () => {
    if (!displayResultUrl) return
    setDownloading(true)
    setError('')
    try {
      // The <a download> attribute is silently ignored by Chrome, Firefox,
      // and Safari for cross-origin URLs (Cloudinary's domain differs from
      // ours) — it just navigates to the image instead of downloading it.
      // Fetching as a blob and downloading from a same-origin blob: URL is
      // the standard, reliable fix.
      const res = await fetch(displayResultUrl)
      if (!res.ok) throw new Error('Could not fetch the image for download.')
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `bg-studio-result-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError(err.message || 'Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const displayResultUrl = finalUrl || cutoutUrl
  const canDownload = Boolean(displayResultUrl)

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">
          AI Background Removal &amp; Blending
        </h1>
        <p className="text-white/50">
          Upload a photo, remove the background, and drop in a new one — powered by Cloudinary.
        </p>
      </header>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!originalPreview ? (
        <Dropzone onFileSelected={handleFileSelected} disabled={busy} />
      ) : (
        <div className="space-y-8">
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-white/50 py-12">
              <Loader2 size={18} className="animate-spin" />
              Uploading...
            </div>
          )}

          {!uploading && publicId && (
            <>
              <CompareSlider
                beforeSrc={originalPreview}
                afterSrc={displayResultUrl || uploadedUrl}
                afterIsTransparent={Boolean(cutoutUrl && !finalUrl)}
              />

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleRemoveBackground}
                  disabled={busy}
                  className="btn-primary flex items-center gap-2"
                >
                  {removingBg ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Wand2 size={16} />
                  )}
                  {cutoutUrl ? 'Re-run Background Removal' : 'Remove Background'}
                </button>

                <button
                  onClick={handleReset}
                  disabled={busy}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Start Over
                </button>

                {canDownload && (
                  <button
                    onClick={handleDownload}
                    disabled={busy}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {downloading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {downloading ? 'Preparing...' : 'Download'}
                  </button>
                )}
              </div>

              {cutoutUrl && (
                <BackgroundControls onApply={handleApplyBackground} loading={applyingBg} />
              )}
            </>
          )}
        </div>
      )}
    </main>
  )
}
