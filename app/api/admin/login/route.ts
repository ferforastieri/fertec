import {NextResponse} from 'next/server'
import {findUserByEmail, recordAttempt, startSession, tooManyAttempts, verifyPassword} from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'local'
  if (await tooManyAttempts(ip)) {
    return NextResponse.json({error: 'Muitas tentativas. Tente de novo em 15 minutos.'}, {status: 429})
  }
  let body: {email?: string; password?: string}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({error: 'Pedido inválido.'}, {status: 400})
  }
  const email = body.email?.trim() ?? ''
  const password = body.password ?? ''
  if (!email || !password) return NextResponse.json({error: 'Informe e-mail e senha.'}, {status: 400})

  const user = await findUserByEmail(email)
  const valid = user ? await verifyPassword(password, user.passwordHash) : false
  if (!user || !valid) {
    await recordAttempt(ip, false)
    return NextResponse.json({error: 'E-mail ou senha incorretos.'}, {status: 401})
  }
  await recordAttempt(ip, true)
  await startSession(user.id)
  return NextResponse.json({ok: true})
}
