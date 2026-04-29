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

function CursorRippleField() {
  const canvasRef = useRef(null)
  const ripplesRef = useRef([])
  const lastSpawnRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined

    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      canvas.width = Math.floor(window.innerWidth * DPR)
      canvas.height = Math.floor(window.innerHeight * DPR)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    function onMove(event) {
      const now = performance.now()
      if (now - lastSpawnRef.current < 22) return
      lastSpawnRef.current = now
      ripplesRef.current.push({
        x: event.clientX,
        y: event.clientY,
        age: 0,
        life: 620,
        radius: 8,
      })
      if (ripplesRef.current.length > 24) {
        ripplesRef.current.shift()
      }
    }

    function onLeave() {
      ripplesRef.current = []
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    let frameId = 0
    let previous = performance.now()
    const animate = (timestamp) => {
      const delta = timestamp - previous
      previous = timestamp

      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ripplesRef.current = ripplesRef.current.filter((ripple) => ripple.age < ripple.life)

      ripplesRef.current.forEach((ripple) => {
        ripple.age += delta
        const progress = ripple.age / ripple.life
        const eased = 1 - (1 - progress) * (1 - progress)
        const currentRadius = ripple.radius + eased * 64
        const alpha = (1 - progress) * 0.24

        const glow = context.createRadialGradient(
          ripple.x,
          ripple.y,
          currentRadius * 0.15,
          ripple.x,
          ripple.y,
          currentRadius
        )
        glow.addColorStop(0, `rgba(252, 211, 77, ${alpha})`)
        glow.addColorStop(0.45, `rgba(245, 158, 11, ${alpha * 0.55})`)
        glow.addColorStop(1, 'rgba(245, 158, 11, 0)')

        context.fillStyle = glow
        context.beginPath()
        context.arc(ripple.x, ripple.y, currentRadius, 0, Math.PI * 2)
        context.fill()

        context.strokeStyle = `rgba(252, 211, 77, ${alpha * 0.8})`
        context.lineWidth = 1.1
        context.beginPath()
        context.arc(ripple.x, ripple.y, currentRadius * 0.72, 0, Math.PI * 2)
        context.stroke()
      })

      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-ripple-layer" aria-hidden="true" />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <ParticleBackground />
        <CursorRippleField />
        <Navbar />
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}
