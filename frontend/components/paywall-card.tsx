'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Unlock GEO Expert Chatbot</CardTitle>
          <CardDescription>
            Get access to our AI-powered GEO consultant for just $59.99/month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ 24/7 GEO strategy consultation</li>
            <li>✓ Content optimization guidance</li>
            <li>✓ AI citation techniques</li>
            <li>✓ Cancel anytime</li>
          </ul>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90"
          >
            {isLoading ? 'Loading...' : 'Purchase Access - $59.99/month'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}