import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Section } from "@/components/ui/section"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { valuePropositionContent } from "@/lib/content/landing-page-content"

export function ValuePropositionSection() {
  return (
    <Section id="value" spacing="large">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: The Problem (text-heavy, no card wrapper) */}
          <div className="space-y-8">
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
              The Challenge
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              {valuePropositionContent.problemTitle}
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              {valuePropositionContent.problemPoints.map((point, index) => (
                <p key={index}>{point}</p>
              ))}
            </div>
          </div>

          {/* Right: The Solution (single prominent card with glow) */}
          <Card className="p-10 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 border-2 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-accent/5 blur-3xl" />

            <CardContent className="space-y-6 p-0 relative">
              <Badge className="bg-accent text-accent-foreground">
                {valuePropositionContent.solutionBadge}
              </Badge>
              <h3 className="text-3xl font-bold">
                {valuePropositionContent.solutionTitle}
              </h3>
              <ul className="space-y-4">
                {valuePropositionContent.solutionFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/sign-in">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
