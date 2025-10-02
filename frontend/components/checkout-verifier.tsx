'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function CheckoutVerifier() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sessionId) return

    const verifyCheckout = async () => {
      setStatus('verifying')
      setMessage('Activating your subscription...')

      try {
        const response = await fetch('/api/verify-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setStatus('success')
          setMessage('Subscription activated successfully!')

          // Remove session_id from URL and reload to fetch updated user data
          setTimeout(() => {
            router.replace('/dashboard')
            router.refresh()
          }, 1500)
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to activate subscription. Please refresh the page.')
        }
      } catch (error) {
        console.error('Checkout verification error:', error)
        setStatus('error')
        setMessage('An error occurred. Please refresh the page.')
      }
    }

    verifyCheckout()
  }, [sessionId, router])

  if (!sessionId || status === 'idle') {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-lg font-semibold">{message}</h3>
              <p className="text-sm text-muted-foreground">
                This will only take a moment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h3 className="text-lg font-semibold text-green-500">{message}</h3>
              <p className="text-sm text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <h3 className="text-lg font-semibold text-red-500">Verification Failed</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
              <button
                onClick={() => router.refresh()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh Page
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
