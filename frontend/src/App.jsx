import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'

export default function App() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh' }}>
      <Navbar dark={dark} onToggleDark={() => setDark(d => !d)} />
      <Home />
    </div>
  )
}
