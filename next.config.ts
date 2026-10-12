import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";

    // Define baseline security headers applicable across all paths.
    // Rationale: Establishing these at the engine level guarantees coverage across
    // server-rendered pages, static assets, and route handlers without middleware overhead.
    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff", // Mitigate MIME-sniffing exploits
      },
      {
        key: "X-Frame-Options",
        value: "DENY", // Prevent clickjacking by forbidding embedding in iframes
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin", // Balance privacy and diagnostic referrer data
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()", // Disable unneeded device hardware APIs
      },
      {
        key: "Content-Security-Policy",
        // Baseline CSP for Next.js App Router (permits self-hosted assets and inline styles/scripts needed by Next.js hydration)
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
      },
    ];

    // Enforce Strict-Transport-Security (HSTS) only in production environments.
    // Rationale: Avoid breaking local development on unencrypted http://localhost.
    if (isProduction) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
