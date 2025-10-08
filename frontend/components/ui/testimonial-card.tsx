import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  rating?: number
}

export function TestimonialCard({ quote, author, rating = 5 }: TestimonialCardProps) {
  return (
    <Card className="p-8 bg-card border shadow-lg hover:shadow-xl transition-all">
      <CardContent className="space-y-5">
        <div className="flex items-center gap-1">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-accent text-accent" />
          ))}
        </div>
        <p className="text-base leading-relaxed">{quote}</p>
        <div className="text-sm text-muted-foreground font-medium">— {author}</div>
      </CardContent>
    </Card>
  )
}
