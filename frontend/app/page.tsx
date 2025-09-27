"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Section } from "@/components/ui/section"
import { SectionHeader } from "@/components/ui/section-header"
import { FeatureCard } from "@/components/ui/feature-card"
import { ServiceCard } from "@/components/ui/service-card"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import { ArrowRight, Bot, Search, Target, Zap, TrendingUp, Users, Globe, MessageCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function GEOLandingPage() {
  const chatbotFeatures = [
    { text: "Lifetime chatbot access" },
    { text: "24/7 GEO strategy consultation" },
    { text: "Content optimization guidance" },
    { text: "AI citation techniques" },
  ]

  const consultingFeatures = [
    { text: "1-on-1 expert consultation" },
    { text: "Custom GEO strategy development" },
    { text: "Implementation support" },
    { text: "Ongoing optimization" },
  ]

  const testimonials = [
    {
      quote:
        "Finally, a solution that actually works for AI search. Our ChatGPT mentions increased 300% in just 2 weeks.",
      author: "Sarah Chen, Marketing Director",
    },
    {
      quote: "The GEO strategies are game-changing. We're now the go-to source for AI platforms in our industry.",
      author: "Mike Rodriguez, SEO Specialist",
    },
    {
      quote: "Best $59.99 I've ever spent. The chatbot gives better advice than most consultants.",
      author: "Lisa Park, Business Owner",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-4xl mx-auto text-center space-y-8 py-12 lg:py-20">
          <Badge variant="secondary" className="text-sm font-medium">
            Join 1,000+ businesses optimizing for AI visibility
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            Is Your Business <span className="text-primary">Invisible</span> to AI Search?
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
            300M+ people use ChatGPT weekly. If AI doesn't mention your brand, you don't exist. Get expert GEO
            consultation starting at <span className="text-accent font-semibold">$59.99</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg"
            >
              Get Expert GEO Consultation - $59.99
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
              Learn Why GEO Matters
            </Button>
          </div>

          <div className="pt-8">
            <div className="relative w-full max-w-2xl mx-auto">
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">AI Search Visibility</h3>
                    <Badge className="bg-primary text-primary-foreground">+150%</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Bot className="h-5 w-5 text-primary" />
                      <span className="text-sm">ChatGPT Citations</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-3/4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Search className="h-5 w-5 text-accent" />
                      <span className="text-sm">Perplexity Mentions</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full w-4/5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-chart-3" />
                      <span className="text-sm">Google AI Overviews</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-chart-3 h-2 rounded-full w-2/3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Section>

      {/* Problem Section */}
      <Section id="problem" background="card">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="The Search Landscape Has Changed Forever"
            subtitle="Traditional SEO is dead. AI search is the new reality."
          />

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-muted-foreground/20 bg-muted/10 border-2">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Traditional SEO</h3>
                <p className="text-muted-foreground">10 blue links</p>
                <p className="text-sm text-muted-foreground">Users click through multiple results</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-primary/50 bg-primary/5 border-2">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary">AI Search</h3>
                <p className="text-primary">1 synthesized answer</p>
                <p className="text-sm text-muted-foreground">AI provides the complete answer</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-accent/50 bg-accent/5 border-2">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-accent">Your Challenge</h3>
                <p className="text-accent">Be THE cited source</p>
                <p className="text-sm text-muted-foreground">Get mentioned in AI responses</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center space-y-4">
            <div className="flex justify-center gap-8 text-2xl font-bold">
              <div className="text-accent">50%+ of searches answered by AI in 2025</div>
              <div className="text-primary">ChatGPT gets 1B+ queries daily</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Solution Section */}
      <Section id="solution">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="What is GEO?"
            subtitle="Generative Engine Optimization (GEO) is the practice of optimizing your content to appear in AI-generated responses. It's the evolution of SEO for the AI age."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Bot}
              title="Get cited by ChatGPT & Perplexity"
              description="Become the authoritative source AI platforms reference"
              iconColor="primary"
            />
            <FeatureCard
              icon={Zap}
              title="Optimize content for AI platforms"
              description="Structure your content for maximum AI visibility"
              iconColor="accent"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Build authority signals AI trusts"
              description="Establish credibility markers that AI systems recognize"
              iconColor="chart-3"
            />
            <FeatureCard
              icon={Users}
              title="24/7 expert consultation access"
              description="Get instant answers from our GEO expert chatbot"
              iconColor="chart-4"
            />
          </div>
        </div>
      </Section>

      {/* Services Section */}
      <Section id="services" background="card">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Choose Your GEO Solution"
            subtitle="Two ways to get expert GEO guidance for your business"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ServiceCard
              icon={Bot}
              title="GEO Expert Chatbot"
              price="$59.99"
              priceSubtext="One-Time Payment"
              features={chatbotFeatures}
              buttonText="Get Instant Access"
              badge="Most Popular"
              description="No subscription. Pay once, access forever."
              variant="accent"
            />

            <ServiceCard
              icon={MessageCircle}
              title="Traditional GEO Consulting"
              price="Custom Pricing"
              priceSubtext="Personalized Service"
              features={consultingFeatures}
              buttonText="Contact Us"
              buttonVariant="outline"
              description="Tailored solutions for enterprise needs."
              variant="primary"
            />
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-accent-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold">Pay once ($59.99)</h3>
              <p className="text-muted-foreground">One-time payment for lifetime access to our GEO expert chatbot</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold">Chat with GEO expert AI</h3>
              <p className="text-muted-foreground">Get personalized strategies and optimization recommendations</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-chart-3 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-background">
                3
              </div>
              <h3 className="text-xl font-semibold">Implement strategies immediately</h3>
              <p className="text-muted-foreground">Start optimizing your content for AI search platforms today</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Social Proof */}
      <Section id="testimonials" background="card">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Trusted by Marketing Professionals"
            subtitle="Join hundreds of businesses already optimizing for AI search"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} quote={testimonial.quote} author={testimonial.author} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold">ChatGPT</div>
            <div className="text-2xl font-bold">Perplexity</div>
            <div className="text-2xl font-bold">Google</div>
            <div className="text-2xl font-bold">Gemini</div>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-balance">{"Don't Let AI Search Leave You Behind"}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            While your competitors struggle with outdated SEO tactics, you can dominate AI search results. Start your
            GEO journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-12 py-6 text-xl"
            >
              Start with Chatbot - $59.99
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-12 py-6 text-xl bg-transparent"
            >
              Get Custom Consulting
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">30-day money-back guarantee. Join 1,000+ satisfied customers.</p>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
