import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { finalCTAContent } from "@/lib/content/landing-page-content"

export function FinalCTASection() {
  return (
    <Section>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-5xl font-bold text-balance">{finalCTAContent.headline}</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{finalCTAContent.subheadline}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-12 py-6 text-xl"
          >
            <Link href={finalCTAContent.primaryCTA.href}>
              {finalCTAContent.primaryCTA.text}
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-12 py-6 text-xl bg-transparent"
            asChild
          >
            <a href={finalCTAContent.secondaryCTA.href}>
              {finalCTAContent.secondaryCTA.text}
              <ArrowRight className="ml-3 h-6 w-6" />
            </a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{finalCTAContent.guarantee}</p>
      </div>
    </Section>
  )
}