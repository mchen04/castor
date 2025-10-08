"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/ui/section"
import { SectionHeader } from "@/components/ui/section-header"
import { Bot, Search, Target } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { PricingComparisonSection } from "@/components/landing/pricing-comparison-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { ServicesSection } from "@/components/landing/services-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { FinalCTASection } from "@/components/landing/final-cta-section"
import { howItWorksSteps } from "@/lib/content/landing-page-content"

export default function GEOLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Problem Section - AI Search Evolution */}
      <Section id="problem" background="card">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="The Search Landscape Has Changed Forever"
            subtitle="Traditional SEO is dead. AI search is the new reality."
          />

          <div className="grid md:grid-cols-3 gap-10">
            <Card className="text-center p-10 bg-card border shadow-lg hover:shadow-xl transition-all">
              <CardContent className="space-y-5">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Traditional SEO</h3>
                <p className="text-muted-foreground">10 blue links</p>
                <p className="text-sm text-muted-foreground">Users click through multiple results</p>
              </CardContent>
            </Card>

            <Card className="text-center p-10 bg-card border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="space-y-5">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary">AI Search</h3>
                <p className="text-primary font-medium">1 synthesized answer</p>
                <p className="text-sm text-muted-foreground">AI provides the complete answer</p>
              </CardContent>
            </Card>

            <Card className="text-center p-10 bg-card border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="space-y-5">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-accent">Your Challenge</h3>
                <p className="text-accent font-medium">Be THE cited source</p>
                <p className="text-sm text-muted-foreground">Get mentioned in AI responses</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center space-y-4">
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 text-xl md:text-2xl font-bold">
              <div className="text-accent">50%+ of searches answered by AI in 2025</div>
              <div className="text-primary">ChatGPT gets 1B+ queries daily</div>
            </div>
          </div>
        </div>
      </Section>

      {/* NEW: Pricing Comparison Section */}
      <PricingComparisonSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Services Section */}
      <ServicesSection />

      {/* How It Works */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-20">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-12">
            {howItWorksSteps.map((step) => (
              <div key={step.number} className="space-y-4">
                <div
                  className={`w-16 h-16 ${step.colorClass} rounded-full flex items-center justify-center mx-auto text-2xl font-bold`}
                >
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Final CTA */}
      <FinalCTASection />

      <Footer />
    </div>
  )
}