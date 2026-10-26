# AGENTS.md

Guide for AI agents (and humans) working on SlingSite. Read this first.

> **Maintenance rule:** every change to the codebase must update this file in
> the same change: architecture, conventions, gotchas, the known-issues list
> (add new ones, remove fixed ones), and the changelog at the bottom. If a
> change makes something here wrong, fix it here too.

## What the project is

SlingSite (https://slingsite.github.io) resizes, compresses and converts
images and videos, and extracts video thumbnails, **entirely in the browser**.
There is no backend. The home page (`/<locale>/`) is a landing page that
introduces every tool. The tool pages share the same app:

- **Compress pages** (`/image/`, `/video/`): the user picks target sizes (by
  default Mobile/Tablet/Desktop) and gets every size in every format:
  - **Images** → `jpg`, `webp`, `avif`
  - **Videos** → `avc.mp4`, `hevc.mp4`, `vp9.webm`, plus a poster frame in
    the three image formats. Audio is removed by default (web videos usually
    play muted); "Advanced settings" has a "Keep audio" switch.
- **Format pages** (`/image/format/`, `/video/format/`): the user picks the
  output formats (images: the 4 image formats, PNG included; videos: the 3
  video formats, no poster). Files keep their original size unless resizing
  is turned on under "Advanced settings". Videos keep their audio by default
  (same switch, also under "Advanced settings").
- **Resize pages** (`/image/resize/`, `/video/resize/`): the same app with
  the sizes first (always on, 50% by default) and the format picker under
  "Advanced settings". By default each file keeps its own format
  ("Original format": GIF → WebP, MOV/MKV → MP4).
- **Thumbnail pages** (`/video/thumbnail/`): save the first frame of each
  video as an image (JPG by default; JPG/WebP/AVIF/PNG), resizing under
  "Advanced settings", no audio switch.

Format, resize and thumbnail pages are the **tool pages**: each has a base
page and child pages (see "Tool pages" below). The compress pages never
output PNG (`webImageFormats`).

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
analytics/gtm-container.json                GTM container export (import into GTM), versioned with the events
analytics/sync-gtm-container.mjs            Rebuilds its per-event triggers/tags/DLVs from AnalyticsEventParams
content/
  page-content/<locale>/{image,video}.mdx   SEO copy + <FAQ> blocks under each compressor
  page-content/<locale>/<type>-<tool>[-<slug>].mdx
                                            Tool pages: copy in frontmatter (title, description, heading, subheading) + article
  page-content/<locale>/home.mdx            Article + FAQs under the home page
  posts/<locale>/<folder>/<file>.mdx        Articles (vs/…, legal/…)
contentlayer.config.ts                      Post + PageContent document types
next.config.ts                              Static export, webpack tweaks, next-intl plugin
src/
  app/
    layout.tsx                              Root layout: only metadataBase, returns children
    page.tsx                                "/" → client redirect to /<browser-locale>/ (home)
    not-found.tsx                           Single 404.html for the whole site (default locale)
    sitemap.ts                              Static sitemap with hreflang alternates
    [locale]/layout.tsx                     Wraps every page in components/layout.tsx
    [locale]/page.tsx                       Home (landing) page: components/home-page.tsx + PageContent "home"
    [locale]/image/page.tsx                 Image compressor page
    [locale]/video/page.tsx                 Video compressor page
    [locale]/{image,video}/{format,resize}/[[...slugs]]/page.tsx
    [locale]/video/thumbnail/[[...slugs]]/page.tsx
                                            Tool pages: ~10 lines each, all logic in components/tool-route.tsx
    [locale]/subscribe/page.tsx             Brevo newsletter form (raw HTML via dangerouslySetInnerHTML)
    [locale]/suscribe/page.tsx              Legacy typo URL → redirect to /subscribe/
    [locale]/[slug1]/page.tsx               Root post OR folder listing
    [locale]/[slug1]/[slug2]/page.tsx       Post inside a folder
  components/                               UI (see "Compressor pipeline" for the key ones)
  content/lib.ts                            Queries over contentlayer posts (translations, folders)
  hooks/use-compressor.ts                   Owns the Web Worker, exposes compress/abort/status
  hooks/use-job-tracking.ts                 Conversion/job/task started+finished events
  i18n/
    routing.ts                              Locales, default locale, typed pathnames, RTL helper
    navigation.ts                           Wrapped Link (locale REQUIRED), getPathname, redirect…
    requests.ts                             next-intl config + one getter per dictionary
    type.ts                                 TypeScript shape of every dictionary
    dictioraries/<name>/<locale>.json       Translation JSON (sic: "dictioraries")
  types/                                    Shared types (job, config, workers, persistence…)
  utils/
    analytics.ts                            The only dataLayer writer: setPageContext, trackEvent, item builders
    tag-manager.ts                          GTM id, consent defaults, inline <head> bootstrap
    formats.ts                              Format lists + type guards
    tool-pages.ts                           Tool registry: pathnames, output formats, which pages exist (getToolPages), URL slugs, labels
    jobs.ts                                 Job creators (createDimensionsJob/createFormatJob), output file names, config validity, job helpers
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
   - `ToolCompressorPage` (format, resize and thumbnail pages, prop `tool`):
     `FormatSettings` + `createFormatJob` + `formatConfigIsValid`, config
     `FormatConfig` from `getDefaultFormatConfig` (built per tool and page in
     `tool-route.tsx` `getInitialConfig`).

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
   - `createFormatJob`: with resizing off, one entry named `unresizedName`
     (`format-settings.converted`, or `thumbnail` on thumbnail pages) at the
     original size; otherwise one per `FormatConfig.versions[]` entry. Every
     entry gets `config.formats`, plus the file's own format
     (`getOriginalOutputFormat`) when `config.originalFormat` is on.

   Both copy `config.keepAudio` onto the job (`Job.keepAudio`) and decide the
   output file names (`Job.outputFileNames[config][format]`).

4. A `useEffect` in `CompressorApp` runs **one job at a time**: the first
   incomplete job is sent through `useCompressor().compress()`. If a different
   job is running, it aborts (terminates and recreates the worker).
5. `useCompressor` posts an `InputMessage` to the worker (`formats` is a
   `Record<configName, Format[]>`, plus `keepAudio`, which the image worker
   ignores, and `fileNames`). The worker replies with `OutputMessage`s
   (`types/workers.ts`): `progress`, `result`, `error`, and `status: ready`
   once it has finished (and once at startup).
6. Workers:
   - `image-compressor.ts` → `compressImage()`: `createImageBitmap` →
     `OffscreenCanvas` resize → native `convertToBlob` if the browser supports
     the MIME type (probed once at load), otherwise the @jsquash WASM encoder.
     PNG has no WASM encoder (every browser encodes it natively). Quality 0.8
     for the native path. Configs with no formats are skipped.
   - `video-compressor.ts` → `compressVideo()` (mediabunny `Conversion`,
     `fit: 'contain'`, audio discarded unless `keepAudio`; when kept,
     mediabunny copies the packets if it can and transcodes otherwise, e.g.
     AAC → Opus for webm). If a kept audio track can't be read or encoded,
     the task errors instead of silently producing a mute file. Only if some
     config asks for an image format does it call `extractFirstFrame()`
     (mediabunny `CanvasSink`) and run `compressImage()` on the poster frame.
     Thumbnail jobs only ask for image formats, so no video is encoded.
7. Output filenames come from the job (`Job.outputFileNames`): compress
   pages `<name>-compressed-<configName>.<format>` (posters
   `<name>-thumbnail-compressed-<configName>.<format>`), tool pages
   `<name>-<kebab(configName)>.<format>` (`getToolFileName`:
   `photo-converted.webp`, `photo-resized-2.jpg`, `clip-thumbnail.jpg`).
   When the browser can't encode a video codec (typically HEVC), the task
   errors with a readable message.

Sizing (`types/config.ts`): each `SizingConfig` has `sizingType`
`percentage` (screenWidth × percentage, the default), `width`, or `height`.
In a `FormatConfig` version, `percentage` is a percentage **of the original**.
The other dimension always keeps the aspect ratio, and nothing is upscaled.

`format-settings.tsx` exports `FormatPicker` (format toggles, plus the
"Original format" row with `showOriginalFormat`) and `ResizeSettings`
(resize switch + one card per `versions[]` entry, with a "More sizes"
button; `required` drops the switch). Version names are output config
names, so they must stay unique: new ones are `<versionName>-2`, `-3`…
(`versionName` is "Resized", or "Thumbnail" on thumbnail pages).
`FormatSettings` has two layouts (`primary`): `'formats'` (format and
thumbnail pages) shows the picker first and puts `ResizeSettings` (and, for
videos, `AudioSettings`) behind a collapsible "Advanced settings";
`'resize'` (resize pages) shows `ResizeSettings` (required) first and puts
the picker and audio behind it. Badges compare against `initialConfig`.
`ToolCompressorPage` also replaces the compress wording of the results
panel (`compressedFiles`, `compressing`) with per-tool strings from the
`format-settings` dictionary.

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
  `/image/format/[[...slugs]]`, `/video/format/[[...slugs]]`,
  `/image/resize/[[...slugs]]`, `/video/resize/[[...slugs]]`,
  `/video/thumbnail/[[...slugs]]`, `/subscribe/`, `/content/[...slugs]`. `/content/[...slugs]` is a _logical_
  name mapped to `/[...slugs]`. The physical routes are `[slug1]` and
  `[slug1]/[slug2]`.
- Always use `Link` from `@/i18n/navigation`, which **requires** a `locale`
  prop: automatic locale detection does not work with static export.
- `app/page.tsx` redirects on the client to the home page in the browser
  locale (`Redirecter`): it waits 1 s, and `window.redirect` is exposed so
  GTM can trigger it.

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
- `sitemap.ts` must list every pathname (home included). It uses an
  exhaustive `switch`, so adding a pathname to `routing` forces you to handle
  it. `toAbsoluteUrl` adds the trailing slash that `getPathname` drops on
  locale roots (`/en` → `/en/`).
- `public/llms.txt` and `public/robots.txt` are hand-maintained.
- Analytics: see "Analytics" below.

### Analytics (GTM → GA4)

- **Bootstrap.** `Body` puts an inline script in `<head>`
  (`utils/tag-manager.ts`). It runs while the HTML is parsed, before React.
  In order, it pushes the consent default, then `{env}`, then loads GTM
  (`gtm.js`). GTM's "needs tracking" check (`env === 'production'`, not
  localhost, or GTM Preview) needs `env` before `gtm.js`. gtag commands
  (`gtag()` in `utils/analytics.ts`) are pushed as an `arguments` object,
  because GTM ignores arrays. `cookie-consent.tsx` only sends the updates.
