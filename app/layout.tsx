import './globals.css'

export const metadata = {
  title: 'ImmoCRM – Frenken Immobilien',
  description: 'Immobilienverwaltung CRM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
