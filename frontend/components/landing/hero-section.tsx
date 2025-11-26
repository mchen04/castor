import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { ChatPreview } from "@/components/landing/chat-preview"
import { heroContent } from "@/lib/content/landing-page-content"

export function HeroSection() {
  return (
    <Section
      background="gradient"
      spacing="hero"
      className="relative overflow-hidden min-h-[90vh] flex items-center"
    >
      <div className="relative w-full">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Headline with entrance animation */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance animate-hero-entrance">
            {heroContent.headline}
          </h1>

          {/* Subheadline with staggered animation */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-hero-entrance animate-delay-100">
            {heroContent.subheadline}
          </p>

          {/* Single CTA with staggered animation */}
          <div className="pt-6 animate-hero-entrance animate-delay-200">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-10 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link href={heroContent.primaryCTA.href}>
                {heroContent.primaryCTA.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Chat Preview - Product Demo */}
        <div className="mt-16 animate-hero-entrance animate-delay-300">
          <ChatPreview />
        </div>
      </div>
    </Section>
  )
}