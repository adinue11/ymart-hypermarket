# Implementation notes

## Completed in this package

- About Gallery now receives `interactive={false}` and no longer reacts to clicks or follows stored gallery links. The visual gallery remains in place.
- Added a descriptive homepage title, description, robots directives, canonical, Open Graph/Twitter metadata, and a conservative Organization JSON-LD block based on business details already present in the project.
- Added `public/robots.txt` and `public/sitemap.xml` for the homepage and the four known outlet routes.
- Added client-side title, description, canonical, and basic Open Graph URL/title/description updates for store and career routes.
- Added `SEO_NEXT_STEPS.md` with a prioritized, post-deployment SEO checklist.

## Not completed yet

The 3D offer-to-cart animation has not been implemented in this package. The existing weekly offer data model provides poster-level records (`weekly_offer_posters`) but does not provide product hotspots, product IDs, current outlet-specific product prices/stock, or a cart shared between the homepage offer modal and store pages. Implementing a real cart update without those contracts would risk inventing prices/products or updating the wrong outlet's cart. The next implementation step is to confirm the product catalog/inventory schema and define an admin hotspot mapping for each poster, then connect the animation to a shared cart state.

## Validation

A build was attempted, but dependency installation did not complete in this environment. The available local `node_modules` directory lacked TypeScript type definitions (including React, Node, Leaflet and Three), so `npm run build` could not validate the changes. Reinstall dependencies locally with `npm ci`, then run `npm run build` before deploying.
