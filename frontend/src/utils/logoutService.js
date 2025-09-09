// Logout service for handling authentication cleanup
import useFlowStore from '../state/useFlowStore'

let keycloakInstance = null

// Set the Keycloak instance (called from LoginPanel)
export const setKeycloakInstance = (keycloak) => {
  keycloakInstance = keycloak
}

// Get the Keycloak instance
export const getKeycloakInstance = () => {
  return keycloakInstance
}

// Perform logout with proper Keycloak integration
export const performLogout = async () => {
  const { reset } = useFlowStore.getState()
  
  try {
    console.log('Starting logout process...')
    
    // Clear local state first
    reset()
    
    // Then redirect to Keycloak logout if available
    if (keycloakInstance) {
      await keycloakInstance.logout({
        redirectUri: window.location.origin
      })
    } else {
      // If Keycloak instance is not available, force redirect
      console.log('Keycloak instance not available, forcing redirect')
      window.location.href = '/'
    }
  } catch (err) {
    console.error('Logout failed:', err)
    // Force logout on error by clearing state and redirecting
    reset()
    window.location.href = '/'
  }
}

// Simple logout (just clear local state - for cases where Keycloak is not available)
export const performSimpleLogout = () => {
  const { reset } = useFlowStore.getState()
  console.log('Performing simple logout (local state only)')
  reset()
  window.location.href = '/'
}
