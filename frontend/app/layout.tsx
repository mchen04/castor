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
        variables: {
          colorPrimary: '#7b79ff', // Purple primary
          colorBackground: '#1d1d20', // Card background
          colorInputBackground: '#2a2a2f', // Input background
          colorInputText: '#fafafa', // Input text
          colorText: '#fafafa', // General text
          colorTextSecondary: '#a1a1aa', // Muted text
          colorDanger: '#ef4444', // Error red
          borderRadius: '0.75rem', // Match --radius
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontFamilyButtons: 'var(--font-geist-sans), sans-serif',
        },
        elements: {
          card: 'bg-card/50 backdrop-blur border-primary/20 shadow-2xl',
          headerTitle: 'text-foreground font-bold',
          headerSubtitle: 'text-muted-foreground',
          formButtonPrimary:
            'bg-accent hover:bg-accent/90 text-accent-foreground font-semibold normal-case shadow-sm',
          formFieldInput:
            'bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary',
          formFieldLabel: 'text-foreground font-medium',
          footerActionLink: 'text-primary hover:text-primary/80 font-medium',
          identityPreviewText: 'text-foreground',
          identityPreviewEditButton: 'text-primary hover:text-primary/80',
          socialButtonsBlockButton:
            'border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground normal-case',
          socialButtonsBlockButtonText: 'text-secondary-foreground font-medium',
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground',
          formFieldSuccessText: 'text-chart-5',
          formFieldErrorText: 'text-destructive',
          otpCodeFieldInput:
            'border-border bg-input text-foreground focus:border-primary focus:ring-primary',
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
