import {NextResponse} from 'next/server'
import {registerAttempt, hashPassword} from '@/lib/auth'
import {getDb} from '@/lib/db'

export const dynamic = 'force-dynamic'

function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index)
  return diff === 0
}

const notFound = () => NextResponse.json({error: 'Não encontrado.'}, {status: 404})

export async function POST(request: Request) {
  const db = await getDb()
  if (!db) return NextResponse.json({error: 'Indisponível.'}, {status: 503})

  const existing = await db
    .prepare('SELECT (SELECT COUNT(*) FROM admin_users) AS users, (SELECT COUNT(*) FROM setup_state) AS setups')
    .first<{users: number; setups: number}>()
  if ((existing?.users ?? 0) > 0 || (existing?.setups ?? 0) > 0) return notFound()

  const ip = request.headers.get('cf-connecting-ip') ?? 'local'
  if (!(await registerAttempt(`setup:${ip}`))) {
    return NextResponse.json({error: 'Muitas tentativas. Tente de novo em 15 minutos.'}, {status: 429})
  }

  const expected = process.env.ADMIN_SETUP_TOKEN
  if (!expected) return NextResponse.json({error: 'Configuração indisponível.'}, {status: 503})

  const body = (await request.json().catch(() => ({}))) as {token?: string; email?: string; password?: string}
  if (!body.token || !equal(body.token, expected)) {
    return NextResponse.json({error: 'Token de configuração inválido.'}, {status: 403})
  }
  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({error: 'E-mail inválido.'}, {status: 400})
  if (password.length < 10) return NextResponse.json({error: 'A senha precisa de pelo menos 10 caracteres.'}, {status: 400})

  const hash = await hashPassword(password)
  const now = new Date().toISOString()
  try {
    await db.batch([
      db.prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?1, ?2, ?3)').bind(email, hash, now),
      db.prepare('INSERT INTO setup_state (id, completed_at) VALUES (1, ?1)').bind(now),
    ])
  } catch {
    return notFound()
  }
  return NextResponse.json({ok: true})
}
