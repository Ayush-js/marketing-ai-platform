import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ContentStudio from './pages/ContentStudio'
import CampaignPlanner from './pages/CampaignPlanner'
import Dashboard from './pages/Dashboard'
import ChatHistory from './pages/ChatHistory'
import ParticleBackground from './components/ParticleBackground'
import './App.css'

function getDirection(from, to) {
  if (from === '/' && to === '/studio') return -1
  if (from === '/studio' && (to === '/planner' || to === '/history')) return 1

  const order = ['/', '/studio', '/planner', '/dashboard', '/history']
  const fromIndex = order.indexOf(from)
  const toIndex = order.indexOf(to)
  if (fromIndex === -1 || toIndex === -1) return -1
  return toIndex > fromIndex ? -1 : 1
}

function AnimatedRoutes() {
  const location = useLocation()
  const previousPath = useRef(location.pathname)
  const [direction, setDirection] = useState(-1)

  useEffect(() => {
    const nextDirection = getDirection(previousPath.current, location.pathname)
    setDirection(nextDirection)
    previousPath.current = location.pathname
  }, [location.pathname])

  const transitionVariants = useMemo(() => ({
    initial: (customDirection) => ({
      opacity: 0,
      x: customDirection > 0 ? -90 : 90,
      scale: 0.985,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (customDirection) => ({
      opacity: 0,
      x: customDirection > 0 ? 90 : -90,
      scale: 0.985,
      transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    }),
  }), [])

  return (
    <div className="route-viewport">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={location.pathname}
          className="route-page"
          custom={direction}
          variants={transitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<ContentStudio />} />
            <Route path="/planner" element={<CampaignPlanner />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<ChatHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function CursorAura() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleMove(event) {
      setPosition({ x: event.clientX, y: event.clientY })
      setVisible(true)
    }

    function handleLeave() {
      setVisible(false)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div
      className={`cursor-aura ${visible ? 'visible' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <ParticleBackground />
        <CursorAura />
        <Navbar />
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}
