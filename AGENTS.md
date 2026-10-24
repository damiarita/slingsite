# AGENTS.md

Guide for AI agents (and humans) working on SlingSite. Read this first.

> **Maintenance rule:** every change to the codebase must update this file in
> the same change: architecture, conventions, gotchas, the known-issues list
> (add new ones, remove fixed ones), and the changelog at the bottom. If a
> change makes something here wrong, fix it here too.

## What the project is

SlingSite (https://slingsite.github.io) resizes and compresses images and
videos **entirely in the browser**. There is no backend. The user picks target
sizes (by default Mobile/Tablet/Desktop) and gets every size in every format:

- **Images** → `jpg`, `webp`, `avif`
- **Videos** → `avc.mp4`, `hevc.mp4`, `vp9.webm` (no audio), plus a poster
  frame in the three image formats

Results can be downloaded or uploaded to Google Drive. The site also hosts
multilingual MDX content (comparison articles, legal pages) for SEO.

## Commands

| Task        | Command            | Notes                                                                                      |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------ |
| Dev server  | `npm run dev`      | Uses **webpack** (`--webpack`). Turbopack is not supported by the config.                  |
| Build       | `npm run build`    | Static export to `out/`. Also regenerates `.contentlayer/`.                                |
| Serve build | `npm start`        | `serve out`                                                                                |
| Format      | `npm run format`   | Prettier. Runs on staged files via the husky pre-commit hook (`lint-staged`).              |
| Type-check  | `npx tsc --noEmit` | If it complains about missing files under `.next/types`, run `rm -rf .next` (stale build). |
| Lint        | `npm run lint`     | **Currently broken**, see Known issues #1.                                                 |

There are no tests. Verify changes with `npx tsc --noEmit` and
`npm run build`, then check in `npm run dev`.

Env vars (in `.env.local`, git-ignored): `NEXT_PUBLIC_GOOGLE_CLIENT_ID`,
`NEXT_PUBLIC_GOOGLE_API_KEY` (Google Drive), and optionally
`NEXT_PUBLIC_SITE_URL` (defaults to `https://slingsite.github.io/`).

## Deployment / CI

- Push to `master` → `.github/workflows/deploy.yml` builds and pushes `out/` to
  the `gh-pages` branch of `slingsite/slingsite.github.io` (GitHub Pages).
- PRs to `master` → `.github/workflows/test-prs.yml` runs `npm run lint` and
  `npm run build`.
- Dependabot opens daily npm update PRs.

GitHub Pages implications: **`output: 'export'` (static only)**, no server
code, no API routes, no middleware, no runtime redirects, no custom headers
(so no COOP/COEP and no `SharedArrayBuffer`). `trailingSlash: true`: all
internal paths end in `/`.

## Stack

Next.js 16 (App Router, static export, webpack) · React 19 · TypeScript
(strict) · Tailwind CSS 4 (+ typography) · next-intl 4 · contentlayer2 +
next-mdx-remote · mediabunny (video) · @jsquash/{jpeg,webp,avif} (WASM image
encoders) · lucide-react icons · vanilla-cookieconsent · GTM/GA4.

Path alias: `@/*` → `src/*`; `contentlayer/generated` → `.contentlayer/generated`.

## Directory map

```
content/
  page-content/<locale>/{image,video}.mdx   SEO copy + <FAQ> blocks under each compressor
  posts/<locale>/<folder>/<file>.mdx        Articles (vs/…, legal/…)
contentlayer.config.ts                      Post + PageContent document types
next.config.ts                              Static export, webpack tweaks, next-intl plugin
src/
  app/
    layout.tsx                              Root layout: only metadataBase, returns children
    page.tsx                                "/" → client redirect to /<browser-locale>/image/
    not-found.tsx                           Single 404.html for the whole site (default locale)
    sitemap.ts                              Static sitemap with hreflang alternates
    [locale]/layout.tsx                     Wraps every page in components/layout.tsx
    [locale]/page.tsx                       → redirect to /<locale>/image/
    [locale]/image/page.tsx                 Image compressor page
    [locale]/video/page.tsx                 Video compressor page
    [locale]/subscribe/page.tsx             Brevo newsletter form (raw HTML via dangerouslySetInnerHTML)
    [locale]/suscribe/page.tsx              Legacy typo URL → redirect to /subscribe/
    [locale]/[slug1]/page.tsx               Root post OR folder listing
    [locale]/[slug1]/[slug2]/page.tsx       Post inside a folder
  components/                               UI (see "Compressor pipeline" for the key ones)
  content/lib.ts                            Queries over contentlayer posts (translations, folders)
  hooks/use-compressor.ts                   Owns the Web Worker, exposes compress/abort/status
  i18n/
    routing.ts                              Locales, default locale, typed pathnames, RTL helper
    navigation.ts                           Wrapped Link (locale REQUIRED), getPathname, redirect…
    requests.ts                             next-intl config + one getter per dictionary
    type.ts                                 TypeScript shape of every dictionary
    dictioraries/<name>/<locale>.json       Translation JSON (sic: "dictioraries")
  types/                                    Shared types (job, config, workers, persistence…)
  utils/
    formats.ts                              Format lists + type guards
    jobs.ts                                 Job creation (target dimensions, task matrix) + helpers
    compressor/{all,image,video}.ts         Encoding logic (runs inside workers) + default configs
    workers.ts                              Typed postMessage helpers used by workers
    persistence.ts                          Download helpers
    google-drive.ts                         GIS auth + Picker + multipart upload (3 parallel)
    seo.ts                                  siteUrl, toAbsoluteUrl, withDefault (x-default hreflang)
  workers/{image,video}-compressor.ts       Web Worker entry points
```

## Architecture

### Compressor pipeline

1. `app/[locale]/{image,video}/page.tsx` (server) loads dictionaries and the
   default sizing configs (`getDefaultCompressionConfig`), then renders
   `CompressorPage` (server: title + JSON-LD) → `CompressorApp` (client).
2. `CompressorApp` holds state: `files` (picked, not started), `jobs`, and
   `configs` (`SizingConfigs`). UI steps: `FileUpload` → `DimensionsSettings`
   → `Results`/`FileItem`.
3. "Start" → `createJob()` (`utils/jobs.ts`) per file: reads the original
   dimensions (via `<img>`/`<video>`), computes `requestedDimensions` per
   enabled config (never upscales: `minDimension`), picks formats (images:
   image formats; videos: video formats + image formats for the poster), and
   builds `tasks[configName][format] = {status:'waiting'}`.
4. A `useEffect` in `CompressorApp` runs **one job at a time**: the first
   incomplete job is sent through `useCompressor().compress()`. If a different
   job is running, it aborts (terminates and recreates the worker).
5. `useCompressor` posts an `InputMessage` to the worker. The worker replies
   with `OutputMessage`s (`types/workers.ts`): `progress`, `result`, `error`,
   and `status: ready` once it has finished (and once at startup).
6. Workers:
   - `image-compressor.ts` → `compressImage()`: `createImageBitmap` →
     `OffscreenCanvas` resize → native `convertToBlob` if the browser supports
     the MIME type (probed once at load), otherwise the @jsquash WASM encoder.
     Quality 0.8 for the native path.
   - `video-compressor.ts` → `extractFirstFrame()` (mediabunny `CanvasSink`) +
     `compressVideo()` (mediabunny `Conversion`, audio discarded,
     `fit: 'contain'`), then runs `compressImage()` on the poster frame.
7. Output filenames: `<name>-compressed-<configName>.<format>`
   (`getCompressedFileName`).

Sizing (`types/config.ts`): each config has `sizingType` `percentage`
(screenWidth × percentage, the default), `width`, or `height`. The other
dimension keeps the aspect ratio.

**Config names are the translated device labels** (from
`dictioraries/devices`). They are the keys of `SizingConfigs`, they are shown
in the UI, and they appear in output filenames. `iconType` (`mobile` |
`tablet` | `desktop`) selects the icon.

### i18n

- Locales: `en` (default), `es`, `ar` (RTL), `de`, `fr`, `it`, `zh`, in
  `i18n/routing.ts`. `localePrefix: 'always'`, so every URL starts with
  `/<locale>/`.
- next-intl's request config is intentionally static (it reads no headers) to
  keep pages statically renderable. The locale comes from the `[locale]` route
  param and is **passed down explicitly as props**. `NextIntlClientProvider`
  receives `messages={{}}`: we do not use `useTranslations`.
- Translations are plain JSON loaded by server components through getters in
  `i18n/requests.ts` and passed to client components as props.
- Typed pathnames (`routing.pathnames`): `/home/`, `/image/`, `/video/`,
  `/subscribe/`, `/content/[...slugs]`. `/content/[...slugs]` is a _logical_
  name mapped to `/[...slugs]`. The physical routes are `[slug1]` and
  `[slug1]/[slug2]`.
- Always use `Link` from `@/i18n/navigation`, which **requires** a `locale`
  prop: automatic locale detection does not work with static export.
- `app/page.tsx` and `[locale]/page.tsx` redirect on the client
  (`Redirecter`): it waits 1 s, and `window.redirect` is exposed so GTM can
  trigger it.

### Content (contentlayer2)

- `Post` (`content/posts/**`) frontmatter: `title`, `description`,
  `publicationDate`, `modificationDate`, `locale`, `slug`, `articleType`
  (schema.org type), optional `folder`.
- **Translations of a post are linked by identical file name** across locale
  folders (`id` = source file name, e.g. `kraken.mdx`). `slug` and `folder`
  are translated per locale; the URL is `/<locale>/<urlSlug(folder)>/<slug>/`.
- `PageContent` (`content/page-content/<locale>/{image,video}.mdx`) is rendered
  under the compressors by `components/page-content.tsx`. `<FAQ question="…">`
  blocks are parsed with a regex in `contentlayer.config.ts` to build FAQPage
  JSON-LD, so keep that exact syntax.
- The footer links specific posts by id (`BlogLink postId="kraken.mdx"`).
  `BlogLink` **throws at build time** if the post is missing for any locale.

### SEO and analytics

- Every page builds `alternates.languages` with `withDefault()` (adds
  `x-default` = `en`), plus OpenGraph and Twitter metadata. Screenshots live
  in `public/screenshots/`.
- `sitemap.ts` must list every pathname except `/home/`. It uses an
  exhaustive `switch`, so adding a pathname to `routing` forces you to handle it.
- `public/llms.txt` and `public/robots.txt` are hand-maintained.
- Analytics: GTM `GTM-THHRLH4N` in `components/body.tsx`. Every page renders
  `<BaseDatalayer pageType pageSubtype>`, which pushes a `page_view`. Consent
  Mode v2 defaults are set in `components/cookie-consent.tsx`.

### Layout

`components/layout.tsx` renders `<html>/<body>` (via `Body`), the nav bar,
the footer and the cookie consent. The root `app/layout.tsx` only returns
children; `app/page.tsx` uses `Body` directly. The language selector renders
all locale links in the static HTML (hidden with CSS) on purpose, so crawlers
see them.

## Conventions

- Prettier: single quotes, semicolons, trailing commas, width 80, 2 spaces.
- Server components by default. Mark `'use client'` only where state, effects
  or browser APIs are needed. Fetch translations on the server and pass them
  as props.
- File names: kebab-case for components. Types live in `src/types/`, pure
  helpers in `src/utils/`.
- Tailwind utility classes inline. No CSS modules. Icons from `lucide-react`.
- Discriminated unions with a `status` field for task state (`Task`,
  `FilePersistenceJobStatus`).
- Exhaustive `switch` with a `never` check where the set of cases is a union
  (pathnames).
- Comments explain _why_ (see `next.config.ts`, `not-found.tsx`), not _what_.

## How to…

**Add a translation dictionary:** create
`src/i18n/dictioraries/<name>/<locale>.json` for **all 7 locales**, add its
interface to `i18n/type.ts`, add a `get<Name>Dictionary` in
`i18n/requests.ts` with `createDictionaryGetter`, call it in a server
component, and pass the result down as props.

**Add a locale:** add it to `locales` in `routing.ts` (and to `rtlLocales` if
RTL), add a JSON file to every dictionary folder plus an importer line in
every getter in `requests.ts`, add `languageNames` in
`language-selector.tsx`, add `content/page-content/<locale>/`, and translate
every post linked from the footer.

**Add a post:** create `content/posts/<locale>/<folder>/<file>.mdx` with the
same `<file>.mdx` name in each locale. Static params, sitemap and hreflang
pick it up automatically.

**Add a page/route:** add the pathname to `routing.pathnames`, create
`app/[locale]/<route>/page.tsx` with `generateMetadata` (canonical, languages
with `withDefault`, OG/Twitter) and a `<BaseDatalayer>`, then handle it in
`sitemap.ts` and `language-selector.tsx` (`getUrls`). The exhaustive switches
will flag the places you missed.

**Add an output format:** extend `imageFormats`/`videoFormats` in
`utils/formats.ts`, then the encoder maps in `utils/compressor/image.ts`
(`wasmEncoders`, `getMimeType`, `calculateSupportedEncoders`) or `video.ts`
(`outputFormats`, `outputCodecs`).

## Gotchas

- The dictionary folder is spelled **`dictioraries`**. Don't "fix" it without
  updating every import.
- `next.config.ts` aliases the multi-threaded AVIF encoder to the
  single-threaded one: GitHub Pages can't send COOP/COEP headers, and the MT
  build's nested worker breaks webpack chunking. Keep it.
- After switching branches, stale `.next/types` makes `tsc` fail on routes
  that no longer exist. Delete `.next`.
- `.contentlayer/` is generated (by `dev`/`build`). Imports from
  `contentlayer/generated` fail until it exists.
- `public/ffmpeg` and `static/ffmpeg` are build outputs (CopyPlugin), not source.
- The subscribe page embeds raw Brevo HTML/JS (with reCAPTCHA `hl=es`).
  Edit it as an opaque blob.

## Known issues (found in the 2026-10-24 review, not fixed yet)

1. **Lint is broken, so the PR CI fails.** `next lint` was removed in
   Next 16, and `eslint.config.mjs` uses `FlatCompat` with `eslint-config-next`
   16, which crashes ("Converting circular structure to JSON"). Fix: import
   the flat configs from `eslint-config-next` directly and set
   `"lint": "eslint ."`.
2. `hooks/use-compressor.ts` `createWorker()` instantiates **both** workers
   and uses only one. The other is never terminated (it leaks, and loads its
   codecs for nothing).
3. `getDefaultCompressionConfig` (`utils/compressor/all.ts`): the desktop
   entry uses `icon: 'desktop'` instead of `iconType`, so no desktop icon is
   shown.
4. `utils/google-drive.ts`: `uploadSingleFileToGoogleDrive` returns `false`
   after the last retry instead of throwing, so failed uploads are shown as
   "completed". The auth callback also lacks a `return` after `reject`.
5. Errors thrown inside `compressImage`/`compressVideo` (e.g. a WASM encoder
   failure, or `conversion.execute()` rejecting) aren't caught per task. The
   worker never sends `ready`, so the compressor stays `working` forever.
   `extractFirstFrame` doesn't propagate rejections from its nested promises,
   so it can hang.
6. `app/[locale]/[slug1]/page.tsx` `generateMetadata` builds post hreflang
   URLs with `slugs: [translation.slugPath]` (an array inside an array). It
   should be `slugs: translation.slugPath`.
7. `components/language-selector.tsx` is a client component importing
   `@/content/lib`, which bundles every post (`allPosts`) into the client JS.
8. `@ffmpeg/*` is installed and copied by CopyPlugin, but nothing imports it
   (video uses mediabunny). It's dead weight.
9. Object URLs leak: `DimensionsSettings` calls `URL.createObjectURL` on every
   render, and `Job.originalFileObjectURL` is never revoked.
10. The upload-status panel strings in `components/results.tsx` are hard-coded
    English.
11. The video page's Twitter card uses `/screenshots/image.jpg` (OpenGraph
    correctly uses `video.jpg`).
12. `README.md` describes only the image flow (3 formats × 3 sizes).

## In-progress work

- `stash@{0}` (from branch `feat/format`) holds a "format" feature: format-only
  compressor pages (`app/[locale]/{image,video}/format/`),
  `format-compressor-page.tsx`, `format-settings.tsx`,
  `dimensions-compressor-page.tsx`, and new `formats`/`format-settings`
  dictionaries. When it lands, document it here.

## Changelog

- 2026-10-24: Created AGENTS.md from a full code review of `master` (`8fb2556`).
