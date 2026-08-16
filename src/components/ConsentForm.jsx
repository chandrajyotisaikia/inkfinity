'use client'
import React, { useRef, useState, useEffect } from 'react'

export default function ConsentForm() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [medical, setMedical] = useState({
    bloodThinners: false,
    skinConditions: false,
    pregnancy: false,
    allergies: false,
  })
  const [signed, setSigned] = useState(false)
  const [message, setMessage] = useState('')
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#D4AF37'
  }, [])

  function startDraw(e) {
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPointer(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  function draw(e) {
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPointer(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  function endDraw() {
    drawing.current = false
  }
  function getPointer(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
      y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top,
    }
  }
  function clearCanvas() {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setSigned(false)
  }
  function handleSubmit(e) {
    e.preventDefault()
    if (!userName) return setMessage('Please enter your name to sign.')
    const ctx = canvasRef.current.getContext('2d')
    const pixels = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data
    const hasInk = Array.from(pixels).some(v => v !== 0)
    if (!hasInk) return setMessage('Please sign the waiver.')
    setSigned(true)
    setLoggedIn(true)
    setMessage('Waiver submitted. Thank you!')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-start justify-center">
      <div className="max-w-3xl w-full">
        {!loggedIn && (
          <div className="bg-ink-panel border border-ink-line rounded p-6 mb-6">
            <h2 className="font-serif text-2xl mb-2">Client Login</h2>
            <p className="text-white/40 mb-4">Enter your name and email to access the mandatory digital waiver.</p>
            <form onSubmit={(e) => { e.preventDefault(); setLoggedIn(true); }}>
              <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Full name" className="w-full mb-3 px-3 py-2 rounded bg-black/40 border border-ink-line" />
              <div className="flex gap-2">
                <button type="submit" className="gold-btn">Continue</button>
              </div>
            </form>
          </div>
        )}

        {loggedIn && (
          <form onSubmit={handleSubmit} className="bg-ink-panel border border-ink-line rounded p-6">
            <h2 className="font-serif text-2xl mb-1">Mandatory Digital Waiver</h2>
            <p className="text-white/40 text-sm mb-4">Please complete the medical history and sign below.</p>

            <div className="mb-4">
              <label className="block text-sm mb-1">Medical history (check all that apply)</label>
              <div className="grid sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={medical.bloodThinners} onChange={() => setMedical(m => ({...m, bloodThinners: !m.bloodThinners}))} />
                  <span className="text-sm">Blood-thinners</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={medical.skinConditions} onChange={() => setMedical(m => ({...m, skinConditions: !m.skinConditions}))} />
                  <span className="text-sm">Chronic skin conditions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={medical.pregnancy} onChange={() => setMedical(m => ({...m, pregnancy: !m.pregnancy}))} />
                  <span className="text-sm">Pregnancy</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={medical.allergies} onChange={() => setMedical(m => ({...m, allergies: !m.allergies}))} />
                  <span className="text-sm">Allergies to inks/latex</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2">Signature</label>
              <div className="border border-ink-line rounded bg-black/20">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                  className="w-full h-40"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={clearCanvas} className="px-3 py-1 border rounded text-sm">Clear</button>
                <button type="submit" className="gold-btn px-4 py-1">Submit Waiver</button>
              </div>
            </div>

            {message && <p className="text-sm mt-2 text-white/60">{message}</p>}
            {signed && <p className="text-sm mt-2 text-green-400">Signed as: {userName}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
