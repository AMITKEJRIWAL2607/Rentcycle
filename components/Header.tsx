'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Rentcycle
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/items"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Browse Items
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>
            {status === 'authenticated' ? (
              <div className="flex items-center gap-4">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

