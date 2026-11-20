import {cookies} from 'next/headers'
import {getDb} from '@/lib/db'

const cookieName = () => (process.env.NODE_ENV === 'production' ? '__Host-fertec_admin' : 'fertec_admin')
const SESSION_DAYS = 7
const ITERATIONS = 210_000

const encoder = new TextEncoder()

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations}, key, 256)
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(password, salt, ITERATIONS)
  return `pbkdf2$sha256$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, hashName, iterations, salt, hash] = stored.split('$')
  if (scheme !== 'pbkdf2' || hashName !== 'sha256') return false
  const candidate = await derive(password, fromBase64(salt), Number(iterations))
  const expected = fromBase64(hash)
  if (candidate.length !== expected.length) return false
  let diff = 0
  for (let index = 0; index < candidate.length; index += 1) diff |= candidate[index] ^ expected[index]
  return diff === 0
}

async function sha256(value: string): Promise<string> {
  return toBase64(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))))
}

export type AdminUser = {id: number; email: string; passwordHash: string}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const db = await getDb()
  if (!db) return null
  const row = await db
    .prepare('SELECT id, email, password_hash FROM admin_users WHERE lower(email) = lower(?1)')
    .bind(email)
    .first<{id: number; email: string; password_hash: string}>()
  return row ? {id: row.id, email: row.email, passwordHash: row.password_hash} : null
}

export async function countAdmins(): Promise<number> {
  const db = await getDb()
  if (!db) return 0
  const row = await db.prepare('SELECT COUNT(*) AS total FROM admin_users').first<{total: number}>()
  return row?.total ?? 0
}

export async function createAdmin(email: string, password: string): Promise<void> {
  const db = await getDb()
  if (!db) throw new Error('Banco de dados indisponível.')
  const hash = await hashPassword(password)
  await db
    .prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?1, ?2, ?3)')
    .bind(email.trim(), hash, new Date().toISOString())
    .run()
}

export async function startSession(userId: number): Promise<void> {
  const db = await getDb()
  if (!db) throw new Error('Banco de dados indisponível.')
  const token = toBase64(crypto.getRandomValues(new Uint8Array(32))).replace(/[+/=]/g, '')
  const id = await sha256(token)
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000)
  await db
    .prepare('INSERT INTO admin_sessions (id, user_id, expires_at, created_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(id, userId, expires.toISOString(), new Date().toISOString())
    .run()
  const store = await cookies()
  store.set(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  })
}

export async function currentAdmin(): Promise<{id: number; email: string} | null> {
  const store = await cookies()
  const token = store.get(cookieName())?.value
  if (!token) return null
  const db = await getDb()
  if (!db) return null
  const id = await sha256(token)
  const row = await db
    .prepare(
      'SELECT u.id, u.email FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.id = ?1 AND s.expires_at > ?2',
    )
    .bind(id, new Date().toISOString())
    .first<{id: number; email: string}>()
  return row ?? null
}

export async function endSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(cookieName())?.value
  if (token) {
    const db = await getDb()
    if (db) {
      const id = await sha256(token)
      await db.prepare('DELETE FROM admin_sessions WHERE id = ?1').bind(id).run()
    }
  }
  store.delete(cookieName())
}

// Insere e confere no mesmo comando, para pedidos paralelos não furarem o limite.
export async function registerAttempt(key: string): Promise<boolean> {
  const db = await getDb()
  if (!db) return true
  const now = new Date()
  const since = new Date(now.getTime() - 15 * 60_000).toISOString()
  const result = await db
    .prepare(
      'INSERT INTO admin_login_attempts (ip, created_at) SELECT ?1, ?2 WHERE (SELECT COUNT(*) FROM admin_login_attempts WHERE ip = ?1 AND created_at > ?3) < 5',
    )
    .bind(key, now.toISOString(), since)
    .run()
  return (result.meta.changes ?? 0) > 0
}

export async function clearAttempts(key: string): Promise<void> {
  const db = await getDb()
  if (!db) return
  await db
    .prepare('DELETE FROM admin_login_attempts WHERE ip = ?1 OR created_at < ?2')
    .bind(key, new Date(Date.now() - 24 * 3_600_000).toISOString())
    .run()
}

// Hash fixo para gastar o mesmo tempo quando o e-mail não existe.
const DUMMY_HASH = 'pbkdf2$sha256$210000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

export async function verifyLogin(email: string, password: string): Promise<{id: number; email: string} | null> {
  const user = await findUserByEmail(email)
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  return user && valid ? {id: user.id, email: user.email} : null
}
