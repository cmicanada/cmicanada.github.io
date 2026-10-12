# CMI Canada repository instructions

This repository preserves the public content of `cmicanada.org` and publishes the redesigned static site at `https://cmicanada.github.io/`. Work from the current checkout root; do not depend on a particular user's home directory.

## Content skills

Before adding or editing content, read the appropriate committed skill:

| Request | Skill |
| --- | --- |
| News, announcements, prayer calendars, ministry updates | [.agents/skills/cmi-add-news/SKILL.md](.agents/skills/cmi-add-news/SKILL.md) |
| Full articles, testimonies, reflections, ministry reports | [.agents/skills/cmi-add-article/SKILL.md](.agents/skills/cmi-add-article/SKILL.md) |
| Events, workshops, posters, registration, cancellations, archives | [.agents/skills/cmi-add-event/SKILL.md](.agents/skills/cmi-add-event/SKILL.md) |

These repository copies are authoritative for this project, including when a personal installation with the same name exists. Keep workflow changes here so they travel with the repository. Read only the skills relevant to the request.

## Locale contract

Every new or edited visitor-facing item must be available in all three locales:

| Language | URL prefix | HTML `lang` | Header label |
| --- | --- | --- | --- |
| Traditional Chinese (default) | `/` | `zh-Hant-CA` | 繁體 |
| Simplified Chinese | `/zh-hans/` | `zh-Hans-CA` | 简体 |
| English | `/en/` | `en-CA` | EN |

- Author editable Chinese copy in Traditional Chinese and add complete English translations to `content/locales/en.json`. Dictionary keys use the normalization in `scripts/locales.mjs`; Simplified Chinese is generated with OpenCC. Review names and ministry terminology after conversion. Preserve verified proper names when no official English name is supplied.
- Translate the full editable body, title, category, captions, image descriptions, accessibility labels, page descriptions, form feedback and new interface messages. Keep missing English translations as build errors. Original report/poster images retain their source language; preserve the English notice and provide readable translated key information for new image-only material.
- Use `localizedPath()` and the shared localization pipeline. Keep stable route slugs, correctly localized internal links/search results, canonical URLs, all three `hreflang` alternates and Traditional Chinese `x-default`. Each page's document language and runtime/search configuration must match its locale.
- Keep 繁體 / 简体 / EN in the green top bar, highlight the selected language, and retain the same page, query and section when switching. Do not recreate a separate language row below the navigation.

## Source and design

- Read `README.md` and the relevant current templates and source records before editing. Change `content/site.json`, translation sources and templates, then rebuild. Root HTML, `zh-hans/`, `en/`, search indexes and sitemap are committed generated outputs; do not edit them independently.
- Preserve existing routes, full source text, attribution, original report/poster files and historical capture metadata. Use supplied sources for facts; do not invent dates, speakers, registration status or provenance. The original capture contains 41 routes and 16 posts; additional authored items must not be described as part of that historical Wix capture.
- Maintain readable layouts for older church/ministry audiences: 20px body copy, 18px navigation/controls, generous spacing and at least 44px language targets. Keep the approved refined logo in `assets/brand/` and the preserved original artwork. `scripts/prepare-brand.py` also writes unused SVG proposals; those are not replacements for the approved logo.
- Keep the dedicated sharing card in `assets/brand/` and the localized Open Graph/Twitter metadata together. When replacing the card, use a new versioned image URL, retain prior artwork, and verify the published image bytes and metadata; existing chat previews may be cached.
- Use `assets/media.css` for image presentation and `content/image-layout.json` for source-specific `focalPoint` percentages, `kind` and `fit` overrides. Crop photos around people/subjects; show documents, posters, collages and illustrations completely. Keep gallery originals, reading labels outside the image, natural colors and reduced-motion support. New content may require responsive image derivatives or additional Chinese font glyphs. Follow the relevant skill's media/font workflow.

## Validation and delivery

- Use Node.js 20 or later. Run `npm ci` if dependencies are missing or the lockfile changes, then `npm run build`, `npm run check` and `git diff --check`. When adding records, replace stale fixed-count assertions with accurate totals and preservation checks; retain locale, link, search and media validation.
- For content or UI changes, check affected pages, listings and language switches on desktop and phone in all three locales. Documentation-only changes need skill validation and link/source review, without a new browser test suite.
- For an authorized publication request, complete commit, push, PR creation/attachment, required checks and merge using current repository settings. Use the `codex/` prefix for new branches. Do not treat skill installation as standing publication permission; honor authorization already given in the task.
- GitHub Pages currently publishes `master` at the repository root. Confirm current settings and that Pages built the merged commit, then verify the affected public routes/assets before reporting publication. Keep `content/deployment.json` aligned with the destination. Wix DNS/domain changes require their own requested scope.
