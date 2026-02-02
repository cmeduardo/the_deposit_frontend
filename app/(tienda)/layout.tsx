import React from "react"
import type { Metadata } from 'next'
import { StoreHeader } from '@/components/store/store-header'
import { StoreFooter } from '@/components/store/store-footer'

export const metadata: Metadata = {
  title: {
    default: 'Tienda',
    template: '%s | The Deposit',
  },
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  )
}
