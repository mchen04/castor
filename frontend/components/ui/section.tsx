import type React from "react"

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  background?: "default" | "card" | "muted" | "gradient" | "gradient-cta"
  spacing?: "default" | "large" | "hero"
}

export function Section({
  children,
  className = "",
  id,
  background = "default",
  spacing = "default",
}: SectionProps) {
  const bgClasses: Record<typeof background, string> = {
    default: "",
    card: "bg-card/30",
    muted: "bg-muted/30",
    gradient: "gradient-hero-stripe",
    "gradient-cta": "gradient-cta-stripe",
  }

  const spacingClasses: Record<typeof spacing, string> = {
    default: "py-24",
    large: "py-32",
    hero: "py-32 lg:py-40",
  }

  return (
    <section
      id={id}
      className={`${spacingClasses[spacing]} ${bgClasses[background]} ${className}`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">{children}</div>
    </section>
  )
}
