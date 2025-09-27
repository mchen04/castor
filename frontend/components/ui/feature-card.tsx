import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  iconColor?: "primary" | "accent" | "chart-3" | "chart-4"
  className?: string
}

const iconColorClasses = {
  primary: "bg-primary/20 text-primary",
  accent: "bg-accent/20 text-accent",
  "chart-3": "bg-chart-3/20 text-chart-3",
  "chart-4": "bg-chart-4/20 text-chart-4",
}

export function FeatureCard({ icon: Icon, title, description, iconColor = "primary", className }: FeatureCardProps) {
  return (
    <Card className={cn("p-6 hover:bg-card/80 transition-colors", className)}>
      <CardContent className="space-y-4 p-0">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColorClasses[iconColor])}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
