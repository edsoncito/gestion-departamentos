export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
  '241839280721-6nitbhf8nbpbhtr0e2asbblr23hi49tf.apps.googleusercontent.com'

export const GOOGLE_SHEET_ID =
  import.meta.env.VITE_GOOGLE_SHEET_ID?.trim() ||
  '1QF8USI80HT9ATRI4q3ZRoAvxP_vIPnJ-IDNUKW6IUVY'

export const ALLOWED_GOOGLE_EMAIL =
  import.meta.env.VITE_ALLOWED_GOOGLE_EMAIL?.trim().toLowerCase() ||
  'edson.nur@gmail.com'

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ')
