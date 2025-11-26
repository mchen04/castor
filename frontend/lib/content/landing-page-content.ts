import { Bot } from "lucide-react"
import type {
  HeroContent,
  ServiceTier,
  EnhancedTestimonial,
  FinalCTAContent,
  SampleConversation,
} from "@/types/landing"

/**
 * Hero Section Content - Simplified
 */
export const heroContent: HeroContent = {
  headline: "Get Cited by ChatGPT, Perplexity, and AI Search",
  subheadline:
    "Your competitors are invisible to AI. Get research-backed tactics to become the source AI quotes. Expert guidance at $59.99/month.",
  primaryCTA: {
    text: "Start Getting Cited",
    href: "/sign-in",
  },
}

/**
 * Sample Conversations for Chat Preview
 */
export const sampleConversations: SampleConversation[] = [
  {
    id: "geo-tactics",
    question: "What GEO tactics should I prioritize for my B2B SaaS?",
    answer: `Based on 200+ research papers, here are the top 3 tactics for B2B SaaS:

**1. Entity Recognition Optimization**
Structure content around named entities (products, people, concepts) that LLMs can easily identify and cite.

**2. Authoritative Source Signals**
Add schema markup, cite original research, and include expert quotes—AI models prioritize citation-worthy content.

**3. Question-Answer Content Patterns**
Format content to directly answer common queries. This matches how LLMs retrieve and synthesize information.

Would you like me to dive deeper into any of these tactics?`,
  },
  {
    id: "chatgpt-citations",
    question: "How can I get cited by ChatGPT?",
    answer: `Great question! Here's what the latest research shows about getting AI citations:

**Freshness matters:** AI models prioritize recently updated content. Aim to refresh key pages quarterly.

**Structured data is critical:** Implement FAQ schema, HowTo schema, and Organization schema. Research shows a 40% increase in AI citations with proper markup.

**Be the definitive source:** Create comprehensive, well-researched content that AI can confidently cite as authoritative.

I can analyze your specific website and provide tailored recommendations. What's your site URL?`,
  },
]

/**
 * Value Proposition Section Content
 */
export const valuePropositionContent = {
  problemTitle: "GEO expertise is expensive and scarce",
  problemPoints: [
    "Professional GEO consultants charge $6,000+ monthly.",
    "100+ research papers to digest. No standardized playbooks.",
    "AI algorithms evolving faster than teams can adapt.",
  ],
  solutionBadge: "Castor AI",
  solutionTitle: "$59.99/month for research-grade insights",
  solutionFeatures: [
    "Trained on 200+ GEO research papers",
    "Personalized recommendations for YOUR site",
    "Updated weekly with latest findings",
    "Unlimited questions, 24/7 availability",
  ],
}

/**
 * Services Section - Single Pricing Tier
 */
export const serviceTier: ServiceTier = {
  icon: Bot,
  title: "GEO Expert AI",
  price: "$59.99/month",
  priceSubtext: "Cancel anytime",
  features: [
    { text: "247 research papers in knowledge base" },
    { text: "Personalized recommendations for your site" },
    { text: "Updated weekly with new research" },
    { text: "Unlimited questions, 24/7 access" },
    { text: "30-day money-back guarantee" },
  ],
  buttonText: "Start Your GEO Strategy",
  buttonHref: "/sign-in",
  badge: "Most Popular",
  description: "Everything you need to optimize for AI search. No contracts, no consultants, no confusion.",
  variant: "accent",
}

/**
 * Testimonials with Metrics
 */
export const testimonials: EnhancedTestimonial[] = [
  {
    quote:
      "We went from zero AI citations to being quoted in ChatGPT for 12 target keywords. Castor showed us exactly which schema markup changes to make.",
    author: "Sarah Chen",
    role: "Head of Marketing",
    company: "TechFlow Analytics",
    metric: { label: "AI Citations", value: "12", timeframe: "in 8 weeks" },
    featured: true,
  },
  {
    quote:
      "I was quoted $8,000/month by two GEO agencies. Castor's recommendations were identical. I implemented everything myself in a weekend.",
    author: "Marcus Rodriguez",
    role: "Founder",
    company: "LocalFirst SEO",
    metric: { label: "Saved", value: "$96,000", timeframe: "first year" },
  },
  {
    quote:
      "The research depth is incredible. When I asked about entity optimization, Castor cited 23 specific papers from Stanford and explained the methodology.",
    author: "Jennifer Park",
    role: "SEO Director",
    company: "Elevate Digital",
    metric: { label: "Papers cited", value: "23", timeframe: "in first session" },
  },
]

/**
 * Final CTA Section - Simplified
 */
export const finalCTAContent: FinalCTAContent = {
  headline: "Ready to optimize for AI search?",
  subheadline:
    "Join hundreds of marketers getting research-backed GEO advice.",
  primaryCTA: {
    text: "Start for $59.99/month",
    href: "/sign-in",
  },
  guarantee: "30-day money-back guarantee. Cancel anytime.",
}