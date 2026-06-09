// DreamOS - Cloudflare Worker
// Handles Turnstile verification and old URL redirects

const TURNSTILE_SECRET = "";
const ALLOWED_ORIGINS = [
  "https://dream-os.pages.dev",
  "https://dreamos.pages.dev",
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Redirect old dream-board-mobile URL (legacy redirect) to new dream-os URL
    if (url.hostname === "dreamos.pages.dev") {
      const newUrl = "https://dream-os.pages.dev" + url.pathname + url.search;
      return Response.redirect(newUrl, 301);
    }

    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0];

    const cors = {
      "Access-Control-Allow-Origin":  allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // Verify Turnstile token
    if (url.pathname === "/api/verify-turnstile") {
      const { token } = await request.json();
      const res = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token }),
        }
      );
      const data = await res.json();
      return new Response(
        JSON.stringify({ success: data.success }),
        {
          status: data.success ? 200 : 403,
          headers: { "Content-Type": "application/json", ...cors },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...cors },
    });
  },
};
