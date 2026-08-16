import { NextResponse } from 'next/server'
import cloudinary, { assertCloudinaryConfigured } from '@/lib/cloudinary'

export const runtime = 'nodejs' // required: the Cloudinary SDK needs Node APIs, not the Edge runtime

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB — generous for a photo, small enough to fail fast on abuse
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** Wraps Cloudinary's callback-based upload_stream in a Promise so we can await it. */
function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
    stream.end(buffer)
  })
}

export async function POST(request) {
  try {
    assertCloudinaryConfigured()

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type "${file.type}". Please upload a JPEG, PNG, or WebP image.` },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 10MB.` },
        { status: 413 },
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadBufferToCloudinary(buffer, {
      folder: 'bg-studio/originals',
      resource_type: 'image',
    })

    return NextResponse.json({
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
    })
  } catch (err) {
    console.error('Upload error:', err)
    // Cloudinary errors carry an http_code; surface it if present and valid,
    // else fall back to 500 rather than trust an unexpected value blindly.
    const status =
      Number.isInteger(err?.http_code) && err.http_code >= 400 && err.http_code < 600
        ? err.http_code
        : 500
    return NextResponse.json(
      { error: err?.message || 'Upload failed. Please try again.' },
      { status },
    )
  }
}
