import type React from "react"
interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  background?: "default" | "card"
}

export function Section({ children, className = "", id, background = "default" }: SectionProps) {
  const bgClass = background === "card" ? "bg-card/30" : ""

  return (
    <section id={id} className={`pt-12 pb-24 ${bgClass} ${className}`}>
      <div className="container mx-auto px-4 overflow-hidden">{children}</div>
    </section>
  )
}
