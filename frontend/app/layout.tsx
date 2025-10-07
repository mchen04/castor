import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
