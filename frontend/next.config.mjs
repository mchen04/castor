/** @type {import('next').NextConfig} */

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development'

// Content Security Policy configuration
// Based on official requirements from Next.js, Clerk, Stripe, Supabase, and Dify
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://challenges.cloudflare.com https://js.stripe.com https://*.clerk.accounts.dev https://clerk.trycastor.dev;
  connect-src 'self' https://*.clerk.accounts.dev https://clerk.trycastor.dev https://clerk-telemetry.com https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://api.dify.ai vitals.vercel-insights.com;
  img-src 'self' data: blob: https://img.clerk.com https://*.stripe.com https://*.supabase.co https://clerk.trycastor.dev;
  frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`

// Security headers configuration
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Add security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}

export default nextConfig
