# AGENTS.md

Guide for AI agents (and humans) working on SlingSite. Read this first.

> **Maintenance rule:** every change to the codebase must update this file in
> the same change: architecture, conventions, gotchas, the known-issues list
> (add new ones, remove fixed ones), and the changelog at the bottom. If a
> change makes something here wrong, fix it here too.

## What the project is

SlingSite (https://slingsite.github.io) resizes, compresses and converts
images and videos **entirely in the browser**. There is no backend. Two kinds
of tool page share the same app:

- **Compress pages** (`/image/`, `/video/`): the user picks target sizes (by
  default Mobile/Tablet/Desktop) and gets every size in every format:
  - **Images** → `jpg`, `webp`, `avif`
  - **Videos** → `avc.mp4`, `hevc.mp4`, `vp9.webm`, plus a poster frame in
    the three image formats. Audio is removed by default (web videos usually
    play muted); "Advanced settings" has a "Keep audio" switch.
- **Format pages** (`/image/format/`, `/video/format/`): the user picks the
  output formats (images: the 3 image formats; videos: the 3 video formats,
  no poster). Files keep their original size unless resizing is turned on
  under "Advanced settings". Videos keep their audio by default (same
  switch, also under "Advanced settings").

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

Browser checks can be scripted with Playwright's Chromium (not a project
dependency; use it from a scratch folder). In the Flatpak VS Code setup, its
browsers live in `$XDG_CACHE_HOME/ms-playwright`
(`~/.var/app/com.visualstudio.code/cache/`). Playwright's Chromium can encode
VP9 and H.264 but not HEVC, so `hevc.mp4` needs real Chrome. Converting a VP9
webm to `vp9.webm` at the same size skips re-encoding, so to see real
progress, resize it or change the codec.

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
  page-content/<locale>/{image,video}-format-<slug>.mdx
                                            Conversion pages: copy in frontmatter (title, description, heading, subheading) + article
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
    [locale]/{image,video}/format/[[...slugs]]/page.tsx
                                            Format converter pages: base page + one page per conversion (to-webp, jpg-to-webp…)
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
    format-pages.ts                         Input/output format lists, which format pages exist (getFormatPages), URL slugs, labels
    jobs.ts                                 Job creators (createDimensionsJob/createFormatJob), config validity, job helpers
    mediaDimensions.ts                      getMediumSize (reads original size), scaleToWidth/Height (never upscale)
    compressor/{all,image,video}.ts         Encoding logic (runs inside workers) + default configs
    workers.ts                              Typed postMessage helpers used by workers
    persistence.ts                          Download helpers
    google-drive.ts                         GIS auth + Picker + multipart upload (3 parallel)
    seo.ts                                  siteUrl, toAbsoluteUrl, withDefault (x-default hreflang)
  workers/{image,video}-compressor.ts       Web Worker entry points
