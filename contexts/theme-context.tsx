"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { themes } from "@/data/themes"
import type { Theme } from "@/types/activity"

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (themeId: "chill" | "adventure" | "social") => void
  isTransitioning: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0])
  const [isTransitioning, setIsTransitioning] = useState(false)

  const setTheme = (themeId: "chill" | "adventure" | "social") => {
    const newTheme = themes.find((t) => t.id === themeId)
    if (newTheme && newTheme.id !== currentTheme.id) {
      setIsTransitioning(true)

      const root = document.documentElement
      Object.entries(newTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value)
      })

      setTimeout(() => {
        setCurrentTheme(newTheme)
        setIsTransitioning(false)
      }, 300)
    }
  }

  useEffect(() => {
    const root = document.documentElement
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })
  }, [currentTheme])

  return <ThemeContext.Provider value={{ currentTheme, setTheme, isTransitioning }}>{children}</ThemeContext.Provider>
}
