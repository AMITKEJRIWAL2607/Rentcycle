import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rentcycle - Peer-to-Peer Rental Marketplace',
  description: 'Rent and lend items in your community with Rentcycle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <Providers>
            <div className="bg-yellow-50 border-b border-yellow-200">
              <div className="container mx-auto px-4 py-2">
                <p className="text-sm text-yellow-800 text-center">
                  <span className="font-semibold">Demo Mode:</span> You can browse and test all features without logging in. Changes will be saved to a demo account.
                </p>
              </div>
            </div>
            <Header />
            {children}
          </Providers>
        </body>
      </html>
  )
}

