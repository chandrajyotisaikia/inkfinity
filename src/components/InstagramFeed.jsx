import React, { useEffect } from 'react'
import Reveal from './Reveal.jsx'

export default function InstagramFeed() {
  useEffect(() => {
    // Check if the Elfsight script is already loaded
    if (window.ElfSight) {
      // If already loaded, reinitialize the widget
      if (typeof window.ElfSight.run === 'function') {
        window.ElfSight.run()
      }
      return
    }

    // Create and append the Elfsight script asynchronously
    const script = document.createElement('script')
    script.src = 'https://elfsightcdn.com/platform.js'
    script.async = true
    script.defer = true
    
    // When script loads, initialize widgets
    script.onload = () => {
      if (window.ElfSight && typeof window.ElfSight.run === 'function') {
        window.ElfSight.run()
      }
    }

    // Handle script errors gracefully
    script.onerror = () => {
      console.warn('Failed to load Elfsight widget script from elfsightcdn.com')
    }

    // Append to document head
    document.head.appendChild(script)

    // Cleanup: Optional - Remove script on unmount (only if single instance)
    // Uncomment if you have multiple InstagramFeed components and want to avoid duplication
    // return () => {
    //   if (document.head.contains(script)) {
    //     document.head.removeChild(script)
    //   }
    // }
  }, [])

  return (
    <section id="instagram-feed" className="relative py-28 md:py-36 bg-ink-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow mb-4">Social Presence</p>
          <h2 className="font-serif text-4xl md:text-5xl">
            <span className="text-gold">Live</span> Studio Work
          </h2>
          <p className="mt-4 text-white/60 font-sans text-base">
            Stay connected with our latest tattoo art, behind-the-scenes moments, and studio culture on Instagram.
          </p>
        </Reveal>
      </div>

      {/* Instagram Widget Container */}
      <div className="max-w-4xl mx-auto px-6">
        <Reveal delay={0.1} y={20}>
          <div className="relative rounded-xl overflow-hidden shadow-gold border border-ink-line/30 bg-ink-panel">
            {/* Elfsight Widget - Preserve exact class name and data attribute */}
            <div className="elfsight-app-f1d2294d-1a7c-43bd-9015-4ed0ff282d59" data-elfsight-app-lazy />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
