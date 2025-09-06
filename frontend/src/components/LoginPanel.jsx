import { useEffect, useRef } from 'react'
import Keycloak from 'keycloak-js'
import jwtDecode from 'jwt-decode'
import useFlowStore from '../state/useFlowStore'

export default function LoginPanel() {
  const { token, setToken, setProfile, reset } = useFlowStore()
  const keycloakRef = useRef(null)

  useEffect(() => {
    keycloakRef.current = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'offlyn',
      clientId: 'demo-ui'
    })
  }, [])

  const login = async () => {
    try {
      const auth = await keycloakRef.current?.init({ onLoad: 'login-required' })
      if (auth) {
        setToken(keycloakRef.current?.token || null)
        setProfile(jwtDecode(keycloakRef.current?.token || ''))
      }
    } catch (err) {
      console.error('login failed', err)
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
