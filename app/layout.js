import './globals.css'

export const metadata = {
  title: 'BG Studio — AI Background Removal & Blending',
  description: 'Remove and replace image backgrounds with AI, powered by Cloudinary.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ink-black text-white min-h-screen antialiased">{children}</body>
    </html>
  )
}
