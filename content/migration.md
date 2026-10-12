# Content preservation record

Captured from `https://www.cmicanada.org` on October 12, 2026 (Toronto time), using its four public XML sitemaps and each page's rendered server HTML.

| Source group | Routes | Preservation |
| --- | ---: | --- |
| Main pages | 18 | Home, updates, seven ministries, about/introduction/faith/branches, activities, giving, contact |
| Posts | 16 | Complete original report images, titles, author names, publication dates, categories |
| Blog and categories | 5 | Complete local news index and all four category routes |
| Archived event details | 2 | Original descriptions, times, locations, images, closed registration state |
| Original image assets | 83 | Downloaded at original resolution, alongside responsive WebP previews |

All 41 original paths are generated locally, including their Chinese slugs. `/` now introduces CMI Canada; `/blog/` contains the original updates and full post collection. `/home/` also serves the redesigned homepage. Added `/content-archive/` provides a complete content directory. Navigation points to local pages. International branch links still use their source destinations.

`site.json` retains the captured source text, original metadata, source URLs, ordered rich text, original image references, and the source footer text. Images that contain calendars, reports, or event information were preserved as images rather than replaced with a transcription. Downloaded originals are never modified; generated previews are separate files.

## Source details kept without silently correcting them

- The report at `/post/會長事工報告-2026年10月` is titled **會長事工報告 2026年9月** on the source. Both the existing URL and September title are preserved.
- The source footer gives **M1V 3X8**; its contact and donation pages give **M1W 3X8**. Each context retains its source value.
- The source footer says the organization was established in 2015; the Canada introduction gives formation in November 2012 and charity registration in January 2015. Both statements are retained in their original contexts.
- `/event-details/event-1` is a public source placeholder event. Its full content is retained in the event archive and excluded from the new sitemap with `noindex`.
- The October 11, 2026 sharing poster and BTCP workshop poster remain available. Event details are not invented or interpreted from unreadable images.

## Functional boundaries

The Wix contact form's backend is not part of this static repository. Its six fields (name, email, phone, address, subject, message) are retained, with an explicit **open email draft** action. No false submission confirmation is shown. The existing email and phone links remain available.

The source home page also contains an old Wix `StripShowcase` iframe. Its public rendered state was blank, with no readable gallery items. Its embedding URL is recorded below; any unpublished, account-only, or unrendered gallery content needs a Wix export to verify completeness beyond the public site.

`https://static.parastorage.com/services/santa/1.13152.0/node_modules/@wix/santa-galleries/target/StripShowcase/StripShowcase.html?compId=comp-kzrlj6f5&deviceType=desktop&locale=en&viewMode=site`

Wix runtime controls (share menus, author dropdowns, search chrome, and Wix branding) were replaced by local accessible equivalents where applicable. The original source text remains in `site.json`; all substantive imported content is presented in the redesigned pages.

## Publication

The owner selected `https://cmicanada.github.io/` for publication on October 12, 2026. Canonical URLs, social-image URLs, robots, and sitemap use that origin. The original `cmicanada.org` remains on Wix.

## Verification

`npm run check` verifies all source routes, all original assets, full post image coverage, imported ministry/about text, local link and anchor targets, one main heading per page, post metadata, and search coverage. Browser verification covers desktop (1440px) and mobile (390px), no horizontal overflow on representative pages, mobile navigation, news filtering and empty state, prayer-category navigation, site search, original-report zoom, copy donation email, and the contact fields.

Git history is retained. The removed template is recoverable from Git; a temporary pre-edit backup was also created at `/tmp/cmi-original-template.tar.gz` for this working session.
