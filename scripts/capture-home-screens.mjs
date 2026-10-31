// Captures the real app for the home page (public/screens/<locale>/) and the
// OpenGraph screenshots (public/screenshots/), from a served build:
//
//   npm run build && npx serve out -l 8770
//   PLAYWRIGHT=/path/to/node_modules/playwright/index.mjs \
//     node scripts/capture-home-screens.mjs http://localhost:8770
//
// Playwright is not a project dependency: point PLAYWRIGHT at any install
// (CHROME at a Chromium binary if its own browsers are not downloaded).
// Rerun it whenever the results card or the image page's first screen
// changes. It writes the pixel sizes to src/utils/home-screens.json.
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const base = process.argv[2] ?? 'http://localhost:8770';
const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const locales = ['en', 'es', 'ar', 'de', 'fr', 'it', 'zh'];
const themes = ['light', 'dark'];

const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
});

async function open(path, { viewport, scheme, scale = 2 }) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    colorScheme: scheme,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  // Only the site itself: no analytics, no third parties in the shots.
  await page.route(
    (url) => !url.href.startsWith(base),
    (route) => route.abort(),
  );
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '#cc-main { display: none !important }' });
  return page;
}

const toWebp = (png) => sharp(png).webp({ quality: 80 }).toBuffer();

const sizes = {};
for (const locale of locales) {
  await mkdir(`public/screens/${locale}`, { recursive: true });
  sizes[locale] = {};
  for (const scheme of themes) {
    // The first sample photo's results, once every output is done.
    const page = await open(`/${locale}/image/`, {
      viewport: { width: 1440, height: 900 },
      scheme,
    });
    await page.locator('button[aria-busy]').click();
    await page.locator('#settings-title').waitFor();
    // Start (the button with the play icon)
    await page
      .locator(
        'section[aria-labelledby="settings-title"] button:has(.lucide-play)',
      )
      .click();
    const job = page.locator('article').first();
    await job.waitFor();
    await page.waitForFunction(
      () => {
        const article = document.querySelector('article');
        return (
          article &&
          !article.querySelector('.animate-spin') &&
          article.querySelectorAll('td button').length === 9
        );
      },
      null,
      { timeout: 180000 },
    );
    const results = await job.screenshot({ animations: 'disabled' });
    await writeFile(
      `public/screens/${locale}/results-${scheme}.webp`,
      await toWebp(results),
    );
    const { width, height } = await sharp(results).metadata();
    sizes[locale].results = [width, height];
    await page.context().close();

    // The image page's first screen on a phone.
    const phone = await open(`/${locale}/image/`, {
      viewport: { width: 390, height: 720 },
      scheme,
    });
    const shot = await phone.screenshot({ animations: 'disabled' });
    await writeFile(
      `public/screens/${locale}/phone-${scheme}.webp`,
      await toWebp(shot),
    );
    sizes[locale].phone = [780, 1440];
    await phone.context().close();
    console.log(locale, scheme, sizes[locale]);
  }
}
// Pairs on one line, as Prettier formats them.
await writeFile(
  'src/utils/home-screens.json',
  JSON.stringify(sizes, null, 2).replace(
    /\[\s+(\d+),\s+(\d+)\s+\]/g,
    '[$1, $2]',
  ) + '\n',
);

// OpenGraph images (910 x 465, as the metadata declares): the first screen.
for (const type of ['image', 'video']) {
  const page = await open(`/en/${type}/`, {
    viewport: { width: 1440, height: 736 },
    scheme: 'light',
    scale: 1,
  });
  const shot = await page.screenshot();
  await sharp(shot)
    .resize(910, 465)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`public/screenshots/${type}.jpg`);
  await page.context().close();
}

await browser.close();
