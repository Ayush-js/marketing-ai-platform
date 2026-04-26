import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ContentStudio from './pages/ContentStudio'
import CampaignPlanner from './pages/CampaignPlanner'
import Dashboard from './pages/Dashboard'
import ChatHistory from './pages/ChatHistory'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* Global animated background */}
        <div className="app-bg-shapes">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
          <div className="bg-shape shape-4"></div>
        </div>
        
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<ContentStudio />} />
            <Route path="/planner" element={<CampaignPlanner />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<ChatHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
