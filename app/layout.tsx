"use client"

import type React from "react"
import { DragDropProvider } from "@/contexts/drag-drop-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { Suspense } from "react"
import "./globals.css"
import { Metadata } from "next"

export const metdata: Metadata = {
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
          <ThemeProvider>
            <DragDropProvider onDropActivity={() => { }}>
              {children}
            </DragDropProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
