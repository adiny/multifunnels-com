/**
 * Central project data — the single source of truth for every Multifunnels project.
 *
 * Used by: footer project links, related-projects blocks, MCP endpoint copy buttons,
 * analytics labels, and as the canonical reference when editing project facts.
 * Static HTML cards and JSON-LD mirror this data; when a fact changes, update it
 * here first, then sync the matching static markup (see README.md).
 *
 * All figures below are verified against the live products. Do not add metrics
 * that cannot be verified from a live source or backend.
 */
window.MF_PROJECTS = [
  {
    slug: "agentroam",
    name: "AgentRoam.ai",
    type: "product",
    categoryKey: "agentroamCategory", // "AI-ready travel connectivity"
    status: "live",
    url: "https://agentroam.ai/",
    caseStudyUrl: "/work/agentroam/",
    mcpEndpoint: "https://agentroam.ai/api/mcp",
    tags: ["eSIM", "Crypto checkout", "MCP", "Travel commerce", "AI agents"],
    proof: "110+ eSIM destinations · USDC, USDT, BTC, ETH, SOL",
    accent: "#22d3ee",
    featured: true,
    order: 1
  },
  {
    slug: "moodtrip",
    name: "MoodTrip.AI",
    type: "product",
    categoryKey: "moodtripCategory", // "AI hotel discovery"
    status: "live",
    url: "https://moodtrip.ai/",
    caseStudyUrl: "/work/moodtrip/",
    tags: ["Hotels", "AI search", "Semantic discovery", "Travel", "Booking handoff"],
    proof: "2M+ hotels · 195 countries",
    accent: "#ff7a59",
    featured: true,
    order: 2
  },
  {
    slug: "adin-flights",
    name: "Adin Flights",
    type: "product",
    categoryKey: "flightsCategory", // "AI flight search"
    status: "live",
    url: "https://flights.moodtrip.ai/",
    caseStudyUrl: "/work/adin-flights/",
    tags: ["Flights", "Search", "Route discovery", "Travel"],
    proof: "Part of the MoodTrip travel ecosystem",
    accent: "#e4b95b",
    featured: false,
    order: 3
  },
  {
    slug: "hotel-search-agent",
    name: "HotelSearchAgent MCP",
    type: "infrastructure",
    categoryKey: "hsaCategory", // "MCP hotel-search infrastructure"
    status: "live",
    url: "/hotel-search-agent",
    caseStudyUrl: "/work/hotel-search-agent/",
    mcpEndpoint: "https://api.moodtrip.ai/api/mcp-http",
    tags: ["MCP", "Hotels", "Live inventory", "Booking handoff"],
    proof: "11 MCP tools · 2M+ hotels · 195 countries · no API key",
    accent: "#2dd4bf",
    featured: false,
    order: 4
  },
  {
    slug: "flights-mcp",
    name: "Flights MCP HTTP",
    type: "infrastructure",
    categoryKey: "fmcpCategory", // "MCP flight-search infrastructure"
    status: "live",
    url: "https://api.moodtrip.ai/api/flights/mcp-http",
    caseStudyUrl: "/work/flights-mcp/",
    mcpEndpoint: "https://api.moodtrip.ai/api/flights/mcp-http",
    tags: ["MCP", "Flights", "Structured search"],
    proof: "Live flight-search tools over MCP HTTP",
    accent: "#8b5cf6",
    featured: false,
    order: 5
  }
];
