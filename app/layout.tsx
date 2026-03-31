import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sol & Måne – Senter for selvutvikling',
  description: 'Yoga, mindfulness, drømmetydning, tarot og astrologi i Vikersund.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  )
}