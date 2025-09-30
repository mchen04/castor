import { Section } from "@/components/ui/section"
import { SectionHeader } from "@/components/ui/section-header"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import { testimonials, platformLogos } from "@/lib/content/landing-page-content"

export function TestimonialsSection() {
  return (
    <Section id="testimonials" background="card">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Trusted by Marketing Professionals"
          subtitle="Join businesses already optimizing for AI search with research-backed guidance"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} quote={testimonial.quote} author={testimonial.author} />
          ))}
        </div>

        <div className="flex justify-center items-center gap-8 opacity-60 flex-wrap">
          {platformLogos.map((logo, index) => (
            <div key={index} className="text-2xl font-bold">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}