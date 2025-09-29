"use client"

import Link from "next/link"
import { Bot } from "lucide-react"

interface BrandProps {
  className?: string
}

export function Brand({ className = "" }: BrandProps) {
  return (
    <Link 
      href="/" 
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Bot className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-bold text-xl">Castor</span>
    </Link>
  )
}