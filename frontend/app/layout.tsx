import './globals.css'

export const metadata = {
  title: 'ICT Infrastructure Automation',
  description: 'Comprehensive ICT infrastructure management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </div>
      </body>
    </html>
  )
}
