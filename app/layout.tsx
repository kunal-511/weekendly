import type React from "react"
import { Suspense } from "react"
import { Providers } from "@/contexts/providers"
import "./globals.css"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Weekendly - Design Your Perfect Weekend",
  description: "Design Your Perfect Weekend getaway with Weekendly. Discover activities, create plans and smart discoveries.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <Providers>
            {children}
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
