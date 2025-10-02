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
          rootBox: {
            width: '100%',
            maxWidth: '28rem',
          },
          card: {
            backgroundColor: 'rgba(29, 29, 32, 0.5)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(123, 121, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            borderRadius: '0.75rem',
          },
          headerTitle: {
            color: '#fafafa',
            fontWeight: '700',
            fontSize: '1.5rem',
          },
          headerSubtitle: {
            color: '#a1a1aa',
          },
          socialButtonsBlockButton: {
            backgroundColor: '#2a2a2f',
            border: '1px solid #3a3a3f',
            color: '#f5f5f5',
            '&:hover': {
              backgroundColor: 'rgba(42, 42, 47, 0.8)',
            },
          },
          socialButtonsBlockButtonText: {
            fontWeight: '500',
          },
          formButtonPrimary: {
            backgroundColor: '#ffd93d',
            color: '#1f1f22',
            fontWeight: '600',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 217, 61, 0.9)',
            },
          },
          formFieldInput: {
            backgroundColor: '#2a2a2f',
            border: '1px solid #3a3a3f',
            color: '#fafafa',
            '&:focus': {
              borderColor: '#7b79ff',
              boxShadow: '0 0 0 1px #7b79ff',
            },
            '&::placeholder': {
              color: '#a1a1aa',
            },
          },
          formFieldLabel: {
            color: '#fafafa',
            fontWeight: '500',
          },
          footerActionLink: {
            color: '#7b79ff',
            '&:hover': {
              color: 'rgba(123, 121, 255, 0.8)',
            },
          },
          dividerLine: {
            backgroundColor: '#3a3a3f',
          },
          dividerText: {
            color: '#a1a1aa',
          },
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
