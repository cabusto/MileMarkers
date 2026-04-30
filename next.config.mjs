/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

// Tokens live in localStorage, so XSS is the main risk worth mitigating.
// - default-src 'self': only our origin
// - script-src 'self' + 'unsafe-inline': required for Next.js RSC inline scripts. We still block external scripts, which is the protection that matters most.
// - connect-src 'self': only same-origin. /api/refresh proxies all Smashrun calls.
// - frame-ancestors 'none', object-src 'none': blocks clickjacking and Flash-style embeds.
const csp = [
  "default-src 'self'",
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
