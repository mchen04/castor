import type { LucideIcon } from "lucide-react"

/**
 * Hero section content structure
 */
export interface HeroContent {
  badge: string
  headline: string
  subheadline: string
  primaryCTA: {
    text: string
    href: string
  }
  secondaryCTA: {
    text: string
    href: string
  }
  researchCounter: {
    label: string
    value: number
    updatedText?: string
  }
}

/**
 * Comparison column for pricing/feature comparisons
 */
export interface ComparisonColumn {
  icon: LucideIcon
  title: string
  bulletPoints: string[]
  bottomStat: string
  highlighted?: boolean
  variant?: "default" | "accent" | "primary"
}

/**
 * Feature card data structure
 */
export interface FeatureCardData {
  icon: LucideIcon
  title: string
  description: string
  iconColor: "primary" | "accent" | "chart-3" | "chart-4"
}

/**
 * Service tier/pricing card structure
 */
export interface ServiceTier {
  icon: LucideIcon
  title: string
  price: string
  priceSubtext: string
  features: { text: string }[]
  buttonText: string
  buttonHref?: string
  buttonVariant?: "default" | "outline"
  badge?: string
  description: string
  variant?: "accent" | "primary"
}

/**
 * Testimonial structure
 */
export interface Testimonial {
  quote: string
  author: string
}

/**
 * Step in "How It Works" section
 */
export interface HowItWorksStep {
  number: number
  title: string
  description: string
  colorClass: string
}

/**
 * Final CTA section content
 */
export interface FinalCTAContent {
  headline: string
  subheadline: string
  primaryCTA: {
    text: string
    href: string
  }
  secondaryCTA: {
    text: string
    href: string
  }
  guarantee: string
}

/**
 * AI platform visibility metrics
 */
export interface VisibilityMetric {
  icon: LucideIcon
  label: string
  progress: number
  colorClass: string
}