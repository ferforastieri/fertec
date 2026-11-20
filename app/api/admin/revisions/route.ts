import {NextResponse} from 'next/server'
import {revalidatePath} from 'next/cache'
import {currentAdmin} from '@/lib/auth'
import {listRevisions, restoreRevision} from '@/lib/content/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await currentAdmin())) return NextResponse.json({error: 'Não autorizado.'}, {status: 401})
  return NextResponse.json({revisions: await listRevisions()})
}

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({error: 'Não autorizado.'}, {status: 401})
  const body = (await request.json().catch(() => ({}))) as {id?: number}
  if (typeof body.id !== 'number') return NextResponse.json({error: 'Versão inválida.'}, {status: 400})
  try {
    const result = await restoreRevision(body.id)
    revalidatePath('/', 'layout')
    return NextResponse.json({ok: true, ...result})
  } catch (error) {
    console.error('Falha ao restaurar versão', error)
    return NextResponse.json({error: 'Falha ao restaurar.'}, {status: 400})
  }
}
