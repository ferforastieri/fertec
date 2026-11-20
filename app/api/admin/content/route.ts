import {NextResponse} from 'next/server'
import {revalidatePath} from 'next/cache'
import {currentAdmin} from '@/lib/auth'
import {getProjects, getSite, getUpdatedAt, saveContent} from '@/lib/content/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await currentAdmin())) return NextResponse.json({error: 'Não autorizado.'}, {status: 401})
  const [site, projects, siteUpdatedAt, projectsUpdatedAt] = await Promise.all([
    getSite(),
    getProjects(),
    getUpdatedAt('site'),
    getUpdatedAt('projects'),
  ])
  return NextResponse.json({site, projects, updatedAt: {site: siteUpdatedAt, projects: projectsUpdatedAt}})
}

export async function PUT(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({error: 'Não autorizado.'}, {status: 401})
  let body: {site?: unknown; projects?: unknown}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({error: 'Pedido inválido.'}, {status: 400})
  }
  try {
    if (body.site) await saveContent('site', body.site)
    if (body.projects) await saveContent('projects', body.projects)
  } catch (error) {
    console.error('Falha ao salvar conteúdo', error)
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json({error: /obrigat|inválid|duplicado|sem título/i.test(message) ? message : 'Falha ao salvar.'}, {status: 400})
  }
  revalidatePath('/', 'layout')
  return NextResponse.json({ok: true, savedAt: new Date().toISOString()})
}
