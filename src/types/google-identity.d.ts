interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  error?: string
  error_description?: string
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: '' | 'consent' | 'select_account' }): void
}

interface GoogleAccountsOAuth2 {
  initTokenClient(config: {
    client_id: string
    scope: string
    callback: (response: GoogleTokenResponse) => void
    error_callback?: (error: { type: string; message?: string }) => void
  }): GoogleTokenClient
  revoke(accessToken: string, done: () => void): void
}

interface Window {
  google?: {
    accounts: {
      oauth2: GoogleAccountsOAuth2
    }
  }
}
