"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceFeature {
  text: string
}

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  price: string
  priceSubtext: string
  features: ServiceFeature[]
  buttonText: string
  buttonVariant?: "default" | "outline"
  badge?: string
  description?: string
  onButtonClick?: () => void
  buttonHref?: string
  variant?: "accent" | "primary"
}

const variantStyles = {
  accent: {
    card: "border-accent/50 bg-accent/5",
    icon: "bg-accent/20 text-accent",
    price: "text-accent",
    checkIcon: "text-accent",
    badge: "bg-accent text-accent-foreground",
    button: "bg-accent hover:bg-accent/90 text-accent-foreground",
    buttonOutline: "border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent",
  },
  primary: {
    card: "border-primary/50 bg-primary/5",
    icon: "bg-primary/20 text-primary",
    price: "text-primary",
    checkIcon: "text-primary",
    badge: "bg-primary text-primary-foreground",
    button: "bg-primary hover:bg-primary/90 text-primary-foreground",
    buttonOutline: "border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent",
  },
}

export function ServiceCard({
  icon: Icon,
  title,
  price,
  priceSubtext,
  features,
  buttonText,
  buttonVariant = "default",
  badge,
  description,
  onButtonClick,
  buttonHref,
  variant = "accent",
}: ServiceCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn("p-8 relative h-full", styles.card)}>
      {badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className={cn("px-4 py-1", styles.badge)}>{badge}</Badge>
        </div>
      )}
      <CardContent className="space-y-6 p-0 flex flex-col h-full">
        <div className="text-center space-y-2">
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto", styles.icon)}>
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="min-h-[7rem] flex flex-col justify-center">
            <div className={cn("text-4xl font-bold", styles.price)}>{price}</div>
            <div className="text-muted-foreground">{priceSubtext}</div>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className={cn("h-5 w-5", styles.checkIcon)} />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <Button
            asChild={!!buttonHref}
            size="lg"
            variant={buttonVariant}
            className={cn(
              "w-full font-semibold py-6 text-base px-4",
              buttonVariant === "default" ? styles.button : styles.buttonOutline,
            )}
            onClick={onButtonClick}
          >
            {buttonHref ? (
              <Link href={buttonHref}>
                {buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <>
                {buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {description && <p className="text-sm text-muted-foreground text-center">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
