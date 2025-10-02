# Castor - GEO Chatbot Platform

A premium **Generative Engine Optimization (GEO)** consultant chatbot platform with subscription-based access ($59.99/month). Castor helps businesses optimize their content for AI search engines like ChatGPT, Perplexity, and Google AI Overviews.

🌐 **Live:** [trycastor.dev](https://trycastor.dev)

---

## 🏗️ Architecture

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Authentication:** Clerk (Google OAuth)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe (Subscriptions)
- **AI Chatbot:** Dify AI (embedded iframe)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS + shadcn/ui components

**Key Features:**
- ✅ Google OAuth authentication via Clerk
- ✅ Subscription-based paywall ($59.99/month)
- ✅ Stripe Checkout integration with webhook handling
- ✅ Embedded Dify AI chatbot with cross-device conversation persistence
- ✅ Payment grace period for failed recurring payments
- ✅ Stripe Customer Portal for self-service billing
- ✅ Fully responsive landing page with SEO optimization
- ✅ Server-side payment verification

---

## 📂 Project Structure

```
castor-1/
├── frontend/                       # Next.js application
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Root layout with Clerk provider
│   │   ├── loading.tsx            # Global loading state
│   │   ├── sign-in/               # Clerk sign-in page
│   │   ├── sign-up/               # Clerk sign-up page
│   │   ├── dashboard/             # Protected dashboard (paywall + chatbot)
│   │   └── api/                   # API routes
│   │       ├── checkout/          # Stripe Checkout session creation
│   │       ├── customer-portal/   # Stripe Customer Portal session
│   │       └── webhook/stripe/    # Stripe webhook handler
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── landing/               # Landing page sections
│   │   ├── header.tsx             # Site header with navigation
│   │   ├── footer.tsx             # Site footer
│   │   ├── dify-chatbot.tsx       # Dify AI chatbot embed
│   │   ├── paywall-card.tsx       # Subscription paywall
│   │   ├── grace-period-warning.tsx # Payment failure warning
│   │   └── avatar-menu.tsx        # User menu with billing link
│   ├── lib/                       # Utilities and helpers
│   │   ├── supabase/
│   │   │   ├── server.ts          # Server-side Supabase client
│   │   │   └── admin.ts           # Admin Supabase client
│   │   ├── content/
│   │   │   └── landing-page-content.ts  # Landing page content
│   │   ├── types.ts               # TypeScript type definitions
│   │   ├── utils.ts               # Utility functions (cn, etc.)
│   │   └── dify-url-encoder.ts    # Dify user ID encoder
│   ├── middleware.ts              # Clerk authentication middleware
│   ├── .env.local                 # Local environment variables
│   └── .env.production            # Production env reference
└── CLAUDE.md                      # AI agent instructions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x
- npm or pnpm
- Clerk account
- Supabase project
- Stripe account
- Dify AI chatbot instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mchen04/castor.git
   cd castor-1/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   STRIPE_PRICE_ID=your-stripe-price-id

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

   # App
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

**Supabase Tables:**

### `users` (via Clerk sync)
```sql
- id: uuid (primary key, synced from Clerk)
- email: text
- created_at: timestamp
- stripe_customer_id: text
- stripe_subscription_id: text
- subscription_status: text
- current_period_end: timestamp
- cancel_at_period_end: boolean
- in_grace_period: boolean
```

### `processed_events` (webhook idempotency)
```sql
- id: uuid (primary key)
- event_id: text (unique, Stripe event ID)
- created_at: timestamp
```

---

## 💳 Payment Flow

### Subscription Flow
1. User signs in with Google OAuth (Clerk)
2. Dashboard checks payment status from Supabase `users` table
3. If not subscribed → PaywallCard component shows Stripe Checkout button
4. User clicks "Subscribe" → `/api/checkout` creates Stripe Checkout session
5. User completes payment on Stripe
6. Stripe sends `checkout.session.completed` webhook → `/api/webhook/stripe`
7. Webhook handler:
   - Verifies signature
   - Checks idempotency (`processed_events` table)
   - Updates `users` table with subscription metadata
8. User returns to dashboard → sees chatbot

### Recurring Payments
- **Success:** `invoice.payment_succeeded` webhook clears grace period
- **Failure:** `invoice.payment_failed` webhook sets grace period flag
- **Grace Period:** User sees warning banner but maintains access during Stripe's retry window

### Cancellation
- User clicks "Manage Billing" → Stripe Customer Portal
- Cancels subscription → `customer.subscription.deleted` webhook revokes access

---

## 🤖 Dify Chatbot Integration

The Dify AI chatbot is embedded via iframe with:
- **User Identification:** Clerk user ID is encoded (GZIP + Base64 + URL-encoded) and passed as `sys.user_id` parameter
- **Cross-Device Persistence:** Conversations persist across devices via user_id
- **Microphone Access:** Voice input enabled for chatbot interactions

**Implementation:**
```typescript
// components/dify-chatbot.tsx
const encodedUserId = encodeDifyUserId(userId)
const chatbotUrl = `https://udify.app/chat/fIZjEA7ZAmd1LKh8?sys.user_id=${encodedUserId}`
```

---

## 🔐 Authentication & Authorization

**Authentication:** Clerk handles all auth via Google OAuth
**Authorization:** Middleware + server-side payment checks

### Middleware (`middleware.ts`)
- Protects routes except: `/`, `/sign-in`, `/sign-up`, `/api/webhook`
- Uses Clerk's `clerkMiddleware` for session management

### Payment Verification
- **Client-side:** Dashboard reads user data from Supabase
- **Server-side:** API routes verify payment status before granting access
- **Webhook:** Stripe webhooks update payment status in real-time

---

## 📡 API Routes

### `POST /api/checkout`
Creates Stripe Checkout session for new subscriptions.

**Request:**
```json
{
  "userId": "user_xxx"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### `POST /api/customer-portal`
Creates Stripe Customer Portal session for billing management.

**Request:**
```json
{
  "customerId": "cus_xxx"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### `POST /api/webhook/stripe`
Handles Stripe webhook events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Security:** Verifies webhook signature, checks idempotency

---

## 🎨 UI Components

Built with **shadcn/ui** and custom components:

### Landing Page Components
- `HeroSection` - Hero with CTA
- `PricingComparisonSection` - Pricing table
- `SolutionSection` - Value proposition
- `ServicesSection` - Feature cards
- `TestimonialsSection` - Customer testimonials
- `FinalCTASection` - Bottom CTA

### Dashboard Components
- `PaywallCard` - Subscription paywall
- `DifyChatbot` - AI chatbot embed
- `GracePeriodWarning` - Payment failure alert
- `AvatarMenu` - User dropdown with billing link

### UI Primitives (shadcn/ui)
- Button, Card, Dialog, Dropdown, Input, Select, Tabs, Toast, etc.

---

## 🧪 Testing

**Type Checking:**
```bash
npm run type-check
```

**Linting:**
```bash
npm run lint
```

**Build:**
```bash
npm run build
```

---

## 🚢 Deployment

**Platform:** Vercel

### Environment Variables (Vercel Dashboard)
Add all variables from `.env.production` to Vercel:
- Settings → Environment Variables → Add each variable

### Stripe Webhooks
1. Add webhook endpoint in Stripe Dashboard:
   ```
   https://trycastor.dev/api/webhook/stripe
   ```

2. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel

### Deploy
```bash
git push origin main
```

Vercel auto-deploys on push to `main` branch.

---

## 📝 Development Guidelines

### Code Style
- **TypeScript:** Strict mode, explicit types
- **Components:** PascalCase files, kebab-case for multi-word
- **Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** Keep under 350 lines, split if needed

### Security
- Never commit secrets (use `.env.local`)
- Validate all webhook signatures
- Use Row Level Security (RLS) in Supabase
- Server-side payment verification only

### Git Workflow
- `main` branch for production
- Feature branches for development
- Vercel previews for pull requests

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Clerk redirects to `/login` (404)
- **Fix:** Ensure `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard` is set in Vercel

**Issue:** Stripe webhook not working
- **Fix:** Check webhook signature secret, verify endpoint URL in Stripe Dashboard

**Issue:** Chatbot not loading
- **Fix:** Verify user has active subscription, check Dify URL and user_id encoding

**Issue:** Payment status not updating
- **Fix:** Check Supabase webhook logs, verify `processed_events` table for duplicates

---

## 📄 License

Proprietary - All rights reserved

---

## 👤 Author

**Michael Chen**
- GitHub: [@mchen04](https://github.com/mchen04)
- Email: michaelluochen1@gmail.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [Supabase](https://supabase.com/)
- [Stripe](https://stripe.com/)
- [Dify AI](https://dify.ai/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
