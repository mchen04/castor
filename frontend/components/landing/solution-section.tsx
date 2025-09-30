import { Section } from "@/components/ui/section"
import { SectionHeader } from "@/components/ui/section-header"
import { FeatureCard } from "@/components/ui/feature-card"
import { solutionFeatures } from "@/lib/content/landing-page-content"

export function SolutionSection() {
  return (
    <Section id="solution">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="How Castor Democratizes GEO Expertise"
          subtitle="Access the same knowledge base that professional agencies use to charge $6,000+/month. Research-backed, continuously updated, personalized to your needs."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutionFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </Section>
  )
}