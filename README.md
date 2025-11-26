# Castor - GEO Chatbot Platform

A premium **Generative Engine Optimization (GEO)** consultant chatbot platform with subscription-based access ($59.99/month). Castor helps businesses optimize their content for AI search engines like ChatGPT, Perplexity, and Google AI Overviews.

🌐 **Live:** [trycastor.dev](https://trycastor.dev)

---

## 🏗️ Architecture

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui
- **State Management:** TanStack React Query (server state + caching)
- **Authentication:** Clerk (Google OAuth, GitHub OAuth, email/password)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe (Subscriptions)
- **AI Chatbot:** Dify AI (API proxy with streaming SSE)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS + shadcn/ui components

**Key Features:**
- ✅ Multi-provider authentication via Clerk (Google, GitHub, email/password)
- ✅ Subscription-based paywall ($59.99/month)
- ✅ Stripe Checkout integration with webhook handling
- ✅ AI chatbot with real-time streaming and conversation persistence
- ✅ Rate limiting (30 requests/minute per user)
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
│   │   ├── providers.tsx          # TanStack Query provider
│   │   ├── loading.tsx            # Global loading state
│   │   ├── sign-in/               # Clerk sign-in page
│   │   ├── sign-up/               # Clerk sign-up page
│   │   ├── dashboard/             # Protected dashboard (paywall + chatbot)
│   │   └── api/                   # API routes
│   │       ├── checkout/          # Stripe Checkout session creation
│   │       ├── customer-portal/   # Stripe Customer Portal session
│   │       ├── verify-checkout/   # Verify checkout completion
│   │       ├── dify/              # Dify AI proxy endpoints
│   │       │   ├── chat/          # Stream chat messages
│   │       │   ├── conversations/ # List conversations
│   │       │   ├── messages/      # Get conversation messages
│   │       │   ├── delete/        # Delete conversation
│   │       │   ├── rename/        # Rename conversation
│   │       │   ├── stop/          # Stop generation
│   │       │   └── generate-title/ # Generate conversation title
│   │       ├── generate-title/    # OpenRouter title generation
│   │       └── webhook/stripe/    # Stripe webhook handler
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── landing/               # Landing page sections
│   │   │   ├── hero-section.tsx
│   │   │   ├── value-proposition-section.tsx
│   │   │   ├── services-section.tsx
│   │   │   ├── testimonials-section.tsx
│   │   │   ├── final-cta-section.tsx
│   │   │   └── chat-preview.tsx
│   │   ├── assistant-ui/          # Chat interface components
│   │   │   ├── thread.tsx         # Conversation view
│   │   │   ├── threadlist-sidebar.tsx # Conversation list
│   │   │   └── sidebar/           # Sidebar subcomponents
│   │   ├── assistant-ui-dashboard.tsx # Main chat dashboard
│   │   ├── header.tsx             # Site header with navigation
│   │   ├── footer.tsx             # Site footer
│   │   ├── paywall-card.tsx       # Subscription paywall
│   │   ├── grace-period-warning.tsx # Payment failure warning
│   │   ├── checkout-verifier.tsx  # Verify checkout completion
│   │   └── user-menu.tsx          # User menu with billing link
│   ├── lib/                       # Utilities and helpers
│   │   ├── auth/
│   │   │   └── verify-subscription.ts # Subscription verification
│   │   ├── dify/
│   │   │   ├── client.ts          # Centralized Dify API client
│   │   │   └── errors.ts          # Error handling utilities
│   │   ├── hooks/
│   │   │   ├── use-dify-chat.ts   # Chat state & streaming
│   │   │   └── use-conversations.ts # Conversation management
│   │   ├── middleware/
│   │   │   └── rate-limit.ts      # In-memory rate limiting
│   │   ├── openrouter/
│   │   │   └── title-generator.ts # AI title generation
│   │   ├── supabase/
│   │   │   ├── server.ts          # Server-side Supabase client
│   │   │   └── admin.ts           # Admin Supabase client
│   │   ├── content/
│   │   │   └── landing-page-content.ts  # Landing page content
│   │   ├── types.ts               # TypeScript type definitions
│   │   └── utils.ts               # Utility functions (cn, etc.)
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

   # Dify AI
   DIFY_API_KEY=your-dify-api-key

   # OpenRouter (for title generation)
   OPENROUTER_API_KEY=your-openrouter-api-key

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

### `users`
```sql
- id: uuid (primary key, generated)
- clerk_id: text (unique, NOT NULL - Clerk user identifier)
- email: text
- has_paid: boolean (default: false)
- stripe_customer_id: text (unique)
- stripe_subscription_id: text (unique)
- stripe_subscription_status: text (active, trialing, past_due, canceled, unpaid, etc.)
- stripe_subscription_current_period_end: timestamptz
- stripe_subscription_cancel_at_period_end: boolean
- in_grace_period: boolean (default: false)
- created_at: timestamptz
- updated_at: timestamptz (auto-updated)
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
1. User signs in with Clerk (Google/GitHub OAuth or email/password)
2. Clerk redirects to Dashboard
3. Dashboard checks payment status from Supabase `users` table (by `clerk_id`)
4. If not subscribed → PaywallCard component shows Stripe Checkout button
5. User clicks "Subscribe" → `/api/checkout` creates Stripe Checkout session
6. User completes payment on Stripe
7. Stripe sends `checkout.session.completed` webhook → `/api/webhook/stripe`
8. Webhook handler:
   - Verifies signature
   - Checks idempotency (`processed_events` table)
   - Updates `users` table with subscription metadata
9. User returns to dashboard → sees chatbot

### Recurring Payments
- **Success:** `invoice.payment_succeeded` webhook clears grace period
- **Failure:** `invoice.payment_failed` webhook sets grace period flag
- **Grace Period:** User sees warning banner but maintains access during Stripe's retry window

### Cancellation
- User clicks "Manage Billing" → Stripe Customer Portal
- Cancels subscription → `customer.subscription.deleted` webhook revokes access

---

## 🤖 Dify AI Integration

The Dify AI chatbot is integrated via **API proxy pattern** using Vercel Serverless Functions:

**Key Features:**
- **API Proxy:** All Dify API calls routed through `/api/dify/*` endpoints
- **Authentication:** Clerk user verification + Supabase subscription check
- **User Identification:** Clerk user ID passed to Dify API for conversation persistence
- **Rate Limiting:** 30 requests/minute per user
- **Streaming Chat:** Real-time responses via Server-Sent Events (SSE)
- **Error Handling:** User-friendly error messages with retry logic
- **Title Generation:** AI-powered conversation titles via OpenRouter

**Architecture:**
```
Client → /api/dify/chat → Clerk Auth → Subscription Check → Dify API → SSE Stream → Client
```

**API Endpoints:**
- `POST /api/dify/chat` - Send chat message (streaming)
- `GET /api/dify/conversations` - List conversations
- `GET /api/dify/messages` - Get conversation messages
- `POST /api/dify/delete` - Delete conversation
- `POST /api/dify/rename` - Rename conversation
- `POST /api/dify/stop` - Stop generation
- `POST /api/generate-title` - Generate conversation title

---

## 🔐 Authentication & Authorization

**Authentication:** Clerk handles all auth (Google OAuth, GitHub OAuth, email/password)
**Authorization:** Middleware + server-side payment checks

### Middleware (`middleware.ts`)
- Protects routes except: `/`, `/sign-in`, `/sign-up`, `/api/webhook`
- Uses Clerk's `clerkMiddleware` for session management
- Automatic session refresh and CSRF protection

### Payment Verification
- **Client-side:** Dashboard reads user data from Supabase
- **Server-side:** API routes verify payment status before granting access
- **Webhook:** Stripe webhooks update payment status in real-time

---

## 📡 API Routes

### Payment Routes

**`POST /api/checkout`**
Creates Stripe Checkout session for new subscriptions.

**`POST /api/customer-portal`**
Creates Stripe Customer Portal session for billing management.

**`GET /api/verify-checkout`**
Verifies checkout session completion.

**`POST /api/webhook/stripe`**
Handles Stripe webhook events with signature verification and idempotency.

### Dify AI Proxy Routes

**`POST /api/dify/chat`**
Send chat message with streaming SSE response. Requires active subscription. Rate limited to 30 req/min.

**`GET /api/dify/conversations`**
List user's conversations with pagination.

**`GET /api/dify/messages`**
Get messages from specific conversation.

**`POST /api/dify/delete`**
Delete a conversation.

**`POST /api/dify/rename`**
Rename a conversation.

**`POST /api/dify/stop`**
Stop generating a streaming response.

**`POST /api/dify/generate-title`**
Auto-generate conversation title.

### Title Generation

**`POST /api/generate-title`**
Generate conversation title using OpenRouter AI.

---

## 🎨 UI Components

Built with **shadcn/ui** and custom components:

### Landing Page Components
- `HeroSection` - Hero with CTA
- `ValuePropositionSection` - Value proposition with feature highlights
- `ServicesSection` - Feature cards
- `TestimonialsSection` - Customer testimonials
- `FinalCTASection` - Bottom CTA
- `ChatPreview` - Interactive chat preview demo

### Dashboard Components
- `PaywallCard` - Subscription paywall
- `AssistantUIDashboard` - Main chat dashboard orchestrator
- `Thread` - Conversation message view
- `ThreadlistSidebar` - Conversation list with sidebar navigation
- `GracePeriodWarning` - Payment failure alert
- `UserMenu` - User dropdown with billing link
- `CheckoutVerifier` - Verify checkout completion

### UI Primitives (shadcn/ui)
- Button, Card, Dialog, Dropdown, Input, Select, Tabs, Toast, etc.

---

## 🧪 Testing & Quality Checks

**Type Checking:**
```bash
npm run type-check
```

**Linting:**
```bash
npm run lint
```

**Unused Code Detection:**
```bash
npm run check:unused    # Detect unused code and dependencies
npm run fix:unused      # Auto-fix detected unused code
```

**Run All Checks:**
```bash
npm run check:all       # Type + Lint + Unused detection
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
