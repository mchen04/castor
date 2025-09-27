import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  rating?: number
}

export function TestimonialCard({ quote, author, rating = 5 }: TestimonialCardProps) {
  return (
    <Card className="p-6">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-accent text-accent" />
          ))}
        </div>
        <p className="text-sm">{quote}</p>
        <div className="text-sm text-muted-foreground">— {author}</div>
      </CardContent>
    </Card>
  )
}
