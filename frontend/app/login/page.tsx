'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brand } from '@/components/ui/brand'
import { ChevronLeft, Lock, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
      {/* Header with Brand Navigation */}
      <div className="p-6 flex items-center justify-between">
        <Brand />
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Centered Login Card */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="max-w-md w-full space-y-6">
          <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-2xl p-10">
            <CardHeader className="text-center space-y-4 pb-8">
              <Badge variant="secondary" className="text-sm font-medium mx-auto">
                Research-Backed GEO Expertise
              </Badge>
              <CardTitle className="text-3xl md:text-4xl font-bold">Get Started with Expert GEO Consulting</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                One click to access <span className="text-primary font-semibold">$6,000/month</span> expertise for{' '}
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
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                size="lg"
              >
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure authentication via Google OAuth</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Callout */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>Trained on 200+ research papers</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-accent" />
              <span>24/7 access to expert GEO advice</span>
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