import { Link, useLocation } from 'react-router-dom'
import useFlowStore from '../state/useFlowStore'

export default function Navigation({ darkMode, setDarkMode }) {
  const location = useLocation()
  const { token, profile, setToken, setProfile, reset } = useFlowStore()
  
  const userRole = profile?.role || profile?.realm_access?.roles?.[0] || 'guest'
  const userName = profile?.preferred_username || profile?.name || 'User'

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/demo', label: 'Demo', icon: '🎮' },
    { path: '/architecture', label: 'Architecture', icon: '🏗️' },
    { path: '/docs', label: 'API Docs', icon: '📚' },
    { path: '/policies', label: 'Policies', icon: '🔒' }
  ]

  const logout = () => {
    setToken(null)
    setProfile(null)
    reset()
  }

  return (
    <header className="backdrop-blur bg-white/10 border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🛡️</span>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Offlyn.ai
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/20 text-blue-700'
            }`}>
              Zero Trust Demo
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? darkMode 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/40 text-gray-800'
                    : darkMode
                      ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                      : 'text-gray-600 hover:bg-white/20 hover:text-gray-800'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Info and Controls */}
          <div className="flex items-center space-x-4">
            {token && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                darkMode ? 'bg-white/10 text-white' : 'bg-white/30 text-gray-700'
              }`}>
                <span className="text-sm">👋</span>
                <span className="text-sm font-medium">{userName}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                  userRole === 'admin' ? 'bg-red-500/20 text-red-600' :
                  userRole === 'therapist' ? 'bg-green-500/20 text-green-600' :
                  userRole === 'analyst' ? 'bg-blue-500/20 text-blue-600' :
                  userRole === 'support' ? 'bg-yellow-500/20 text-yellow-600' :
                  userRole === 'superuser' ? 'bg-purple-500/20 text-purple-600' :
                  'bg-gray-500/20 text-gray-600'
                }`}>
                  {userRole}
                </span>
                <button
                  onClick={logout}
                  className={`ml-2 px-2 py-1 rounded text-xs hover:bg-red-500/20 hover:text-red-600 transition-colors ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  Logout
                </button>
              </div>
            )}
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/30 text-gray-700 hover:bg-white/50'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Mobile Menu Button */}
            <button className={`md:hidden p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/30 text-gray-700 hover:bg-white/50'
            }`}>
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center ${
                  location.pathname === item.path
                    ? darkMode 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/40 text-gray-800'
                    : darkMode
                      ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                      : 'text-gray-600 hover:bg-white/20 hover:text-gray-800'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}