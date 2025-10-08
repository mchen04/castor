import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { StatBadge } from "@/components/ui/stat-badge"
import { Section } from "@/components/ui/section"
import { heroContent, visibilityMetrics } from "@/lib/content/landing-page-content"

export function HeroSection() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="relative max-w-4xl mx-auto text-center space-y-10 py-20 lg:py-32">
        <Badge variant="secondary" className="text-sm font-medium">
          {heroContent.badge}
        </Badge>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
          Expert GEO Consulting, Without the{" "}
          <span className="text-primary">$6,000/Month</span> Price Tag
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
          {heroContent.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full pt-4">
          <div className="w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 sm:px-10 py-7 text-base sm:text-lg whitespace-normal sm:whitespace-nowrap w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
            >
              <Link href={heroContent.primaryCTA.href}>
                {heroContent.primaryCTA.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="px-6 sm:px-10 py-7 text-base sm:text-lg bg-card border-2 hover:bg-muted/50 whitespace-normal sm:whitespace-nowrap w-full sm:w-auto transition-all" asChild>
              <a href={heroContent.secondaryCTA.href}>{heroContent.secondaryCTA.text}</a>
            </Button>
          </div>
        </div>

        {/* Research Counter Badge */}
        <div className="pt-4">
          <StatBadge
            label={heroContent.researchCounter.label}
            value={heroContent.researchCounter.value}
            variant="accent"
            className="inline-flex"
          />
          {heroContent.researchCounter.updatedText && (
            <p className="text-xs text-muted-foreground mt-2">{heroContent.researchCounter.updatedText}</p>
          )}
        </div>

        {/* AI Visibility Metrics Chart */}
        <div className="pt-12">
          <div className="relative w-full max-w-2xl mx-auto">
            <Card className="bg-card border shadow-xl">
              <CardContent className="p-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">AI Search Visibility</h3>
                  <Badge className="bg-primary text-primary-foreground">+150%</Badge>
                </div>
                <div className="space-y-3">
                  {visibilityMetrics.map((metric, index) => {
                    const Icon = metric.icon
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm">{metric.label}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className={`${metric.colorClass} h-2 rounded-full`} style={{ width: `${metric.progress}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  )
}