import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ravi Poruri - AI-Driven Technology Leader & Entrepreneur',
  description: '25+ year technology executive, AI entrepreneur, and founder. Expert in scaling data platforms, leading global teams, and building AI-powered applications.',
  keywords: 'AI entrepreneur, technology leader, data platforms, machine learning, startup founder, enterprise architecture, Ravi Poruri',
  authors: [{ name: 'Ravi Poruri', url: 'https://raviporuri.com' }],
  creator: 'Ravi Poruri',
  publisher: 'Ravi Poruri',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://raviporuri.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://raviporuri.com',
    siteName: 'Ravi Poruri - AI Technology Leader',
    title: 'Ravi Poruri - AI-Driven Technology Leader & Entrepreneur',
    description: 'From database administration to AI entrepreneurship: 25+ years of technology leadership, IPO experience, and innovation in AI-powered applications.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ravi Poruri - AI Technology Leader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ravi Poruri - AI Entrepreneur & Technology Leader',
    description: 'Building next-generation AI applications. Former Senior Director at Cisco, Global Head at Dropbox.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ravi Poruri AI" />
        <meta name="application-name" content="Ravi Poruri AI" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'text-sm',
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </Providers>

        {/* Analytics Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Vercel Analytics
              window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

              // Privacy-focused analytics
              if (localStorage.getItem('analytics-consent') === 'true') {
                window.va('track', 'pageview');
              }
            `,
          }}
        />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}