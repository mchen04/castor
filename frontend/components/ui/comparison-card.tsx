import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ComparisonCardProps {
  icon: LucideIcon
  title: string
  bulletPoints: string[]
  bottomStat: string
  highlighted?: boolean
  variant?: "default" | "accent" | "primary"
}

export function ComparisonCard({
  icon: Icon,
  title,
  bulletPoints,
  bottomStat,
  highlighted = false,
  variant = "default",
}: ComparisonCardProps) {
  const variantStyles = {
    default: {
      card: "bg-card border shadow-lg hover:shadow-xl",
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
      title: "",
      stat: "",
    },
    accent: {
      card: "bg-card border-2 border-accent/20 shadow-xl hover:shadow-2xl",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      title: "text-accent",
      stat: "text-accent font-semibold",
    },
    primary: {
      card: "bg-card border-2 border-primary/20 shadow-xl hover:shadow-2xl",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      title: "text-primary",
      stat: "text-primary font-semibold",
    },
  }

  const styles = variantStyles[variant]

  return (
    <Card
      className={cn(
        "text-center p-10 h-full flex flex-col transition-all",
        styles.card,
        highlighted && "ring-2 ring-accent ring-offset-2"
      )}
    >
      <CardContent className="space-y-4 p-0 flex flex-col h-full">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-8 w-8", styles.iconColor)} />
        </div>

        <h3 className={cn("text-xl font-semibold", styles.title)}>{title}</h3>

        <ul className="text-left space-y-2 text-sm text-muted-foreground flex-1">
          {bulletPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t border-border mt-auto">
          <p className={cn("text-sm font-medium", styles.stat)}>{bottomStat}</p>
        </div>
      </CardContent>
    </Card>
  )
}