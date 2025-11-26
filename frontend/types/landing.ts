import type { LucideIcon } from "lucide-react"

/**
 * Hero section content structure - Simplified
 */
export interface HeroContent {
  headline: string
  subheadline: string
  primaryCTA: {
    text: string
    href: string
  }
}

/**
 * Sample conversation for chat preview
 */
export interface SampleConversation {
  id: string
  question: string
  answer: string
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
 * Enhanced testimonial with metrics
 */
export interface EnhancedTestimonial {
  quote: string
  author: string
  role: string
  company: string
  metric: {
    label: string
    value: string
    timeframe: string
  }
  featured?: boolean
}

/**
 * Final CTA section content - Simplified
 */
export interface FinalCTAContent {
  headline: string
  subheadline: string
  primaryCTA: {
    text: string
    href: string
  }
  guarantee: string
}