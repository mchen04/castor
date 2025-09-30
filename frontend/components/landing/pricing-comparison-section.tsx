import { Section } from "@/components/ui/section"
import { SectionHeader } from "@/components/ui/section-header"
import { ComparisonCard } from "@/components/ui/comparison-card"
import { pricingComparison } from "@/lib/content/landing-page-content"

export function PricingComparisonSection() {
  return (
    <Section background="card">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Why GEO Consulting Commands Premium Pricing"
          subtitle="Professional agencies charge $6,000+/month because GEO is complex and requires deep expertise. Castor democratizes access to this knowledge."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {pricingComparison.map((comparison, index) => (
            <ComparisonCard key={index} {...comparison} />
          ))}
        </div>
      </div>
    </Section>
  )
}