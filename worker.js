// Dream Board Mobile - Cloudflare Worker
// Handles Turnstile verification server-side

const TURNSTILE_SECRET = "";
const ALLOWED_ORIGIN  = "https://dream-board-mobile.pages.dev";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const cors = {
      "Access-Control-Allow-Origin":  ALLOWED_ORIGIN,
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
        { status: data.success ? 200 : 403, headers: { "Content-Type": "application/json", ...cors } }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...cors },
    });
  },
};
