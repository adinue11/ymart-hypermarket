# YMART SEO: prioritized follow-up checklist

The code changes in this package are a technical baseline, not a guarantee of rankings. Complete these steps after deployment.

## P0 — Immediately after deployment

- [ ] Confirm `https://ymart.co.in/`, `/robots.txt`, and `/sitemap.xml` return HTTP 200 over HTTPS.
- [ ] In Google Search Console, verify the Domain property `ymart.co.in` with DNS, then submit `https://ymart.co.in/sitemap.xml`.
- [ ] Use URL Inspection on the homepage and each `/store/<outlet>` page; test live URL, rendered HTML, canonical, and indexing eligibility.
- [ ] Ensure the host serves the SPA entry point for valid deep links such as `/store/naimarmoola` and `/careers` (Cloudflare Pages `_redirects` or equivalent host rewrite).
- [ ] Verify canonical host consistency (`https://ymart.co.in/` versus `www`, HTTP, and trailing-slash variants) with permanent redirects at the hosting/DNS layer.
- [ ] Run Google Rich Results Test and Schema Markup Validator on the deployed homepage; remove any structured-data field that cannot be verified against current business information.
- [ ] Test mobile usability and Core Web Vitals with PageSpeed Insights for mobile and desktop.

## P1 — Local SEO

- [ ] Claim/verify the official Google Business Profile for each eligible physical outlet; use the real outlet name, address, phone, categories, opening hours, photos, and URL.
- [ ] Keep NAP (name, address, phone) consistent across the website, Business Profiles, and trusted local directories.
- [ ] Create a useful, crawlable page for each real outlet with unique copy, exact address, contact details, actual opening hours, directions/map, services, and links to that outlet's active offers.
- [ ] Ask customers for honest reviews through Google's approved process; never buy reviews or gate review requests.
- [ ] Add verified store-specific `GroceryStore`/`LocalBusiness` structured data only when the exact outlet details are confirmed and visible on that page.

## P1 — Indexable content and architecture

- [ ] Ensure each public page has a unique title, meta description, one clear H1, descriptive headings, internal links, and useful visible text.
- [ ] Add dedicated crawlable pages for major categories and real product/offer details when those pages provide useful, current content. Do not create thousands of thin or duplicate URLs.
- [ ] Keep expired offers out of active-offer pages; remove them from the sitemap or redirect/return an appropriate status when pages are retired.
- [ ] Ensure important content is available without requiring a click, login, or client-only interaction. Google should be able to render the key text and links.
- [ ] Add descriptive alt text to meaningful product/outlet images; use empty alt text for purely decorative images.
- [ ] Add social profile links only for official accounts and keep Open Graph image URLs publicly accessible.

## P1 — Performance and accessibility

- [ ] Measure LCP, INP, and CLS on real mobile devices; optimize the actual bottleneck instead of relying on a Lighthouse score alone.
- [ ] Compress product and hero images to AVIF/WebP where supported, provide responsive sizes, reserve image dimensions, and lazy-load below-the-fold imagery.
- [ ] Avoid autoplay-heavy effects on low-power devices; verify `prefers-reduced-motion`, keyboard focus, semantic buttons/links, contrast, and touch targets.
- [ ] Test slow 4G, mid-range Android, iOS Safari, Chrome, Firefox, and Edge; verify cart, route deep links, maps, and Supabase error states.

## P2 — Measurement and ongoing work

- [ ] Set up privacy-appropriate analytics and conversion events for outlet selection, offer opens, product/cart actions, and WhatsApp enquiries.
- [ ] Review Search Console weekly for indexing exclusions, duplicate canonical URLs, sitemap errors, search queries, clicks, impressions, and CTR.
- [ ] Use Bing Webmaster Tools and submit the sitemap there as well.
- [ ] Publish genuinely useful local content (seasonal shopping guides, outlet updates, verified offers) and earn relevant local links/mentions.
- [ ] Recheck titles, descriptions, broken links, structured data, and Core Web Vitals after major releases.

## Important limitations

- Search ranking and indexing cannot be guaranteed by code changes alone.
- The current React SPA has a single static HTML entry point. Client-side metadata updates improve browser metadata, but for strongest social previews and consistent crawling of every route, consider prerendering/SSR for public routes or a static HTML snapshot strategy.
- The current offer poster table contains poster-level records only. Product-level hotspots, discount values, and a homepage cart integration require a confirmed product-to-outlet data model and shared cart contract before a real add-to-cart animation can safely update stock/price-aware cart state.
