"use client"

import { Section } from "@/components/ui/section"
import { SectionHeader } from "@/components/ui/section-header"
import { ServiceCard } from "@/components/ui/service-card"
import { serviceTier } from "@/lib/content/landing-page-content"

export function ServicesSection() {
  return (
    <Section id="pricing" background="card" spacing="large">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Simple, Transparent Pricing"
          subtitle="Everything you need to optimize for AI search"
        />

        {/* Single prominent pricing card */}
        <div className="max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-300">
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-3xl" />
            <div className="relative ring-4 ring-accent/20 ring-offset-4 ring-offset-background rounded-2xl">
              <ServiceCard {...serviceTier} />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}