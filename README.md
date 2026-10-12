# CMI Canada — 加拿大國際關懷協會

A complete static redesign of [cmicanada.org](https://www.cmicanada.org), replacing the obsolete Hydra/Jekyll sales template. Chinese-first editorial layouts, warm ivory and forest green, original ministry photography, accessible navigation, responsive galleries, and full-size report reading.

## Run and edit

Requires Node.js 20 or later; no npm dependencies or framework installation.

```sh
npm run build
npm run check
npm run dev
```

Preview: http://localhost:4173. The development server binds to the local computer only. Stop with Ctrl+C.

- `content/site.json` is the editable source: 41 captured public routes, 16 posts, original text, ordered rich-text blocks, image references, source URLs, and capture notes.
- `content/deployment.json` sets the publishing origin for canonical URLs, social images, and the sitemap.
- `scripts/build.mjs` generates all HTML pages at the repository root.
- `assets/style.css`, `assets/typography.css`, and `assets/app.js` contain the design, typography, and browser interactions.
- The header, footer, and browser icon use the original CMI Canada logo in `assets/images/df5eec_70c326b8c0f7445cbf4b20e06db868ac~mv2.jpeg`, with its original artwork and proportions. `assets/brand/` retains the earlier redesign proposal for reference; it is not used by the published site.
- `assets/fonts/` bundles Manrope for Latin text, Noto Sans TC for Chinese, and a small Noto Sans SC companion subset for nine additional source characters, with their SIL Open Font Licenses and pinned source checksums. Fonts load locally without a third-party font service.
- `assets/images/` contains all 83 original images and responsive WebP copies. Original report images remain available without resizing.
- `scripts/validate.mjs` checks route coverage, original images, imported rich text, headings, local links, anchors, metadata, and search coverage.
- `content/migration.md` records preservation coverage and source discrepancies.

After changing content or templates, run `npm run build` and `npm run check`. CSS and JavaScript edits need a browser reload. To regenerate responsive images, install Pillow in a separate Python environment and run `python scripts/optimize-images.py`.

After introducing new Chinese characters, regenerate the font subset with `python scripts/prepare-brand.py` in a separate Python environment containing `fonttools[woff]`. The script downloads checksum-verified font sources to the ignored `.preview/font-sources/` directory, retains variable weights, and regenerates the unused earlier SVG proposal. Existing site copy is fully covered; system fonts support new visitor-entered characters. The active logo uses the original imported Wix artwork.

## Visitor experience

- Reading defaults designed for older church and ministry audiences: 20px main copy, 18px navigation and controls, 16px dates/contact details, generous line spacing, stronger text contrast, and single-column mobile articles. Sizes use `rem` to respect browser font preferences. On phones, the header uses two rows with visible search and menu labels and larger touch targets.
- A mission-led homepage at `/` and `/home/`; all original updates are available at `/blog/`.
- Seven ministry pages, the organization and Canada introductions, statement of faith, and international branches.
- All 16 posts with their original titles, authors, publication dates, and complete report images. Click an image to read the original or print an article.
- Four news categories, article filtering, and site-wide search.
- Both activity posters and two archived event pages. The source placeholder event is retained but marked `noindex`.
- All three donation methods and the original donation/contact details.
- Contact fields create a draft in the visitor's email application. Visitors must confirm and send it themselves; this is not an online submission service.

## Hosting

Publishing destination: [cmicanada.github.io](https://cmicanada.github.io/). GitHub Pages publishes the `master` branch at the repository root. `.nojekyll` serves the generated HTML directly. Build and validate locally before merging a change into `master`; the merge triggers the existing Pages deployment.

On October 12, 2026, the owner selected `cmicanada.github.io` as the publishing destination. The live `cmicanada.org` remains on Wix. No custom domain is configured for this repository. A future domain cutover should update `content/deployment.json`, rebuild the site, and coordinate the GitHub Pages custom-domain setting with Wix DNS.

Public CMI text and media retain their source ownership. The original template license is retained in `LICENSE` for the repository's historical attribution.
