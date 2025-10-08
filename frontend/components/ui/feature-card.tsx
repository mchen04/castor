import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  iconColor?: "primary" | "accent" | "secondary" | "warning"
  className?: string
}

const iconColorClasses = {
  primary: "bg-primary/20 text-primary",
  accent: "bg-accent/20 text-accent",
  secondary: "bg-secondary/20 text-secondary-foreground",
  warning: "bg-warning/20 text-warning",
}

export function FeatureCard({ icon: Icon, title, description, iconColor = "primary", className }: FeatureCardProps) {
  return (
    <Card className={cn("p-8 bg-card border shadow-lg hover:shadow-xl hover:scale-105 transition-all", className)}>
      <CardContent className="space-y-5 p-0">
        <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center", iconColorClasses[iconColor])}>
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
