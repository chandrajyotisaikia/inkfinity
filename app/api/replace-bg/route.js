import { NextResponse } from 'next/server'
import cloudinary, { assertCloudinaryConfigured } from '@/lib/cloudinary'

export const runtime = 'nodejs'

// Cloudinary named colors / hex are both valid for the `background` param.
const HEX_COLOR_RE = /^#?[0-9a-fA-F]{6}$/

export async function POST(request) {
  try {
    assertCloudinaryConfigured()

    const body = await request.json()
    const { publicId, mode, color, prompt } = body

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'Missing publicId.' }, { status: 400 })
    }
    if (mode !== 'color' && mode !== 'generative') {
      return NextResponse.json(
        { error: 'mode must be "color" or "generative".' },
        { status: 400 },
      )
    }

    let transformation

    if (mode === 'color') {
      if (!color || !HEX_COLOR_RE.test(color)) {
        return NextResponse.json(
          { error: 'color must be a 6-digit hex value, e.g. "#1e293b".' },
          { status: 400 },
        )
      }
      const hex = color.replace('#', '')
      // Two-step composite: remove the existing background, then pad the
      // transparent result onto a solid-color canvas of the same size.
      // This is the well-documented, reliable path (no generative model
      // involved) and always produces a correct result.
      transformation = [
        { effect: 'background_removal' },
        {
          background: `#${hex}`,
          crop: 'pad',
          width: 'iw',
          height: 'ih',
        },
      ]
    } else {
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return NextResponse.json(
          { error: 'prompt is required for generative mode.' },
          { status: 400 },
        )
      }
      // Generative background replace: Cloudinary's gen_background_replace
      // effect, prompt passed via the :prompt_<text> suffix. This is a
      // paid AI add-on feature — if the account isn't provisioned for it,
      // Cloudinary returns a 4xx we surface clearly below rather than
      // silently failing.
      const safePrompt = encodeURIComponent(prompt.trim()).replace(/%20/g, '_')
      transformation = [{ effect: `gen_background_replace:prompt_${safePrompt}` }]
    }

    const url = cloudinary.url(publicId, {
      transformation,
      format: 'png',
      secure: true,
    })

    // Generative AI transforms are typically slower than plain background
    // removal (can take 20-30s+ for a first-time generation), so this
    // timeout is longer than remove-bg's — but still bounded, so a stalled
    // Cloudinary response can't hang the route forever.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 40_000)
    let check
    try {
      check = await fetch(url, { method: 'GET', signal: controller.signal })
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        throw Object.assign(
          new Error('Background replace timed out. Please try again, or try the solid color option.'),
          { http_code: 504 },
        )
      }
      throw fetchErr
    } finally {
      clearTimeout(timeoutId)
    }

    if (!check.ok) {
      const isAddonError = check.status === 400 || check.status === 401
      throw Object.assign(
        new Error(
          mode === 'generative' && isAddonError
            ? 'Generative background replace isn\u2019t available on this Cloudinary plan/account. Try the solid color option instead.'
            : check.status === 423
              ? 'Still processing — please try again in a few seconds.'
              : `Background replace failed (status ${check.status}).`,
        ),
        { http_code: check.status === 423 ? 503 : 502 },
      )
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Replace-bg error:', err)
    const status =
      Number.isInteger(err?.http_code) && err.http_code >= 400 && err.http_code < 600
        ? err.http_code
        : 500
    return NextResponse.json(
      { error: err?.message || 'Background replace failed. Please try again.' },
      { status },
    )
  }
}
