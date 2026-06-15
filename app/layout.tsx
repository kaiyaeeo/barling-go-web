import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import ChatbotWidget from "@/components/ai/ChatbotWidget"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Barling-GO",
  description: "Jelajahi Barlingmascakep",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-jakarta antialiased bg-white text-gray-900">
        
        {children}
        
        <ChatbotWidget />
      </body>
    </html>
  )
}