"use client"

import Link from "next/link"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { UserMenu, UserMenuItem } from "@/components/user-menu"
import { HeaderAuthSkeleton } from "@/components/header-auth-skeleton"
import { Bot, Menu, LayoutDashboard, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navItems = [
    { id: "problem", label: "Why GEO?" },
    { id: "solution", label: "How It Works" },
    { id: "services", label: "Services" },
    { id: "testimonials", label: "Testimonials" },
  ]

  const userMenuItems: UserMenuItem[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      onClick: () => router.push('/dashboard'),
    },
    {
      label: "Sign Out",
      icon: LogOut,
      onClick: () => signOut({ redirectUrl: '/' }),
      variant: 'destructive' as const,
      separator: true,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">Castor</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl">Castor</span>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-6 mt-8 flex-1 px-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-xl font-medium hover:text-primary transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Auth Section */}
            <SheetFooter className="mt-auto">
              {isLoaded && (
                <>
                  {user ? (
                    <div className="w-full flex flex-col gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full bg-transparent justify-start"
                        onClick={() => router.push('/dashboard')}
                      >
                        <LayoutDashboard className="mr-2 h-5 w-5" />
                        Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full bg-transparent justify-start text-red-600 border-red-600/50 hover:bg-red-600/10"
                        onClick={() => signOut({ redirectUrl: '/' })}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
                      <Link href="/sign-in">Login</Link>
                    </Button>
                  )}
                </>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center min-w-[80px] justify-end">
          {!isLoaded ? (
            <HeaderAuthSkeleton />
          ) : user ? (
            <UserMenu menuItems={userMenuItems} position="header" align="end" />
          ) : (
            <Button asChild variant="outline" size="sm" className="bg-transparent">
              <Link href="/sign-in">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
