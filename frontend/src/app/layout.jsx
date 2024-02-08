import { Inter } from 'next/font/google'
import './style/globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ERP',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn("bg-[#e6ecf4] custom-scrollbar", inter.className)}>{children}</body>
    </html>
  )
}
