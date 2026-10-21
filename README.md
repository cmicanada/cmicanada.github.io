# CMI Canada — 加拿大國際關懷協會

A complete static redesign of [cmicanada.org](https://www.cmicanada.org), replacing the obsolete Hydra/Jekyll sales template. Chinese-first editorial layouts, warm ivory and forest green, original ministry photography, accessible navigation, responsive galleries, and full-size report reading.

## 提交新內容

在[GitHub 新增 Issue](https://github.com/cmicanada/cmicanada.github.io/issues/new/choose) 選擇「最新消息／代禱更新」、「文章／見證／事工報告」或「活動／工作坊／分享會」，填入繁體原稿與附件，再把 Issue 編號交給 Codex。三個倉庫技能會處理繁體、簡體與英文版本；Issue 提交本身不會自動發布。完整流程見 [內容 Issue 使用說明](docs/content-issues.md)。

## Run and edit

Requires Node.js 20 or later. OpenCC and parse5 are pinned build dependencies; the published site uses no framework or runtime translation service.

```sh
npm ci
npm run build
npm run check
npm run dev
```

Preview: http://localhost:4173. The development server binds to the local computer only. Stop with Ctrl+C.

- `content/site.json` is the editable source: 41 captured public routes, 16 posts, original text, ordered rich-text blocks, image references, source URLs, and capture notes.
- `content/deployment.json` sets the publishing origin for canonical URLs, social images, and the sitemap.
- `content/locales/en.json` contains reviewed English translations keyed by Traditional Chinese source text. `scripts/locales.mjs` converts Chinese scripts, translates page text and interface messages, and fails the build for missing English translations.
- `scripts/build.mjs` generates 126 HTML pages: Traditional Chinese at the root (the default), Simplified Chinese under `/zh-hans/`, and English under `/en/`, plus localized 404 pages and search indexes. All existing source routes remain available.
- `assets/style.css`, `assets/typography.css`, `assets/media.css`, and `assets/app.js` contain the design, typography, image presentation, and browser interactions. `content/image-layout.json` defines per-image subject positions and full-frame exceptions for artwork or collages.
- The header and footer use `assets/brand/cmi-logo-refined-v2.png`, a 2172×724 transparent redraw with a larger bilingual wordmark vertically centered beside the emblem, closely based on the original globe, handshake, cross, CMI initials, maple leaf and bilingual wordmark. Forest green and warm copper match the site theme. The browser icon uses the matching 1254×1254 `cmi-emblem-refined-v1.png`. The original Wix artwork remains preserved in `assets/images/df5eec_70c326b8c0f7445cbf4b20e06db868ac~mv2.jpeg`. Generation prompts and provenance are recorded in `assets/brand/refined-logo-provenance.json`; the earlier SVG proposals remain unused references.
- Link previews use the dedicated high-resolution `assets/brand/cmi-social-preview-v3.png` and matching Simplified Chinese/English versions selected by `content/social-preview.json`, with the mission headline, familiar logo, and site palette. The direction words contrast: 進 / 进 / into stay forest green, while 出 / out use copper. Open Graph and Twitter metadata include the image dimensions/type, localized titles/descriptions/alt text, and each page’s canonical URL. The former sunset artwork stays preserved. Chat services may cache earlier previews.
- `assets/fonts/` bundles Manrope for Latin text, Noto Sans TC for Chinese, and a Noto Sans SC companion subset for additional Simplified Chinese characters, with their SIL Open Font Licenses and pinned source checksums. Fonts load locally without a third-party font service. Font, CSS and JavaScript URLs include content hashes to refresh cached assets after updates.
- `assets/images/` contains all 83 original images and responsive WebP copies. Original report images remain available without resizing.
- `scripts/validate.mjs` checks all three languages for route coverage, same-page language switching, navigation, canonical and alternate-language metadata, search coverage, original images, imported rich text, headings, local links, and anchors.
- `content/migration.md` records preservation coverage and source discrepancies.

After changing content or templates, run `npm run build` and `npm run check`. CSS and JavaScript edits need a browser reload. To regenerate responsive images, install Pillow in a separate Python environment and run `python scripts/optimize-images.py`.

After introducing new Chinese characters, regenerate the font subset with `python scripts/prepare-brand.py` in a separate Python environment containing `fonttools[woff]`. The script downloads checksum-verified font sources to the ignored `.preview/font-sources/` directory, retains variable weights, and regenerates the unused earlier SVG proposal. Existing site copy is fully covered; system fonts support new visitor-entered characters. The active logo uses the faithful transparent redraw based on the preserved Wix artwork.

## Codex content workflows

Repository instructions live in [AGENTS.md](AGENTS.md). The three committed skills in `.agents/skills/` travel with this checkout and are the authoritative versions for this project:

- [$cmi-add-news](.agents/skills/cmi-add-news/SKILL.md): news, announcements, prayer calendars and ministry updates.
- [$cmi-add-article](.agents/skills/cmi-add-article/SKILL.md): full articles, testimonies and ministry reports.
- [$cmi-add-event](.agents/skills/cmi-add-event/SKILL.md): event details, posters, registration, cancellations and archives.

Each skill covers Traditional Chinese (default), generated Simplified Chinese, full English translations, locale-aware links/search/metadata, media preservation, validation and authorized publication. Edit these repository copies when the workflow changes. No user-specific path or personal skill installation is required. Codex can discover the repository skills automatically; `AGENTS.md` also points to the relevant file for each content task.

## Visitor experience

- Visible 繁體 / 简体 / EN controls in the green top bar retain the current page, query and section when switching. Navigation, editable body text, article titles, dates, image descriptions, search, and form feedback follow the selected language. Internal links stay in that language; the root URL always defaults to Traditional Chinese. English pages retain Chinese personal names where verified English names are unavailable. Original report and poster images remain in their source language, with an English notice and full-size viewing.
- Email addresses in generated HTML, mail links, donation copy controls, and contact-draft recipients are encoded and revealed by `assets/email.js` only when visitors select the localized “Show email address” control. Revealed addresses retain normal mail links; donation copying and draft creation remain available. Search indexes use readable `[at]` / `[dot]` fallback notation. Without JavaScript, addresses remain manually readable and links lead to the localized contact section. This deters basic HTML scraping; it is not encryption and does not conceal public Git/source archives or addresses in original posters.
- Reading defaults designed for older church and ministry audiences: 20px main copy, 18px navigation and controls, 16px dates/contact details, generous line spacing, stronger text contrast, and single-column mobile articles. Sizes use `rem` to respect browser font preferences. On phones, the header uses two rows with visible search and menu labels and larger touch targets.
- A mission-led homepage at `/` and `/home/`; all original updates are available at `/blog/`.
- Seven ministry pages, the organization and Canada introductions, statement of faith, and international branches.
- Image treatment follows its purpose: subject-aware 4:3 photo crops, complete report/calendar/poster thumbnails, and uncropped artwork and reading galleries. Natural colors, restrained rounded frames, and light desktop hover effects match the theme; reduced-motion preferences disable image movement. Captions and full-size reading labels sit outside reading images. Originals remain untouched.
- All 16 captured posts and new authored posts with their original titles, authors, publication dates, and complete report images. Click an image to read the original or print an article.
- Four news categories, article filtering, and site-wide search.
- Both activity posters and two archived event pages. The source placeholder event is retained but marked `noindex`.
- All three donation methods and the original donation/contact details.
- Contact fields create a draft in the visitor's email application. Visitors must confirm and send it themselves; this is not an online submission service.

## Hosting

Publishing destination: [cmicanada.github.io](https://cmicanada.github.io/). GitHub Pages publishes the `master` branch at the repository root. `.nojekyll` serves the generated HTML directly. Build and validate locally before merging a change into `master`; the merge triggers the existing Pages deployment.

On October 12, 2026, the owner selected `cmicanada.github.io` as the publishing destination. The live `cmicanada.org` remains on Wix. No custom domain is configured for this repository. A future domain cutover should update `content/deployment.json`, rebuild the site, and coordinate the GitHub Pages custom-domain setting with Wix DNS.

Public CMI text and media retain their source ownership. The original template license is retained in `LICENSE` for the repository's historical attribution.
