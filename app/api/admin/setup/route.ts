import {NextResponse} from 'next/server'
import {countAdmins, createAdmin} from '@/lib/auth'

export const dynamic = 'force-dynamic'

function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index)
  return diff === 0
}

export async function POST(request: Request) {
  if ((await countAdmins()) > 0) {
    return NextResponse.json({error: 'Administrador já configurado.'}, {status: 409})
  }
  const expected = process.env.ADMIN_SETUP_TOKEN
  if (!expected) {
    return NextResponse.json({error: 'ADMIN_SETUP_TOKEN não configurado no Worker.'}, {status: 500})
  }
  const body = (await request.json().catch(() => ({}))) as {token?: string; email?: string; password?: string}
  if (!body.token || !equal(body.token, expected)) {
    return NextResponse.json({error: 'Token de configuração inválido.'}, {status: 403})
  }
  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({error: 'E-mail inválido.'}, {status: 400})
  if (password.length < 10) return NextResponse.json({error: 'A senha precisa de pelo menos 10 caracteres.'}, {status: 400})
  await createAdmin(email, password)
  return NextResponse.json({ok: true})
}
