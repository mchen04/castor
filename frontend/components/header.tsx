"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bot, Menu } from "lucide-react"

export function Header() {
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
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-lg font-medium hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button asChild variant="outline" className="mt-4 bg-transparent">
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        <Button asChild variant="outline" size="sm" className="hidden md:flex bg-transparent">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  )
}
