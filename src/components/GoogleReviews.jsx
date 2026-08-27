import React from 'react'
import Reveal from './Reveal.jsx'

export default function GoogleReviews() {
  return (
    <section id="reviews" className="relative py-28 md:py-36 bg-ink-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow mb-4">Client Testimonials</p>
          <h2 className="font-serif text-4xl md:text-5xl">
            <span className="text-gold">Word of Mouth</span> from Our Studio
          </h2>
          <p className="mt-4 text-white/60 font-sans text-base">
            Real experiences and honest feedback from the artists and clients who trust Inkfinity with their vision.
          </p>
        </Reveal>
      </div>

      {/* Google Reviews Widget Container */}
      <div className="max-w-4xl mx-auto px-6">
        <Reveal delay={0.1} y={20}>
          <div className="relative rounded-xl overflow-hidden shadow-gold border border-ink-line/30 bg-ink-panel">
            {/* Elfsight Google Reviews Widget - Preserve exact class name and data attribute */}
            <div className="elfsight-app-0e782ac3-d1f1-4c78-9664-952364de5b33" data-elfsight-app-lazy />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
