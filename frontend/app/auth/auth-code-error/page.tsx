import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sorry, we couldn't verify your authentication. Please try logging in again.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Return to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}