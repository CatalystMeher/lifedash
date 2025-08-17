import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const themes = {
  light: {
    name: 'Light',
    description: 'Clean and bright',
    key: 'light'
  },
  dark: {
    name: 'Dark',
    description: 'Classic dark mode',
    key: 'dark'
  },
  blue: {
    name: 'Ocean Blue',
    description: 'Deep blue dark theme',
    key: 'blue'
  },
  github: {
    name: 'GitHub Dark',
    description: 'GitHub-inspired dark theme',
    key: 'github'
  },
  dracula: {
    name: 'Dracula',
    description: 'Vibrant dark theme',
    key: 'dracula'
  },
  monokai: {
    name: 'Monokai',
    description: 'Classic dark theme',
    key: 'monokai'
  },
  solarized: {
    name: 'Solarized Dark',
    description: 'Easy on the eyes',
    key: 'solarized'
  }
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('dark') // Default to dark

  useEffect(() => {
    // Load saved theme from localStorage, default to 'dark' if none exists
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setCurrentTheme(savedTheme)
    
    // Apply the theme immediately on mount
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-github', 'theme-dracula', 'theme-monokai', 'theme-solarized')
    
    // Add the current theme class
    root.classList.add(`theme-${savedTheme}`)
  }, [])

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName)
    localStorage.setItem('theme', themeName)
    
    // Apply theme to document
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-github', 'theme-dracula', 'theme-monokai', 'theme-solarized')
    
    // Add the new theme class
    root.classList.add(`theme-${themeName}`)
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
