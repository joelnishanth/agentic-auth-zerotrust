import { useEffect, useRef } from 'react'
import Keycloak from 'keycloak-js'
import { jwtDecode } from 'jwt-decode'
import useFlowStore from '../state/useFlowStore'

export default function LoginPanel() {
  const { token, profile, setToken, setProfile, reset } = useFlowStore()
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
    <div className="p-6 backdrop-blur bg-white/30 rounded-2xl shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Claims</h2>
        <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={logout}>
          Logout
        </button>
      </div>
      <pre className="mt-2 text-sm overflow-auto max-h-60">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  )
}
