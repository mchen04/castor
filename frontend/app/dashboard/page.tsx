import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PaywallCard } from '@/components/paywall-card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('has_paid')
    .eq('id', user.id)
    .single()

  if (!userData?.has_paid) {
    return <PaywallCard />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">GEO Expert Chatbot</h1>
          <form action="/api/auth/logout" method="POST">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your GEO Consultant</CardTitle>
            <CardDescription>Ask anything about Generative Engine Optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">
                Dify chatbot will be embedded here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}