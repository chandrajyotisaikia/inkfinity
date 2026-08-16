# BG Studio — AI Background Removal & Blending

A Next.js app for removing and replacing image backgrounds, powered by
Cloudinary's AI transformations. Drag-and-drop upload, before/after
comparison slider, solid-color or generative-AI background replace, and a
one-click download.

## Stack

- **Next.js 14** (App Router) — frontend + API routes in one project
- **Cloudinary Node SDK** — all calls run server-side only, in `app/api/*`
- **Tailwind CSS** for styling
- **lucide-react** for icons

No Express, no database, no separate backend service — Next.js API routes
serve as the backend.

## 1. Get your Cloudinary credentials

Sign in to the [Cloudinary console](https://console.cloudinary.com) and open
**Dashboard**. You'll see your Cloud Name, API Key, and API Secret, plus a
combined `CLOUDINARY_URL` string.

> **Security note:** never commit real credentials to git, paste them into a
> chat tool, or hardcode them in source files. This project reads them
> exclusively from environment variables — see step 2.

## 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in **either** the three discrete values:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**or** the single combined URL (comment out or delete the other three if you
use this):

```
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

`.env.local` is already in `.gitignore` — it will never be committed.

## 3. Install and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 4. Using the app

1. Drag and drop (or click to browse) a JPEG/PNG/WebP image, up to 10MB.
2. Click **Remove Background** — this calls Cloudinary's
   `e_background_removal` transformation and shows the result in a
   before/after slider (drag the divider to compare).
3. Pick **Solid Color** (reliable, works on every Cloudinary plan) or
   **AI Generative** (requires Cloudinary's generative background-replace
   add-on — if your account isn't provisioned for it, the app shows a clear
   error and suggests the solid-color option instead).
4. Click **Download** to save the final PNG.

## 5. Deploying

### Render (or any Node host)

1. Push this repo to GitHub.
2. Create a new **Web Service** (not a Static Site — this app needs a
   Node server for the API routes).
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. In the service's **Environment** settings, add the same variables from
   step 2 (`CLOUDINARY_URL` or the three discrete ones). Never put them in
   `render.yaml` or any committed file.

### Vercel

Vercel is Next.js's native host and requires zero config beyond adding the
same environment variables in **Project Settings → Environment Variables**.

## Notes on the AI generative background replace feature

Cloudinary's generative background replace is a paid AI capability that may
require add-on provisioning depending on your plan. If a request to that
feature fails, the app surfaces a clear message and points you to the
solid-color option, which always works and doesn't depend on any add-on.

## Limits worth knowing

- Max upload size: 10MB (enforced both client-side and server-side)
- Accepted types: JPEG, PNG, WebP
- Background removal and generative replace both have generous timeouts
  (25s and 40s respectively) since first-time AI transformations can be
  slow — if Cloudinary is unusually slow, you'll get a clear timeout error
  rather than a hung request.
