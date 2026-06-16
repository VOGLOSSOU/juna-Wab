import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Mes commandes' }
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
