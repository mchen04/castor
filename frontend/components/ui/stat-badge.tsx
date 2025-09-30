import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatBadgeProps {
  label: string
  value: string | number
  icon?: LucideIcon
  variant?: "default" | "accent" | "primary"
  className?: string
}

export function StatBadge({ label, value, icon: Icon, variant = "default", className }: StatBadgeProps) {
  const variantStyles = {
    default: "bg-card/50 backdrop-blur border-primary/20",
    accent: "bg-accent text-accent-foreground",
    primary: "bg-primary text-primary-foreground",
  }

  // For colored variants, don't override text color. For default, use muted for label.
  const labelColorClass = variant === "default" ? "text-muted-foreground" : "opacity-90"

  return (
    <Badge variant="secondary" className={cn("text-sm font-medium px-4 py-2", variantStyles[variant], className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="font-semibold">{value}</span>
        <span className={labelColorClass}>{label}</span>
      </div>
    </Badge>
  )
}