- **Page context.** Every page renders
  `<BaseDatalayer locale pageType pageSubtype>`, and `pageType` is typed
  (`PageType` in `types/analytics.ts`). On mount and on every pathname change
  it calls `setPageContext`, which pushes
  `{event: 'page_context', locale, page_type, page_subtype}`. GTM sends it as
  GA4's `page_view`, and GA4 fills in the URL itself. The Google tag has
  `send_page_view=false`. The same page and context twice in a row is
  skipped (StrictMode). Events never repeat the context: GTM's data model
  keeps it, and every tag reads it through `VAR-GA4-EVENT_CONFIG`.
- **Events.** Only `trackEvent` writes events. `AnalyticsEventParams` is the
  exact payload of each event. Three rules keep the pushes correct:
  1. **Every event pushes all of its own keys every time.** GTM keeps old
     values, so a completed `task_finished` without `error_kind` would
     inherit an earlier error. When a value doesn't apply, the key is still
     pushed as `undefined`, which the GA4 tag drops. Missing values are
     typed `T | undefined`, never `?:`, so `tsc` enforces this.
  2. **Arrays are cleared first.** GTM merges arrays by index, so
     `trackEvent` pushes `{files: null}` / `{tasks: null}` right before an
     event that carries one. It also splits arrays into pushes of 200
     (GA4's item limit).
  3. **An event carries an array only for entities with no event of their
     own**, so nothing is described twice:
     - files have no per-file event, so `files_added` carries `files`
     - downloads and Drive uploads carry a slim `tasks`
     - conversion and job events carry counts, totals and timing only
     - task events are flat and complete (input and output), so they can
       be reported on in GA4 without joins

  Array entries are GA4 items as pushed: each starts with `item_id` (the
  file or task id, also repeated as `file_id`/`task_id`) and `item_name`
  (`'file'`/`'task'`), because GA4 drops items without them.

  Naming: inputs use `file_*` (`file_type`, `file_format`), outputs use
  `output_*` (`output_format`, `output_width`, `output_size_bytes`), and
  counts are `<entity>_count`. `input_size_bytes` / `output_size_bytes` are
  the bytes in and out; `total_size_bytes` is what the action moved.

  | Event                                            | When                                                               | Array   |
  | ------------------------------------------------ | ------------------------------------------------------------------ | ------- |
  | `files_added`                                    | Drop or pick                                                       | `files` |
  | `conversion_started`                             | Start click (formats as a sorted CSV, resize, keep audio…)         | –       |
  | `conversion_finished`                            | Each job of the conversion finished or removed (`removed_count`)   | –       |
  | `job_started`                                    | The job is sent to the worker (once, even after an abort)          | –       |
  | `job_finished`                                   | A job has no waiting/running task left                             | –       |
  | `task_started`                                   | First progress message (or the end, if it fails before one)        | –       |
  | `task_finished`                                  | Each output, completed or errored (`error_kind`)                   | –       |
  | `files_downloaded`                               | Download click (`scope`: all/job/file)                             | `tasks` |
  | `drive_upload_started` / `drive_upload_finished` | Drive click, and once every file has settled (`upload_id`)         | `tasks` |
  | `newsletter_subscribe`                           | Brevo's `#success-message` turns active (`newsletter-tracker.tsx`) | –       |

- **Lifecycle.** `useJobTracking` owns the six conversion/job/task events.
  `CompressorApp` marks the starts as they happen: `conversionStarted`
  after the Start click, `jobStarted` before `compress()`, and
  `taskProgressed` on each progress message (the first one is the task's
  start time). The rest is derived from the jobs' state in an effect, with
  refs so each event fires once. Every `*_finished` has a matching
  `*_started` before it, and its `elapsed_ms` counts from that start. A
  job removed before it finishes never sends `job_finished`; its
  conversion counts it in `removed_count`.
- **Ids.**
  - `file_id` is created when a file is added (`PendingFile`), described
    once in `files_added`, and copied onto its `Job` (`fileId`,
    `conversionId`).
  - Task ids live in `Job.taskIds[config][format]`.
  - The chain is `file_id` → `job_id` (job events carry `file_id` and
    `conversion_id`) → `task_id` (task events, downloads, Drive), so events
    join by id (in BigQuery).
  - Only anonymous data is sent: format, media type, width, height, size,
    status, error kind, timings. **Never file names or raw error messages**
    (they can contain the file name). Error kinds come from the workers
    (`TaskErrorKind`, passed to `sendErrorMessage`).
- **GTM.** `analytics/gtm-container.json` is generated by
  `analytics/sync-gtm-container.mjs`, which reads `AnalyticsEventParams`.
  Keep each event a `{…}` and/or named types joined by `&`, because that is
  all the script parses. Per event, it creates:
  - one trigger (`TRI-<EVENT>-NEEDS_TRACKING`: custom event equals the
    name, plus the needs-tracking filter)
  - one GA4 tag (`TAG-GA4-<EVENT>`) mapping only that event's keys from
    their DLVs (`VAR-DL-<KEY>`)
  - for the array, an `items` row fed straight by its DLV
    (`items` = `{{VAR-DL-FILES}}`). The script fails if the entry type lacks
    `item_id` or `item_name`.

  Existing ids are kept. Variables nothing references are dropped from the
  JSON and listed.

- **GA4 custom definitions** (Admin → Custom definitions). Ids are not
  registered: they only make sense in BigQuery, and the items' ids already
  land in GA4's built-in Item ID.
  - Event-scoped dimensions: `locale`, `page_type`, `page_subtype`,
    `compressor_type`, `file_type`, `file_format`, `output_type`,
    `output_format`, `output_formats`, `status`, `error_kind`, `scope`,
    `resize`, `keep_audio`, `original_format`.
  - Event-scoped metrics: `file_count`, `job_count`, `task_count`,
    `failed_count`, `config_count`, `removed_count`, `completed_count`,
    `errored_count`, `total_size_bytes`, `input_size_bytes`,
    `output_size_bytes`, `output_width`, `output_height` (unit: standard),
    and `elapsed_ms` (unit: milliseconds).
  - Item-scoped dimensions (a standard property allows 10): `file_type`,
    `file_format`, `width`, `height`, `size_bytes`, `output_type`,
    `output_format`, `output_size_bytes`, `upload_status`.
- **Adding an event or parameter.**
  1. Add it to `AnalyticsEventParams` (and the entry types if it goes in an
     array).
  2. Fire it with `trackEvent`.
  3. Run `node analytics/sync-gtm-container.mjs && npx prettier --write
analytics/`, then import the JSON into GTM (merge, overwrite
     conflicting). An import never deletes, so also delete in GTM what the
     script lists as removed.
  4. Register the GA4 custom definition.

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
- The brand is written **SlingSite** everywhere in visible text. Lowercase
  `slingsite` only appears in URLs (`slingsite.github.io`, the GitHub repo).
  Post folder names are slugged lowercased first (`folderSlug` in
  `contentlayer.config.ts`), because url-slug would turn "SlingSite vs" into
  `sling-site-vs`.
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

**Tool pages (format, resize, thumbnail):** `getToolPages(tool, type)` in
`utils/tool-pages.ts` is the single source of truth (`toolPathnames` lists
which tool/type routes exist; thumbnail is video only). It returns:

- format: base, `to-<output>`, `<source>-to-<output>` (never a format to
  itself);
- resize: base, `<output>` (`/image/resize/png/`…);
- thumbnail: base, `<source>`, `to-<output>`, `<source>-to-<output>`.

Inputs come from `inputFormats` (also shown in the upload box); outputs from
`toolOutputFormats` and are named by `outputFormatSlugs` (`avc.mp4` → `mp4`,
`hevc.mp4` → `hevc`, `vp9.webm` → `webm`). Static params, the sitemap,
the language selector and `ToolPageLinks` (the links block under the base
pages only) all read from it. The route files only call
`components/tool-route.tsx` (`getToolStaticParams`, `getToolMetadata`,
`ToolRoute`). Every tool page **requires**
`content/page-content/<locale>/<type>-<tool>[-<slug>].mdx` in every locale
with frontmatter `title`/`description`/`heading`/`subheading` (metadata and
H1); the build throws if one is missing. Only the base format pages use
dictionaries (`format/*`) instead. So adding an input or output format
means writing those MDX files for all 7 locales. Child pages preselect their
output (`destination`); the resize base page uses "Original format", the
thumbnail base and `<source>` pages preselect JPG. Copy must match real
behavior: JPG output fills transparency with white, PNG output is lossless
and heavy, GIFs keep only the first frame, nothing is upscaled, thumbnails
are always the very first frame, and HEVC encoding/decoding depends on the
browser and hardware. Format and resize pages keep the audio by default (it
can be turned off), so the copy may say so, but it must not promise audio
is kept in every case (an unreadable audio codec makes the conversion fail
with a message).

**Add an output format:** extend `imageFormats`/`videoFormats` in
`utils/formats.ts` (and `webImageFormats` if the compress pages should
output it), `outputFormatSlugs` and the `formats` dictionary, then the
encoder maps in `utils/compressor/image.ts`
(`wasmEncoders`, `getMimeType`, `calculateSupportedEncoders`) or `video.ts`
(`outputFormats`, `outputCodecs`).

Progress: `jobProportionOfDoneTasks` counts finished tasks only (it gates
"download all" and the "in queue" state). The progress bar in `FileItem`
uses `jobProgress`, which also counts running tasks by their `percentage`.
Video outputs report it (mediabunny `onProgress`); images don't.

### Navigation

`nav-bar.tsx` groups pages into `NavGroup`s (Images: compressor, converter,
resizer; Videos: the same plus thumbnail). The logo links to the home page. On desktop each
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
  `contentlayer/generated` fail until it exists. If a build fails with a
  contentlayer `JsonParseError` ("Unterminated string in JSON"), its cache was
  left truncated by an interrupted run: `rm -rf .contentlayer .next`.
- In MDX, always write links as `[text](url)`. A bare URL is auto-linked
  (GFM) up to the next whitespace, so in Chinese it swallows the text after
  it, and `[url]` without `(url)` shows literal brackets.
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
- `public/.well-known/appspecific/com.chrome.devtools.json` (`{}`) is on
  purpose. Chrome DevTools requests it on localhost; without the file, the
  path falls into `[locale]/[slug1]/[slug2]`, and `next dev` with
  `output: 'export'` throws "missing param … in generateStaticParams()" on
  every request. Keep it empty: a `workspace` entry would publish a local
  path.

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
   "completed" (and counted as completed in `drive_upload_finished`). The
   auth callback also lacks a `return` after `reject`.
4. `app/[locale]/[slug1]/page.tsx` `generateMetadata` builds post hreflang
   URLs with `slugs: [translation.slugPath]` (an array inside an array). It
   should be `slugs: translation.slugPath`.
5. `components/language-selector.tsx` is a client component importing
   `@/content/lib`, which bundles every post (`allPosts`) into the client JS.
6. `@ffmpeg/*` is installed and copied by CopyPlugin, but nothing imports it
   (video uses mediabunny). It's dead weight.
7. Object URLs leak: the files grid in `CompressorApp` calls
   `URL.createObjectURL` on every render, and `Job.originalFileObjectURL` is never revoked.
8. The upload-status panel strings in `components/results.tsx` are hard-coded
   English.
9. `README.md` describes only the image flow (3 formats × 3 sizes).
10. `dictioraries/compression/image/metadata/ar.json`: the Arabic description
    has a fragment of the video description pasted into it.
11. `PageContent` slugs `image-format`/`video-format` (the base format
    pages) have no MDX article yet. Video outputs keep the internal format as
    extension (`clip-resized.avc.mp4`), on every page.
12. Older content has grammar slips in the how-to steps: Italian
    "i tuoi immagini … sceglierli" and Spanish "tus imágenes … elegirlos" in
    the `image-format-*` MDX files.
13. `llms.txt` "Video Compression" says videos are produced "in WEBM and
    AVIF formats" (it's MP4 H.264/H.265 and WebM).
14. GA4 documents `items` for ecommerce events. Our custom events send
    `files`/`tasks` as `items` too (visible in DebugView and BigQuery), but
    item-level reports in the GA4 UI may not use them for custom event
    names.
15. The Brevo form's scripts (inside `dangerouslySetInnerHTML`) only run on
    a full page load of `/subscribe/`, not after a client navigation.

## Next steps (planned)

Nothing scheduled.

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
- 2026-10-25: Resize pages (`/<type>/resize/`, one child per output format),
  video thumbnail pages (`/video/thumbnail/`, children per source, output
  and pair) and a home landing page (`/<locale>/`, `home` dictionary +
  `home.mdx`; `/` and the logo now lead there). PNG is a new output format
  everywhere but the compress pages (`webImageFormats`), which adds the
  `to-png`/`<source>-to-png` format pages. "Original format" option
  (`FormatConfig.originalFormat`). Format pages generalized into tool pages:
  `utils/tool-pages.ts`, `components/tool-route.tsx`,
  `ToolCompressorPage`, `ToolPageLinks`, `FormatSettings` `primary`
  layouts. Output file names are decided per job (`Job.outputFileNames`);
  tool pages drop "-compressed-". `extractFirstFrame` now propagates
  errors. Sitemap URLs always end in `/`. 280 new MDX files (40 pages × 7
  locales).
- 2026-10-25: Copy and UI fixes: the brand is "SlingSite" everywhere (was
  "Slingsite" in posts and `llms.txt`; post folder slugs unchanged thanks to
  `folderSlug`). Tool pages' results panel says "Converted files" /
  "Resized files" / "Thumbnails" (and matching progress labels), the
  thumbnail files box says "Videos", the format picker says "JPG", and the
  video upload box uses a film icon. `/image/` copy no longer calls JPG
  next-gen and lists every input format; `/video/` sample code gives HEVC
  `video/mp4; codecs="hvc1"` (listed first) and no longer says Safari can't
  play WebM.
- 2026-10-25: Legal posts: bare and bracketed URLs (`[https://…]` in every
  plain-language terms page, and a URL glued to Chinese text that turned the
  rest of the sentence into a broken link) are now explicit Markdown links.
- 2026-10-25: Analytics rework. GTM now loads from an inline `<head>` script
  that first sets the consent default (previously pushed as an array, which
  GTM ignores, and after the first page push) and `env`. `BaseDatalayer`
  pushes `page_context` (snake_case keys, typed `PageType`; `/subscribe/`
  subtype fixed to `subscribe`) on every load and navigation. New events
  (`utils/analytics.ts`, `hooks/use-job-tracking.ts`):
  - `files_added`, `conversion_started`, `task_finished`, `job_finished`
  - `files_downloaded`, `drive_upload_started`/`finished`
  - `newsletter_subscribe`

  All of them use ecommerce-style items and file/job/task ids (`PendingFile`,
  `Job.fileId`/`conversionId`/`taskIds`). Worker errors carry a
  `TaskErrorKind`. Encoder errors are caught per task, so the worker always
  reports `ready` again (was known issue #4). Removed `@next/third-parties`
  (its `[key: string]: any` on Window hid untyped globals; they are now
  declared in `global.d.ts`). GTM container export in
  `analytics/gtm-container.json`.

- 2026-10-26: GTM container: the catch-all app-event trigger and tag are
  split into one trigger and one GA4 tag per event, each tag mapping only
  its event's parameters (`files_added` reuses the old ids, so an
  overwriting import replaces them).
- 2026-10-26: Lifecycle pairs: `conversion_finished`, `job_started` and
  `task_started` join `conversion_started`, `job_finished` and
  `task_finished` (`useJobTracking` now owns all six). Every `elapsed_ms`
  now counts from the matching start, so a task's value is its own
  duration, no longer the time since its job started. `job_finished` reports
  `task_count` instead of `item_count`. New `removed_count` parameter. The
  GTM container is now generated by `analytics/sync-gtm-container.mjs`.
- 2026-10-26: Lean dataLayer. Events push exactly their own keys: no page
  context, no `ecommerce`, no reset of other events' keys. Missing values
  are pushed as `undefined`. Arrays are named for what they hold
  (`files`, `tasks`), are cleared right before their event, and appear
  only where the entity has no event of its own: conversion and job events
  are counts only, and task events are flat and complete (input format and
  size, `output_*` fields). Dropped `add_id`, `page_location` and
  `page_referrer`. Renamed `item_count` → `file_count`/`job_count`/
  `task_count`, `output_config_count` → `config_count`, and sizes →
  `input_size_bytes`/`output_size_bytes`. The sync script now resolves
  named types, sends arrays as GA4 `items` through `VAR-JS-<KEY>_AS_ITEMS`,
  and drops unreferenced variables.
- 2026-10-26: Array entries carry GA4's `item_id`/`item_name` from the
  code, so GTM sends `files`/`tasks` as `items` directly; the
  `VAR-JS-*_AS_ITEMS` mapping variables are gone.
- 2026-10-26: Added an empty
  `public/.well-known/appspecific/com.chrome.devtools.json`, so Chrome
  DevTools' request no longer makes `next dev` throw on the post route.
