import './globals.css'

export const metadata = {
  title: 'Data to Presentation - AI Powered',
  description: 'Transform your data into stunning presentations with AI',
  icons: {
    icon: '/favicon.svg',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}