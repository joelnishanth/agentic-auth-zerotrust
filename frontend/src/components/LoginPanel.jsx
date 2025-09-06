import { useEffect, useRef } from 'react'
import Keycloak from 'keycloak-js'
import { jwtDecode } from 'jwt-decode'
import useFlowStore from '../state/useFlowStore'

export default function LoginPanel() {
  const { token, setToken, setProfile, reset } = useFlowStore()
  const keycloakRef = useRef(null)

  useEffect(() => {
    console.log('Initializing Keycloak client...')
    keycloakRef.current = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'zerotrust',
      clientId: 'demo-ui'
    })
    console.log('Keycloak client initialized:', keycloakRef.current)
  }, [])

  const login = async () => {
    try {
      console.log('Attempting to login with Keycloak...')
      
      // First initialize Keycloak without auto-login
      const auth = await keycloakRef.current?.init({ 
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      })
      
      console.log('Keycloak init result:', auth)
      
      if (auth) {
        console.log('Already authenticated, token:', keycloakRef.current?.token)
        setToken(keycloakRef.current?.token || null)
        setProfile(jwtDecode(keycloakRef.current?.token || ''))
      } else {
        console.log('Not authenticated, redirecting to login...')
        // Manually trigger login
        keycloakRef.current?.login({
          redirectUri: window.location.origin
        })
      }
    } catch (err) {
      console.error('Login failed:', err)
      alert('Login failed: ' + err.message)
    }
  }

  const logout = () => {
    keycloakRef.current?.logout()
    reset()
    setToken(null)
    setProfile(null)
  }

  if (!token) {
    return (
      <div className="p-6 text-center backdrop-blur bg-white/30 rounded-2xl shadow">
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={login}>
          Login with Keycloak
        </button>
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
