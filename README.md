# WorkExpo-1

A portfolio of reusable, framework-free front-end modules built for client web projects. Each file was designed to be dropped into a static HTML site with no build step and no external dependencies.

## TrapData 1

These modules originated from two client engagements: a locksmith company site and the Oasis site (which also uses the Poseidon concierge chat widget). The same underlying code is shared across related builds (Farms, Axiom, Sage, Chris Lyon) with project-specific configuration layered on top.

**spa-router.js** - Built a lightweight, dependency-free single-page navigation system using hash-based routing. Handles active-state styling on nav links, scroll-to-top on route change (respecting reduced-motion preferences), dynamic page titles, and works as both an ES module and a plain script include.

**lead-capture.js** - Designed a three-step lead capture flow (contact info, service details, review and submit) to replace generic contact forms with something that qualifies leads before they reach the inbox. Includes client-side validation, a configurable service list, and dual submission support for Netlify Forms or Formspree.

**concierge.js** - Built a rules-based chat widget that answers common visitor questions (pricing, hours, location, booking, contact info) using ordered pattern matching, with no API key and no network calls required. This is the same engine powering the Poseidon, Sage, and Chris Lyon assistants across different client sites, each themed with its own name, avatar, and accent color.

**site.config.js** - Created a single source of truth for business details, brand tokens, services, and SEO metadata so that a phone number, price, or color only needs to change in one place. Also includes a JSON-LD LocalBusiness schema generator and a travel-fee calculator ported from the locksmith project's pricing logic.

## Root files

**netlify.toml** - Configured Netlify build and deployment settings, including SPA fallback redirects (so deep links do not 404), security headers (X-Frame-Options, Content-Type-Options, Referrer-Policy, Permissions-Policy), and cache-control rules for static assets vs. HTML.
