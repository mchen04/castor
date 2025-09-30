import { Section } from "@/components/ui/section"
import { SectionHeader } from "@/components/ui/section-header"
import { ServiceCard } from "@/components/ui/service-card"
import { serviceTiers } from "@/lib/content/landing-page-content"

export function ServicesSection() {
  return (
    <Section id="services" background="card">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Choose Your GEO Solution"
          subtitle="Get research-backed GEO expertise at a fraction of traditional consulting costs"
        />

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {serviceTiers.map((tier, index) => (
            <ServiceCard key={index} {...tier} />
          ))}
        </div>
      </div>
    </Section>
  )
}