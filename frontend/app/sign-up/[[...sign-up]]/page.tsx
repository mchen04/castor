import { SignUp } from '@clerk/nextjs'
import { Brand } from '@/components/ui/brand'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
      {/* Header with Brand Navigation */}
      <div className="p-6">
        <Brand />
      </div>

      {/* Centered Sign Up */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <SignUp />
      </div>
    </div>
  )
}
