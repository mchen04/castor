import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Castor - Expert GEO Consultation & AI Search Optimization',
  description: 'Get expert Generative Engine Optimization (GEO) consultation to dominate AI search results. Optimize your content for ChatGPT, Perplexity, and Google AI Overviews. Monthly subscription starting at $59.99/month.',
  keywords: ['GEO', 'Generative Engine Optimization', 'AI Search', 'ChatGPT SEO', 'Perplexity', 'AI Citations', 'Search Optimization'],
  authors: [{ name: 'Castor' }],
  openGraph: {
    type: 'website',
    title: 'Castor - Expert GEO Consultation',
    description: 'Optimize your content for AI search engines. Get cited by ChatGPT, Perplexity & Google AI.',
    siteName: 'Castor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Castor - Expert GEO Consultation',
    description: 'Optimize your content for AI search engines. Get cited by ChatGPT, Perplexity & Google AI.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#7b79ff',
          colorBackground: '#1d1d20',
          colorInputBackground: '#2a2a2f',
          colorInputText: '#fafafa',
          colorText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          colorDanger: '#ef4444',
          borderRadius: '0.75rem',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontFamilyButtons: 'var(--font-geist-sans), sans-serif',
        },
        elements: {
          rootBox: 'w-full max-w-md',
          card: 'bg-[#1d1d20]/50 backdrop-blur-lg border border-[#7b79ff]/20 shadow-2xl rounded-xl',
          headerTitle: 'text-[#fafafa] font-bold text-2xl',
          headerSubtitle: 'text-[#a1a1aa]',
          socialButtonsBlockButton:
            'bg-[#2a2a2f] border border-[#3a3a3f] text-[#f5f5f5] hover:bg-[#2a2a2f]/80',
          socialButtonsBlockButtonText: 'font-medium',
          formButtonPrimary:
            'bg-[#ffd93d] hover:bg-[#ffd93d]/90 text-[#1f1f22] font-semibold normal-case',
          formFieldInput:
            'bg-[#2a2a2f] border border-[#3a3a3f] text-[#fafafa] focus:border-[#7b79ff] focus:ring-[#7b79ff]',
          formFieldLabel: 'text-[#fafafa] font-medium',
          footerActionLink: 'text-[#7b79ff] hover:text-[#7b79ff]/80',
          dividerLine: 'bg-[#3a3a3f]',
          dividerText: 'text-[#a1a1aa]',
        },
      }}
    >
      <html lang="en">
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
