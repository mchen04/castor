'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brand } from '@/components/ui/brand'
import { CheckCircle } from 'lucide-react'

export function PaywallCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
      {/* Header with Brand Navigation */}
      <div className="p-6">
        <Brand />
      </div>

      {/* Centered Paywall Card */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="max-w-md w-full space-y-6">
          <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-2xl p-8 md:p-10">
            <CardHeader className="text-center space-y-4 pb-8">
              <Badge variant="secondary" className="text-sm font-medium mx-auto">
                Premium GEO Access
              </Badge>
              <CardTitle className="text-2xl md:text-3xl font-bold">Unlock GEO Expert Chatbot</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Get access to our AI-powered GEO consultant for just{' '}
                <span className="text-accent font-semibold">$59.99/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                size="lg"
              >
                {isLoading ? 'Loading...' : 'Purchase Access - $59.99/month'}
              </Button>
            </CardContent>
          </Card>

          {/* Feature Callout */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>24/7 GEO strategy consultation</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Content optimization guidance</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>AI citation techniques</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}