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
  purple: {
    name: 'Royal Purple',
    description: 'Elegant purple dark theme',
    key: 'purple'
  },
  warm: {
    name: 'Warm Sunset',
    description: 'Cozy orange light theme',
    key: 'warm'
  }
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setCurrentTheme(savedTheme)
  }, [])

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName)
    localStorage.setItem('theme', themeName)
    
    // Apply theme to document
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-purple', 'theme-warm')
    
    // Add the new theme class
    root.classList.add(`theme-${themeName}`)
  }

  useEffect(() => {
    changeTheme(currentTheme)
  }, [currentTheme])

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
