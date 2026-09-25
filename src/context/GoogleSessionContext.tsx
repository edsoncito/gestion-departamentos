import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ALLOWED_GOOGLE_EMAIL,
  GOOGLE_CLIENT_ID,
  GOOGLE_SCOPES,
} from '../config/google'

interface GoogleUser {
  email: string
  name: string
  picture: string
}

interface UserInfoResponse {
  email: string
  name?: string
  picture?: string
}

interface GoogleSessionValue {
  accessToken: string | null
  configured: boolean
  error: string | null
  loading: boolean
  ready: boolean
  user: GoogleUser | null
  connect: () => void
  disconnect: () => void
}

const GoogleSessionContext = createContext<GoogleSessionValue | null>(null)

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts.oauth2) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-identity]',
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services.'))
    document.head.appendChild(script)
  })
}

export function GoogleSessionProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<GoogleTokenClient | null>(null)
  const configured = Boolean(GOOGLE_CLIENT_ID)

  useEffect(() => {
    if (!configured) {
      setReady(true)
      return
    }

    let active = true
    loadGoogleIdentityScript()
      .then(() => {
        if (!active || !window.google) return
        clientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_SCOPES,
          callback: async (response) => {
            if (!active) return
            if (response.error || !response.access_token) {
              setLoading(false)
              setError(response.error_description || 'Google no pudo autorizar el acceso.')
              return
            }

            try {
              const userResponse = await fetch(
                'https://openidconnect.googleapis.com/v1/userinfo',
                { headers: { Authorization: `Bearer ${response.access_token}` } },
              )
              if (!userResponse.ok) throw new Error('No se pudo verificar la cuenta de Google.')
              const profile = (await userResponse.json()) as UserInfoResponse
              if (profile.email.toLowerCase() !== ALLOWED_GOOGLE_EMAIL) {
                window.google?.accounts.oauth2.revoke(response.access_token, () => undefined)
                throw new Error(`Esta aplicación solo admite la cuenta ${ALLOWED_GOOGLE_EMAIL}.`)
              }

              setAccessToken(response.access_token)
              setUser({
                email: profile.email,
                name: profile.name || profile.email,
                picture: profile.picture || '',
              })
              setError(null)
            } catch (sessionError) {
              setAccessToken(null)
              setUser(null)
              setError(
                sessionError instanceof Error
                  ? sessionError.message
                  : 'No se pudo iniciar la sesión.',
              )
            } finally {
              setLoading(false)
            }
          },
          error_callback: () => {
            if (!active) return
            setLoading(false)
            setError('La ventana de Google se cerró o no pudo abrirse.')
          },
        })
        setReady(true)
      })
      .catch((scriptError) => {
        if (!active) return
        setReady(true)
        setError(
          scriptError instanceof Error
            ? scriptError.message
            : 'No se pudo preparar el acceso con Google.',
        )
      })

    return () => {
      active = false
    }
  }, [configured])

  const connect = useCallback(() => {
    if (!clientRef.current) {
      setError('Google Identity Services todavía no está disponible.')
      return
    }
    setLoading(true)
    setError(null)
    clientRef.current.requestAccessToken({ prompt: 'select_account' })
  }, [])

  const disconnect = useCallback(() => {
    if (!accessToken) return
    window.google?.accounts.oauth2.revoke(accessToken, () => {
      setAccessToken(null)
      setUser(null)
      setError(null)
    })
  }, [accessToken])

  const value = useMemo<GoogleSessionValue>(
    () => ({
      accessToken,
      configured,
      error,
      loading,
      ready,
      user,
      connect,
      disconnect,
    }),
    [accessToken, configured, connect, disconnect, error, loading, ready, user],
  )

  return (
    <GoogleSessionContext.Provider value={value}>
      {children}
    </GoogleSessionContext.Provider>
  )
}

export function useGoogleSession() {
  const value = useContext(GoogleSessionContext)
  if (!value) throw new Error('useGoogleSession debe usarse dentro de GoogleSessionProvider')
  return value
}
