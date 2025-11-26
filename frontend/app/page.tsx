import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ValuePropositionSection } from "@/components/landing/value-proposition-section"
import { ServicesSection } from "@/components/landing/services-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { FinalCTASection } from "@/components/landing/final-cta-section"

export default function GEOLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero with product demo */}
      <HeroSection />

      {/* Problem + Solution combined */}
      <ValuePropositionSection />

      {/* Single pricing tier */}
      <ServicesSection />

      {/* Social proof with metrics */}
      <TestimonialsSection />

      {/* Final conversion */}
      <FinalCTASection />

      <Footer />
    </div>
  )
}
