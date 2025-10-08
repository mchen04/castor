import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"
import { finalCTAContent } from "@/lib/content/landing-page-content"

export function FinalCTASection() {
  return (
    <Section>
      <div className="max-w-4xl mx-auto text-center space-y-10">
        <h2 className="text-3xl md:text-5xl font-bold text-balance">{finalCTAContent.headline}</h2>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">{finalCTAContent.subheadline}</p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full pt-4">
          <div className="w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 sm:px-12 py-7 text-base sm:text-lg md:text-xl whitespace-normal sm:whitespace-nowrap w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all"
            >
              <Link href={finalCTAContent.primaryCTA.href}>
                {finalCTAContent.primaryCTA.text}
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
          <div className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 sm:px-12 py-7 text-base sm:text-lg md:text-xl bg-card whitespace-normal sm:whitespace-nowrap w-full sm:w-auto transition-all shadow-lg hover:shadow-xl"
              asChild
            >
              <a href={finalCTAContent.secondaryCTA.href}>
                {finalCTAContent.secondaryCTA.text}
                <ArrowRight className="ml-3 h-6 w-6" />
              </a>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{finalCTAContent.guarantee}</p>
      </div>
    </Section>
  )
}