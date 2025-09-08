import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './components/HomePage'
import DemoPage from './components/DemoPage'
import MCPDemoPage from './components/MCPDemoPage'
import PatientDemoPage from './components/PatientDemoPage'
import ArchitecturePage from './components/ArchitecturePage'
import DocsPage from './components/DocsPage'
import PoliciesPage from './components/PoliciesPage'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <Router>
      <div className={`min-h-screen transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/mcp-demo" element={<MCPDemoPage />} />
            <Route path="/patient-demo" element={<PatientDemoPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="backdrop-blur bg-white/10 border-t border-white/20 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Powered by{' '}
                <a 
                  href="https://offlyn.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`font-medium hover:underline ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  Offlyn.ai
                </a>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Zero Trust Architecture • Real-time Policy Enforcement
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}
