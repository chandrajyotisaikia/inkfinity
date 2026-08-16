import { v2 as cloudinary } from 'cloudinary'

/**
 * SECURITY: this file must only ever be imported from server-side code
 * (app/api/*/route.js). Next.js API routes run exclusively on the server,
 * so importing this here is safe — but never import this file from a
 * client component ('use client'), or the credentials would be bundled
 * into JS shipped to the browser.
 *
 * Credentials come from environment variables only. Set these in
 * .env.local for local dev (see .env.example) and in your host's
 * environment variable settings (Render/Vercel dashboard) for deploys.
 * Nothing is hardcoded here or anywhere else in this codebase.
 */
if (process.env.CLOUDINARY_URL) {
  // CLOUDINARY_URL (cloudinary://key:secret@cloud_name) configures the SDK
  // automatically when present — no extra config() call needed for it,
  // but we still call config() explicitly below so `secure: true` always
  // applies regardless of which env var style is used.
  cloudinary.config({ secure: true })
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/** Throws a clear error early if credentials are missing, instead of a
 * confusing Cloudinary API error later. Call this at the top of each
 * API route handler. */
export function assertCloudinaryConfigured() {
  const cfg = cloudinary.config()
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET in your environment.',
    )
  }
}

export default cloudinary