```

## Architecture

### Compressor pipeline

1. The server page (`app/[locale]/{image,video}/page.tsx` or
   `.../format/[[...slugs]]/page.tsx`) loads dictionaries and the initial
   config, then renders `CompressorPage` (server: H1, subtitle, JSON-LD) with a
   **client wrapper** as children:
   - `DimensionsCompressorPage` (compress pages): `DimensionsSettings` +
     `createDimensionsJob` + `dimensionsConfigIsValid`, config
     `DimensionsConfig` (`{sizes: SizingConfigs, keepAudio}`) from
     `getDefaultCompressionConfig`.
   - `FormatCompressorPage` (format pages): `FormatSettings` +
     `createFormatJob` + `formatConfigIsValid`, config `FormatConfig` from
     `getDefaultFormatConfig`.

   The wrappers exist because the settings component and job creator are
   functions, which can't be passed from a server component.

2. Both wrappers render the generic `CompressorApp<Config>` (client). It owns
   the state (`files` picked but not started, `jobs`, `config`) and the shell:
   `FileUpload` → files grid + `renderSettings({config, setConfig})` + Start
   button (disabled while `configIsValid(config)` is false) →
   `Results`/`FileItem`. Settings come in as a **render prop**, not a
   component, so wrappers can define them inline without remounting them.
3. "Start" → `createJob(file, config)` per file (`utils/jobs.ts`). Both
   creators read the original dimensions with `getMediumSize`, compute
   `requestedDimensions` and `requestedFormats` **per config name**, and build
   `tasks[configName][format] = {status:'waiting'}`:
   - `createDimensionsJob`: one entry per enabled device; formats come from the
     file type (image → image formats; video → video + image formats).
   - `createFormatJob`: with resizing off, one entry named
     `format-settings.converted` at the original size; otherwise one per
     `FormatConfig.versions[]` entry. Every entry gets `config.formats`.

   Both copy `config.keepAudio` onto the job (`Job.keepAudio`).

4. A `useEffect` in `CompressorApp` runs **one job at a time**: the first
   incomplete job is sent through `useCompressor().compress()`. If a different
   job is running, it aborts (terminates and recreates the worker).
5. `useCompressor` posts an `InputMessage` to the worker (`formats` is a
   `Record<configName, Format[]>`, plus `keepAudio`, which the image worker
   ignores). The worker replies with `OutputMessage`s
   (`types/workers.ts`): `progress`, `result`, `error`, and `status: ready`
   once it has finished (and once at startup).
6. Workers:
   - `image-compressor.ts` → `compressImage()`: `createImageBitmap` →
     `OffscreenCanvas` resize → native `convertToBlob` if the browser supports
     the MIME type (probed once at load), otherwise the @jsquash WASM encoder.
     Quality 0.8 for the native path. Configs with no formats are skipped.
   - `video-compressor.ts` → `compressVideo()` (mediabunny `Conversion`,
     `fit: 'contain'`, audio discarded unless `keepAudio`; when kept,
     mediabunny copies the packets if it can and transcodes otherwise, e.g.
     AAC → Opus for webm). If a kept audio track can't be read or encoded,
     the task errors instead of silently producing a mute file. Only if some
     config asks for an image format does it call `extractFirstFrame()`
     (mediabunny `CanvasSink`) and run `compressImage()` on the poster frame.
7. Output filenames: `<name>-compressed-<configName>.<format>`
   (`getCompressedFileName`). When the browser can't encode a video codec
   (typically HEVC), the task errors with a readable message.

Sizing (`types/config.ts`): each `SizingConfig` has `sizingType`
`percentage` (screenWidth × percentage, the default), `width`, or `height`.
In a `FormatConfig` version, `percentage` is a percentage **of the original**.
The other dimension always keeps the aspect ratio, and nothing is upscaled.

`format-settings.tsx` exports `FormatPicker` (format toggles) and
`ResizeSettings` (resize switch + one card per `versions[]` entry, with a
"More sizes" button). Version names are output config names, so they must
stay unique: new ones are `<resized>-2`, `<resized>-3`….
`FormatSettings` shows the picker first and puts `ResizeSettings` (and, for
videos, `AudioSettings`) behind a collapsible "Advanced settings". Future
resize pages are meant to swap the first two.

Shared settings pieces: `switch.tsx` (the toggle), `advanced-settings.tsx`
(the collapsible; `activeLabels` are badges for settings that differ from
the page defaults, shown while collapsed, and open it on mount) and
`audio-settings.tsx` (`AudioSettings` card + `getAudioActiveLabels`). Both
settings components take an optional `audio` prop (`defaultKeepAudio` =
`initialConfig.keepAudio`, plus the `audio-settings` dictionary); only the
video pages pass it, so image pages show no audio toggle (and `/image/` has
no advanced section at all).

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
  `/image/format/[[...slugs]]`, `/video/format/[[...slugs]]`, `/subscribe/`,
  `/content/[...slugs]`. `/content/[...slugs]` is a _logical_
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

**Conversion pages (format children):** `getFormatPages(type)` in
`utils/format-pages.ts` is the single source of truth. It returns the base
page, one `to-<output>` page per output format and one
`<source>-to-<output>` page per input × output pair (never a format to
itself). Inputs come from `inputFormats` (also shown in the upload box);
outputs are named by `outputFormatSlugs` (`avc.mp4` → `mp4`, `hevc.mp4` →
`hevc`, `vp9.webm` → `webm`). Static params, the sitemap and
`FormatPageLinks` (the links block under the base format pages only) all read from
it. Each conversion page **requires** a
`content/page-content/<locale>/<type>-format-<slug>.mdx` in every locale: its
frontmatter `title`/`description`/`heading`/`subheading` feed the metadata
and H1, and the build throws if one is missing. So adding an input or output
format means writing those MDX files for all 7 locales. The base pages keep
using the `format/*` dictionaries. Copy must match real behavior: JPG output
fills transparency with white, GIFs keep only the first frame, and HEVC
encoding depends on the browser and hardware. Format pages keep the audio
by default (it can be turned off), so the copy may say so, but it must not
promise audio is kept in every case (an unreadable audio codec makes the
conversion fail with a message).

**Add an output format:** extend `imageFormats`/`videoFormats` in
`utils/formats.ts`, then the encoder maps in `utils/compressor/image.ts`
(`wasmEncoders`, `getMimeType`, `calculateSupportedEncoders`) or `video.ts`
(`outputFormats`, `outputCodecs`).

Progress: `jobProportionOfDoneTasks` counts finished tasks only (it gates
"download all" and the "in queue" state). The progress bar in `FileItem`
uses `jobProgress`, which also counts running tasks by their `percentage`.
Video outputs report it (mediabunny `onProgress`); images don't.

### Navigation

`nav-bar.tsx` groups pages into `NavGroup`s (Images, Videos). On desktop each
group is a `NavDropdown` (opens on hover or click). In the mobile drawer it's
a heading with its links. As with the language selector, the dropdown links
are always in the DOM (hidden with CSS + `inert`) so crawlers see them. Both
active checks compare `usePathname()` with `hrefPathname(href)` (`nav-link.tsx`).

Image encoding flattens JPG output onto white (`compressImage`), because
JPG encoders turn transparent pixels black. `getMediumSize` treats `.mov`/`.mkv`
files with an empty MIME type as video.

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
- With static export, the base page of an optional catch-all is generated
  from `{ slugs: [] }`. Links to it use
  `{ pathname: '/image/format/[[...slugs]]', params: { slugs: [] } }`.
  `usePathname()` returns the route template, so active checks use
  `hrefPathname(href)`.
- The language selector reads catch-all slugs with `useParams()` for the
  format pages: `useSelectedLayoutSegments` doesn't split catch-alls.
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
3. `utils/google-drive.ts`: `uploadSingleFileToGoogleDrive` returns `false`
   after the last retry instead of throwing, so failed uploads are shown as
   "completed". The auth callback also lacks a `return` after `reject`.
4. Errors thrown inside `compressImage`/`compressVideo` (e.g. a WASM encoder
   failure, or `conversion.execute()` rejecting) aren't caught per task. The
   worker never sends `ready`, so the compressor stays `working` forever.
   `extractFirstFrame` doesn't propagate rejections from its nested promises,
   so it can hang.
5. `app/[locale]/[slug1]/page.tsx` `generateMetadata` builds post hreflang
   URLs with `slugs: [translation.slugPath]` (an array inside an array). It
   should be `slugs: translation.slugPath`.
6. `components/language-selector.tsx` is a client component importing
   `@/content/lib`, which bundles every post (`allPosts`) into the client JS.
7. `@ffmpeg/*` is installed and copied by CopyPlugin, but nothing imports it
   (video uses mediabunny). It's dead weight.
8. Object URLs leak: the files grid in `CompressorApp` calls
   `URL.createObjectURL` on every render, and `Job.originalFileObjectURL` is never revoked.
9. The upload-status panel strings in `components/results.tsx` are hard-coded
   English.
10. `README.md` describes only the image flow (3 formats × 3 sizes).
11. `dictioraries/compression/image/metadata/ar.json`: the Arabic description
    has a fragment of the video description pasted into it.
12. Format pages: output files are still named
    `<name>-compressed-<configName>.<ext>` (e.g. `photo-compressed-Converted.webp`),
    and the results panel still says "Compressed files". `PageContent` slugs
    `image-format`/`video-format` (the base pages) have no MDX article yet.

## Next steps (planned)

1. **Resize pages**, the same as the format pages but with `ResizeSettings` as
   the main section and `FormatPicker` behind "more settings".

## Changelog

- 2026-10-24: Created AGENTS.md from a full code review of `master` (`8fb2556`).
- 2026-10-24: Added the format converter pages (`/image/format/`,
  `/video/format/`). `CompressorApp` is now generic over the config, with
  client wrappers (`DimensionsCompressorPage`, `FormatCompressorPage`) and job
  creators in `utils/jobs.ts`. Jobs carry per-config formats. Added nav links,
  sitemap and language-selector support, new `format/*`, `format-settings` and
  `formats` dictionaries. Fixed the missing desktop icon, the video page's
  Twitter image and the English "Compress All" label.
- 2026-10-24: Grouped the nav into Images/Videos dropdowns (`nav-dropdown.tsx`).
  The format pages' resize settings support several sizes ("More sizes"). The
  file progress bar now counts running video outputs by their percentage
  (`jobProgress`).
- 2026-10-24: `NavDropdown` aligns its menu to the end edge (so it stays on
  screen) and ignores the click that lands right after a hover opened it.
- 2026-10-25: Conversion pages: `/<type>/format/to-<output>/` and
  `/<type>/format/<source>-to-<output>/` (28 pages × 7 locales) with the output
  preselected, specialized copy in PageContent MDX frontmatter + article, and a
  links block (`FormatPageLinks`) on every format page. Unified input format
  list (upload box now lists AVIF, MOV, MKV). JPG output is flattened onto
  white instead of black. Readable error when a video codec can't be encoded.
- 2026-10-25: Removed every mention of audio being stripped from the
  conversion pages copy and `llms.txt` (replaced by a resize FAQ where needed).
- 2026-10-25: The conversion links block is shown only on the base
  `/<type>/format/` pages, not on the conversion pages.
- 2026-10-25: Restyled `FormatPageLinks`: gradient cards for the `to-<output>`
  pages and one card per source format with chips per target.
- 2026-10-25: Audio removal is now optional (`keepAudio` in
  `DimensionsConfig`/`FormatConfig`, carried on `Job` and `InputMessage`).
  "Keep audio" switch under "Advanced settings" on the video pages: off by
  default on `/video/`, on by default on the video format pages. New
  `audio-settings` dictionary and `settings.advancedSettings`. Extracted
  `Switch` and `AdvancedSettings` into their own components.
- 2026-10-25: Toned down `FormatPageLinks` (bordered rows, no gradients) so
  it doesn't compete with the upload box, the page's main action.
