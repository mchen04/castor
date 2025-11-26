import { Section } from "@/components/ui/section"
import { Badge } from "@/components/ui/badge"
import { testimonials } from "@/lib/content/landing-page-content"

export function TestimonialsSection() {
  // Find featured testimonial, or use first one
  const featuredTestimonial = testimonials.find((t) => t.featured) || testimonials[0]
  const secondaryTestimonials = testimonials.filter((t) => t !== featuredTestimonial)

  return (
    <Section id="testimonials" spacing="large" background="muted">
      <div className="max-w-4xl mx-auto text-center space-y-16">
        {/* Featured Testimonial - Large quote */}
        <blockquote className="space-y-6">
          <p className="text-2xl md:text-3xl font-medium leading-relaxed text-balance">
            &ldquo;{featuredTestimonial.quote}&rdquo;
          </p>
          <footer className="space-y-3">
            {/* Metric Badge */}
            <Badge variant="secondary" className="text-sm px-4 py-1">
              {featuredTestimonial.metric.value} {featuredTestimonial.metric.label.toLowerCase()} {featuredTestimonial.metric.timeframe}
            </Badge>
            <div className="text-muted-foreground">
              <cite className="font-semibold not-italic text-foreground">
                {featuredTestimonial.author}
              </cite>
              <span className="mx-2 opacity-50">|</span>
              <span>{featuredTestimonial.role}, {featuredTestimonial.company}</span>
            </div>
          </footer>
        </blockquote>

        {/* Secondary testimonials - compact, inline */}
        {secondaryTestimonials.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border">
            {secondaryTestimonials.map((testimonial, index) => (
              <div key={index} className="text-left p-6 bg-card/50 rounded-xl">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    — {testimonial.author}, {testimonial.role}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.metric.value} {testimonial.metric.label.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}