"use client"

import type React from "react"
import { DragDropProvider } from "@/contexts/drag-drop-context"
import { ThemeProvider } from "@/contexts/theme-context"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <DragDropProvider onDropActivity={() => { }}>
        {children}
      </DragDropProvider>
    </ThemeProvider>
  )
}