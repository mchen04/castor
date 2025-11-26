import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { finalCTAContent } from "@/lib/content/landing-page-content"

export function FinalCTASection() {
  return (
    <Section spacing="large" background="gradient-cta">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          {finalCTAContent.headline}
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {finalCTAContent.subheadline}
        </p>

        {/* Single prominent CTA */}
        <div className="pt-4">
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-12 py-7 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Link href={finalCTAContent.primaryCTA.href}>
              {finalCTAContent.primaryCTA.text}
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground pt-4">
          {finalCTAContent.guarantee}
        </p>
      </div>
    </Section>
  )
}