import { NextResponse } from 'next/server'
import cloudinary, { assertCloudinaryConfigured } from '@/lib/cloudinary'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    assertCloudinaryConfigured()

    const body = await request.json()
    const { publicId } = body

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'Missing publicId.' }, { status: 400 })
    }

    // e_background_removal is Cloudinary's current recommended on-the-fly
    // transformation (URL-based, keeps the original asset intact) — this
    // replaced the older upload-time "background_removal: cloudinary_ai"
    // parameter, which required registering a separate add-on.
    const url = cloudinary.url(publicId, {
      effect: 'background_removal',
      format: 'png', // must be PNG/WebP to preserve transparency
      secure: true,
    })

    // Cloudinary generates the transformed asset lazily on first request to
    // the URL. We proactively fetch it once here so the API only returns
    // success once the image genuinely exists — otherwise the client could
    // briefly get a 423/black frame on the very first load. AI background
    // removal can take several seconds on first generation for a large
    // image, so the timeout here is generous (25s) rather than the default
    // "fetch never times out" behavior, which could otherwise hang the
    // whole API route indefinitely if Cloudinary stalls.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25_000)
    let check
    try {
      check = await fetch(url, { method: 'GET', signal: controller.signal })
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        throw Object.assign(
          new Error('Background removal timed out. Please try again.'),
          { http_code: 504 },
        )
      }
      throw fetchErr
    } finally {
      clearTimeout(timeoutId)
    }

    if (!check.ok) {
      throw Object.assign(
        new Error(
          check.status === 423
            ? 'Background removal is still processing — please try again in a few seconds.'
            : `Background removal failed (status ${check.status}).`,
        ),
        { http_code: check.status === 423 ? 503 : 502 },
      )
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Remove-bg error:', err)
    const status =
      Number.isInteger(err?.http_code) && err.http_code >= 400 && err.http_code < 600
        ? err.http_code
        : 500
    return NextResponse.json(
      { error: err?.message || 'Background removal failed. Please try again.' },
      { status },
    )
  }
}
