import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-radar.app'),
  title: {
    default: 'AI Radar — Real-Time AI Intelligence Dashboard',
    template: '%s | AI Radar',
  },
  description: 'Track everything happening in AI: latest news, tools, trends, business opportunities, prompts, and more. Your real-time AI intelligence hub for monitoring the AI industry.',
  keywords: [
    'AI news', 'AI tools', 'AI trends', 'artificial intelligence', 'machine learning',
    'LLM', 'ChatGPT', 'Claude', 'GPT-5', 'AI business', 'AI agents', 'automation',
    'AI dashboard', 'AI industry tracker', 'AI monitoring', 'AI intelligence',
  ],
  authors: [{ name: 'AI Radar Team' }],
  creator: 'AI Radar',
  publisher: 'AI Radar',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-radar.app',
    siteName: 'AI Radar',
    title: 'AI Radar — Real-Time AI Intelligence Dashboard',
    description: 'Track everything happening in AI: latest news, tools, trends, business opportunities, and prompts. Your real-time AI intelligence hub.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Radar - Real-Time AI Intelligence Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Radar — Real-Time AI Intelligence Dashboard',
    description: 'Track everything happening in AI: latest news, tools, trends, and business opportunities. Your real-time AI intelligence hub.',
    images: ['/og-image.png'],
    creator: '@airadar',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://ai-radar.app',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#050810" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-[hsl(220,20%,6%)] text-white antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-cyan-500 focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
