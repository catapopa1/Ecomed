# _legacy · snapshot of the old WordPress site (scraped 24 Nov 2026)

Reference only. Nothing here is shipped. Source: https://medicinadefamilieoradea.ro (WordPress + Elementor, WAcademy.ro theme).
Nothing was blocked: every URL in `wp-sitemap.xml` returned 200 to a plain HTTP fetch, so no export from cPanel is needed for the texts.

| File | What |
|---|---|
| `pages.json` | Per URL: status, title (+ length), meta description, canonical, robots, OG tags, all headings, images, internal/external links |
| `text/*.md` | Readable text of each page (menus and footer included, scripts stripped) |
| `html/*.html` | Raw HTML as served |
| `images/` | The 7 content images at full size (all stock photos / generic graphics, not the clinic's own) |
| `images.txt` | Every image URL the pages reference |

## URL inventory (all 10 public URLs)
| Old URL | Title (length) | Notes |
|---|---|---|
| `/` | Dr Alina Teusdea Medicina de familie oradea – Împreună vom găsi… (191) | H1 "Dr Alina Teusdea Medicina de familie Oradea". Family-medicine intro, Neurofeedback + Laser HPL blurbs with claims to remove |
| `/despre-noi/` | Despre noi – … (56) | "Povestea Noastră" 2017 |
| `/servicii-medicale/` | Servicii medicale – … (63) | One long accordion: CNAS packages (neasigurați / asigurați), urgențe, profilactice, services free for own patients |
| `/inscrieri/` | Inscrieri – … (55) | Steps + documents + form. **The "Cererea de înscriere/transfer – se poate descărca aici" link points nowhere** (no file on the server) |
| `/blog/` | Blog – … (50) | Only the theme demo post |
| `/hello-world/` | Lorem ipsum dolor – … (63) | Theme demo post → 301 to /blog/ |
| `/contact/` | Contact – … (53) | Address, phone, email, hours, Maps embed (`maps.google.com/maps?q=Oradea, Strada Nicolae Jiga Nr 9 Ap 3`) |
| `/politica-de-confidentialitate/` | Politica de confidențialitate – … (75) | Outdated (Legea 677/2001, other clinics' domains) |
| `/category/uncategorized/` | Uncategorized – … (59) | WP archive → 301 to /blog/ |
| `/author/admin/` | admin – … (51) | WP archive → 301 to /blog/ |

Plus WordPress system URLs that should not 404 either: `/wp-sitemap.xml`, `/sitemap.xml`, `/feed/`, `/comments/feed/` (301 table in `SEO.md`).

## SEO state found
- **No meta description on any page.** No JSON-LD. Canonicals present on pages, missing on archives.
- Titles: brand "Dr Alina Teusdea Medicina de familie oradea" (lower-case "oradea") appended to every title; home title 191 chars.
- One external link: the CAS package PDF on ilda.ro (`/servicii-medicale/`).
- Only 7 images, all stock.
