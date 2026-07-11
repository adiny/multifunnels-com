# Multifunnels

Static website for Multifunnels.com — an AI product studio for agentic search, commerce, and automation.

## Architecture

Plain static HTML deployed on Netlify (`publish = "."`, no build step). Client-side i18n via
`data-i18n` attributes and shared dictionaries.

### Pages

| URL | File |
| --- | --- |
| `/` | `index.html` |
| `/work/` | `work/index.html` |
| `/work/agentroam/` | `work/agentroam/index.html` |
| `/work/moodtrip/` | `work/moodtrip/index.html` |
| `/work/adin-flights/` | `work/adin-flights/index.html` |
| `/work/hotel-search-agent/` | `work/hotel-search-agent/index.html` |
| `/work/flights-mcp/` | `work/flights-mcp/index.html` |
| `/hotel-search-agent` | `hotel-search-agent.html` (rewrite in `netlify.toml`) |
| `/integrations` | `integrations.html` (rewrite in `netlify.toml`) |

### Shared assets

- `assets/js/projects.js` — **single source of truth for project data** (names, URLs, MCP
  endpoints, tags, verified proof points, accent colors). Edit facts here first; the footer
  project links and related-project blocks render from it at runtime. Static cards and JSON-LD
  mirror it — keep them in sync when a fact changes.
- `assets/js/i18n.js` — all translations (en, es, he, ar, ja). Every user-facing string has a
  key; Hebrew and Arabic switch the whole document to RTL. MCP endpoints/code stay LTR via the
  `.ltr-code` class.
- `assets/js/main.js` — language switching, mobile menu, copy-endpoint buttons, reveal
  animations (respecting `prefers-reduced-motion`), Netlify form submit, and analytics events
  pushed to `window.dataLayer`: `hero_primary_cta`, `work_project_opened`,
  `external_product_visited`, `mcp_endpoint_copied`, `contact_form_started`,
  `contact_form_submitted`, `language_changed`.
- `assets/css/site.css` — the design system (midnight base, Fraunces display + Inter body,
  project accent colors, RTL-safe logical properties).

### Content rules

- Only verified figures: AgentRoam (110+ eSIM destinations, 130+ countries Global plan,
  USDC/USDT/BTC/ETH/SOL), HotelSearchAgent MCP (11 tools, 2M+ hotels, 195 countries, no API
  key). Do not invent metrics, testimonials, or logos.
- Transactional flows always state that orders require explicit user confirmation.
- `styles.css` and `script.js` in the root are orphaned drafts of an earlier redesign; nothing
  references them.

### Forms

The contact form uses Netlify Forms (`name="project-brief"`, honeypot `bot-field`), submitted
via fetch with an inline success message.
