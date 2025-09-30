import { Bot, Search, Target, TrendingUp, Users, Globe, MessageCircle, Book, Network, Sparkles } from "lucide-react"
import type {
  HeroContent,
  ComparisonColumn,
  FeatureCardData,
  ServiceTier,
  Testimonial,
  HowItWorksStep,
  FinalCTAContent,
  VisibilityMetric,
} from "@/types/landing"

/**
 * Hero Section Content
 */
export const heroContent: HeroContent = {
  badge: "Trained on 200+ Research Papers • Updated Weekly",
  headline: "Expert GEO Consulting, Without the $6,000/Month Price Tag",
  subheadline:
    "GEO consulting costs $6,000+/month. Get the same research-backed expertise for $59.99/month—available 24/7.",
  primaryCTA: {
    text: "Get Research-Backed GEO Advice - $59.99/month",
    href: "/login",
  },
  secondaryCTA: {
    text: "Learn Why GEO Matters",
    href: "#problem",
  },
  researchCounter: {
    label: "Research Papers Analyzed",
    value: 247,
    updatedText: "Updated 2 days ago",
  },
}

/**
 * AI Visibility Metrics (for hero section chart)
 */
export const visibilityMetrics: VisibilityMetric[] = [
  {
    icon: Bot,
    label: "ChatGPT Citations",
    progress: 75,
    colorClass: "bg-primary",
  },
  {
    icon: Search,
    label: "Perplexity Mentions",
    progress: 80,
    colorClass: "bg-accent",
  },
  {
    icon: Globe,
    label: "Google AI Overviews",
    progress: 66,
    colorClass: "bg-chart-3",
  },
]

/**
 * Pricing Comparison Section (NEW)
 * Why GEO consulting commands premium pricing
 */
export const pricingComparison: ComparisonColumn[] = [
  {
    icon: Book,
    title: "The Knowledge Gap",
    bulletPoints: [
      "100+ research papers to digest",
      "No standardized playbooks yet",
      "AI algorithms constantly evolving",
      "Requires deep expertise in AI systems",
    ],
    bottomStat: "Consultants charge $6,000+/month",
    variant: "default",
  },
  {
    icon: Network,
    title: "Not One-Size-Fits-All",
    bulletPoints: [
      "40+ different GEO tactics exist",
      "Entity recognition optimization",
      "Schema markup for AI understanding",
      "Citation-worthy content patterns",
      "Every site needs custom diagnosis",
    ],
    bottomStat: "Each business requires unique strategy",
    variant: "default",
  },
  {
    icon: Sparkles,
    title: "The Castor Solution",
    bulletPoints: [
      "Trained on 200+ research papers",
      "Personalized recommendations for YOUR site",
      "Updated weekly with new findings",
      "Available 24/7, no appointment needed",
    ],
    bottomStat: "$59.99/month instead of $6,000+",
    highlighted: true,
    variant: "accent",
  },
]

/**
 * Solution Section - Feature Cards
 */
export const solutionFeatures: FeatureCardData[] = [
  {
    icon: Book,
    title: "Trained on 200+ Research Papers",
    description: "Our AI has read every major GEO research paper from Stanford, MIT, and leading AI labs—so you don't have to",
    iconColor: "primary",
  },
  {
    icon: Target,
    title: "Personalized Tactic Recommendations",
    description: "Not generic advice—get custom recommendations for YOUR site based on your industry, content, and goals",
    iconColor: "accent",
  },
  {
    icon: TrendingUp,
    title: "Always Up-to-Date with Latest Research",
    description: "Updated weekly with new GEO findings and tactics as the field evolves—your consultant never goes stale",
    iconColor: "chart-3",
  },
  {
    icon: Users,
    title: "24/7 Access, No Appointments",
    description: "Ask unlimited questions anytime—no scheduling calls, no hourly rates, no waiting for consultant availability",
    iconColor: "chart-4",
  },
]

/**
 * Services Section - Pricing Tiers
 */
export const serviceTiers: ServiceTier[] = [
  {
    icon: Bot,
    title: "GEO Expert AI Consultant",
    price: "$59.99/month",
    priceSubtext: "Monthly Subscription",
    features: [
      { text: "Trained on 200+ GEO research papers" },
      { text: "Personalized tactic recommendations (not generic advice)" },
      { text: "Weekly updates with latest research findings" },
      { text: "24/7 access to expert-level guidance" },
      { text: "Unlimited questions—no hourly limits" },
    ],
    buttonText: "Start for $59.99/month",
    buttonHref: "/login",
    badge: "Most Popular",
    description: "Access the same knowledge base that professional agencies use to charge $6,000+/month. Research-backed recommendations, continuously updated.",
    variant: "accent",
  },
  {
    icon: MessageCircle,
    title: "Traditional GEO Consulting",
    price: "Starting at $6,000/month",
    priceSubtext: "Professional Retainer",
    features: [
      { text: "Direct 1-on-1 consultation with GEO experts" },
      { text: "Custom strategy tailored to your business" },
      { text: "Hands-on implementation support" },
      { text: "Quarterly strategy reviews" },
      { text: "White-glove service" },
    ],
    buttonText: "Contact Us",
    buttonVariant: "outline",
    description: "For enterprises requiring dedicated attention and hands-on implementation. Premium consulting with expert strategists.",
    variant: "primary",
  },
]

/**
 * Testimonials
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "Finally, a solution that actually works for AI search. Our ChatGPT mentions increased 300% in just 2 weeks.",
    author: "Sarah Chen, Marketing Director",
  },
  {
    quote:
      "The advice isn't generic—it references actual research and explains WHY tactics work. We're now cited in AI responses regularly.",
    author: "Mike Rodriguez, SEO Specialist",
  },
  {
    quote:
      "I was quoted $8,000/month by a GEO agency. Castor gives me the same quality advice for $59.99. Incredible value.",
    author: "Lisa Park, Founder",
  },
]

/**
 * How It Works Steps
 */
export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: 1,
    title: "Subscribe ($59.99/month)",
    description: "Monthly subscription for unlimited access to research-backed GEO consulting",
    colorClass: "bg-accent text-accent-foreground",
  },
  {
    number: 2,
    title: "Get Research-Backed Recommendations",
    description:
      "Ask questions like 'Which GEO tactics should I prioritize?' and get answers based on 200+ research papers",
    colorClass: "bg-primary text-primary-foreground",
  },
  {
    number: 3,
    title: "Implement Strategies Immediately",
    description: "Apply proven tactics to optimize your content for ChatGPT, Perplexity, and other AI platforms",
    colorClass: "bg-chart-3 text-background",
  },
]

/**
 * Final CTA Section
 */
export const finalCTAContent: FinalCTAContent = {
  headline: "Don't Let AI Search Leave You Behind",
  subheadline:
    "While your competitors pay $6,000+/month for GEO consulting, you can access the same research-backed expertise for $59.99. Start optimizing for AI search today.",
  primaryCTA: {
    text: "Get Expert GEO Advice - $59.99/month",
    href: "/login",
  },
  secondaryCTA: {
    text: "Get Custom Consulting",
    href: "mailto:contact@castor.ai",
  },
  guarantee: "30-day money-back guarantee. Cancel anytime. Join businesses already optimizing for AI search.",
}

/**
 * Problem Section Statistics
 */
export const problemSectionStats = [
  "50%+ of searches answered by AI in 2025",
  "ChatGPT gets 1B+ queries daily",
]

/**
 * Social Proof - Platform Logos
 */
export const platformLogos = ["ChatGPT", "Perplexity", "Google", "Gemini"]