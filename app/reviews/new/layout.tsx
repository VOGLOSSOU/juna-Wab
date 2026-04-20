import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Laisser un avis' }
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
