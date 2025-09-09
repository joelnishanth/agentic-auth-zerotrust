import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Keycloak from 'keycloak-js'
import jwtDecode from 'jwt-decode'
import useFlowStore from '../state/useFlowStore'
import { setKeycloakInstance, performLogout } from '../utils/logoutService'

// Removed unused PKCE utility functions - Keycloak handles PKCE automatically

export default function LoginPanel() {
  const { token, setToken, setProfile, reset } = useFlowStore()
  const [isInitializing, setIsInitializing] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const keycloakRef = useRef(null)
  const initializationRef = useRef(false) // Prevent multiple initializations
  const navigate = useNavigate()

  const testUsers = [
    { username: 'sarah_therapist', role: 'therapist', name: 'Sarah (Therapist)' },
    { username: 'alice_admin_us', role: 'admin', name: 'Alice (Admin)' },
    { username: 'maya_analyst', role: 'analyst', name: 'Maya (Analyst)' },
    { username: 'leo_support', role: 'support', name: 'Leo (Support)' },
    { username: 'superdev', role: 'superuser', name: 'Super User' }
  ]

  useEffect(() => {
    if (!keycloakRef.current) {
      console.log('Creating Keycloak instance with PKCE support...')
      keycloakRef.current = new Keycloak({
        url: 'http://localhost:8080/',
        realm: 'zerotrust',
        clientId: 'demo-ui'
      })
      
      // Register the Keycloak instance with the logout service
      setKeycloakInstance(keycloakRef.current)
      
      // Add event listeners for debugging
      keycloakRef.current.onReady = (authenticated) => {
        console.log('Keycloak ready, authenticated:', authenticated)
      }
      
      keycloakRef.current.onAuthSuccess = () => {
        console.log('Keycloak auth success')
      }
      
      keycloakRef.current.onAuthError = (error) => {
        console.error('Keycloak auth error:', error)
      }
      
      keycloakRef.current.onTokenExpired = () => {
        console.log('Keycloak token expired')
      }
      
      keycloakRef.current.onAuthRefreshSuccess = () => {
        console.log('Keycloak token refresh success')
      }
      
      keycloakRef.current.onAuthRefreshError = () => {
        console.log('Keycloak token refresh error')
      }
    }
  }, [])

  const initializeKeycloak = async () => {
    // Prevent multiple initializations
    if (isInitializing || !keycloakRef.current || initializationRef.current) return
    
    initializationRef.current = true
    setIsInitializing(true)
    
    try {
      console.log('Initializing Keycloak with PKCE support...')
      
      // Minimal configuration to avoid URL parsing issues
      const initOptions = { 
        checkLoginIframe: false, // Disable iframe check for development
        enableLogging: true // Enable debug logging
        // Removed onLoad to prevent automatic SSO checks that cause URL parsing errors
      }
      
      console.log('Keycloak init options:', initOptions)
      const authenticated = await keycloakRef.current.init(initOptions)
      
      console.log('Keycloak authenticated:', authenticated)
      console.log('Keycloak token:', keycloakRef.current.token ? 'present' : 'missing')
      
      if (authenticated && keycloakRef.current.token) {
        console.log('Token received, decoding...')
        const profile = jwtDecode(keycloakRef.current.token)
        console.log('Decoded profile:', profile)
        setToken(keycloakRef.current.token)
        setProfile(profile)
        
        // Auto-redirect to demo page after successful login
        setTimeout(() => {
          navigate('/demo')
        }, 500)
      }
    } catch (err) {
      console.error('Keycloak initialization failed:', err)
      console.error('Error details:', err.message, err.stack)
      // Reset initialization flag on error
      initializationRef.current = false
    } finally {
      setIsInitializing(false)
    }
  }

  const login = async (username = selectedUser) => {
    if (!username) {
      alert('Please select a user account')
      return
    }

    try {
      setIsInitializing(true)
      console.log('Starting login for:', username)
      
      // Ensure Keycloak is initialized
      if (!keycloakRef.current) {
        console.error('Keycloak not initialized')
        return
      }
      
      // Try to initialize if not already done
      if (!keycloakRef.current.authenticated && !initializationRef.current) {
        try {
          const initOptions = { 
            onLoad: 'login-required',
            checkLoginIframe: false,
            enableLogging: true
            // pkceMethod: 'S256' // Disable PKCE for now to test basic flow
          }
          console.log('Initializing for login with options:', initOptions)
          initializationRef.current = true
          await keycloakRef.current.init(initOptions)
        } catch (initErr) {
          console.log('Init failed, proceeding with login:', initErr)
          initializationRef.current = false
        }
      }
      
      // Redirect to Keycloak login with PKCE support
      console.log('Redirecting to Keycloak login with PKCE...')
      const loginOptions = {
        redirectUri: window.location.origin + '/demo',
        loginHint: username
      }
      console.log('Login options:', loginOptions)
      await keycloakRef.current.login(loginOptions)
      
    } catch (err) {
      console.error('Login failed:', err)
      alert('Login failed: ' + err.message)
      setIsInitializing(false)
    }
  }

  const logout = async () => {
    await performLogout()
  }

  // Auto-initialize on component mount (only once)
  useEffect(() => {
    if (!token && !isInitializing && !initializationRef.current) {
      initializeKeycloak()
    }
  }, [token, isInitializing])

  if (!token) {
    return (
      <div className="p-6 backdrop-blur bg-white/30 rounded-2xl shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Select User Account
        </h3>
        
        <div className="space-y-2 mb-4">
          {testUsers.map((user) => (
            <label key={user.username} className="flex items-center space-x-3 p-2 hover:bg-white/20 rounded cursor-pointer">
              <input
                type="radio"
                name="user"
                value={user.username}
                checked={selectedUser === user.username}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="text-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-600 capitalize">{user.role}</div>
              </div>
            </label>
          ))}
        </div>
        
        <div className="text-center space-y-2">
          <button 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={() => login()}
            disabled={!selectedUser || isInitializing}
          >
            {isInitializing ? 'Initializing...' : 'Login with Keycloak'}
          </button>
          
          <div className="text-xs text-gray-600">
            Password for all accounts: <code className="bg-gray-200 px-1 rounded">password</code>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 text-center backdrop-blur bg-white/30 rounded-2xl shadow">
      <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={logout}>
        Logout
      </button>
    </div>
  )
}
