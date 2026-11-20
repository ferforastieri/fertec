import {getDb} from '@/lib/db'
import {seedProjects, seedSite} from './seed'
import type {Project, Revision, SiteContent} from './types'
import {withTree, type ProjectWithTree} from './trees'

export const SITE_DOC = 'site' as const
export const PROJECTS_DOC = 'projects' as const
export type ContentDoc = typeof SITE_DOC | typeof PROJECTS_DOC

const MAX_REVISIONS = 20

async function readDoc<T>(doc: ContentDoc): Promise<T | null> {
  const db = await getDb()
  if (!db) return null
  try {
    const row = await db
      .prepare('SELECT value FROM content WHERE key = ?1')
      .bind(doc)
      .first<{value: string}>()
    return row ? (JSON.parse(row.value) as T) : null
  } catch {
    return null
  }
}

export async function getSite(): Promise<SiteContent> {
  const stored = await readDoc<Partial<SiteContent>>(SITE_DOC)
  if (!stored) return sanitizeSite(seedSite)
  return sanitizeSite({
    ...seedSite,
    ...stored,
    identity: {...seedSite.identity, ...(stored.identity ?? {})},
    contacts: {...seedSite.contacts, ...(stored.contacts ?? {})},
    metrics: {...seedSite.metrics, ...(stored.metrics ?? {})},
    metadata: {...seedSite.metadata, ...(stored.metadata ?? {})},
    copy: {...seedSite.copy, ...(stored.copy ?? {})},
    experience: stored.experience ?? seedSite.experience,
    education: stored.education ?? seedSite.education,
    resumeLanguages: stored.resumeLanguages ?? seedSite.resumeLanguages,
    resumeSkills: stored.resumeSkills ?? seedSite.resumeSkills,
    sectionNumbers: stored.sectionNumbers ?? seedSite.sectionNumbers,
    networks: stored.networks ?? seedSite.networks,
  })
}

export async function getProjects(): Promise<Project[]> {
  const stored = await readDoc<Project[]>(PROJECTS_DOC)
  return sanitizeProjects(stored?.length ? stored : seedProjects)
}

export async function getProjectsWithTrees(): Promise<ProjectWithTree[]> {
  return (await getProjects()).map(withTree)
}

const SAFE_PROTOCOL = /^https?:\/\//i

function safeUrl(value: unknown, fallback = ''): string {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return fallback
  return SAFE_PROTOCOL.test(text) ? text : fallback
}

export function sanitizeSite(site: SiteContent): SiteContent {
  return {
    ...site,
    contacts: {
      email: site.contacts.email,
      linkedin: safeUrl(site.contacts.linkedin),
      github: safeUrl(site.contacts.github),
      x: safeUrl(site.contacts.x),
    },
  }
}

export function sanitizeProjects(projects: Project[]): Project[] {
  return projects.map(project => ({...project, url: safeUrl(project.url)}))
}

function assertValid(doc: ContentDoc, value: unknown): void {
  if (!value || typeof value !== 'object') throw new Error('Conteúdo inválido.')
  if (doc === SITE_DOC) {
    const site = value as SiteContent
    if (!site.identity || typeof site.identity.name !== 'string' || !site.identity.name.trim())
      throw new Error('O nome do perfil é obrigatório.')
    if (!Array.isArray(site.experience) || !Array.isArray(site.education))
      throw new Error('Listas de experiência e formação são obrigatórias.')
  } else {
    const projects = value as Project[]
    if (!Array.isArray(projects)) throw new Error('Lista de projetos inválida.')
    const seen = new Set<string>()
    for (const project of projects) {
      if (!project || typeof project.id !== 'string' || !/^[a-z0-9-]+$/.test(project.id))
        throw new Error(`Identificador de projeto inválido: ${project?.id ?? 'vazio'}`)
      if (seen.has(project.id)) throw new Error(`Projeto duplicado: ${project.id}`)
      seen.add(project.id)
      if (!project.title?.trim()) throw new Error(`Projeto ${project.id} sem título.`)
    }
  }
}

export async function saveContent(doc: ContentDoc, value: unknown): Promise<string> {
  assertValid(doc, value)
  value = doc === SITE_DOC ? sanitizeSite(value as SiteContent) : sanitizeProjects(value as Project[])
  const db = await getDb()
  if (!db) throw new Error('Banco de dados indisponível.')
  const json = JSON.stringify(value)
  const now = new Date().toISOString()
  const existing = await readDoc(doc)
  const baseline = existing ? JSON.stringify(existing) : JSON.stringify(doc === SITE_DOC ? seedSite : seedProjects)
  if (!existing) {
    await db
      .prepare('INSERT INTO content_revisions (doc, value, created_at) VALUES (?1, ?2, ?3)')
      .bind(doc, baseline, now)
      .run()
  }
  await db
    .prepare(
      'INSERT INTO content (key, value, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
    )
    .bind(doc, json, now)
    .run()
  if (json !== baseline) {
    await db
      .prepare('INSERT INTO content_revisions (doc, value, created_at) VALUES (?1, ?2, ?3)')
      .bind(doc, json, now)
      .run()
  }
  await db
    .prepare(
      'DELETE FROM content_revisions WHERE doc = ?1 AND id NOT IN (SELECT id FROM content_revisions WHERE doc = ?1 ORDER BY id DESC LIMIT ?2)',
    )
    .bind(doc, MAX_REVISIONS)
    .run()
  return now
}

export async function getUpdatedAt(doc: ContentDoc): Promise<string | null> {
  const db = await getDb()
  if (!db) return null
  const row = await db
    .prepare('SELECT updated_at FROM content WHERE key = ?1')
    .bind(doc)
    .first<{updated_at: string}>()
  return row?.updated_at ?? null
}

export async function listRevisions(): Promise<Revision[]> {
  const db = await getDb()
  if (!db) return []
  const {results} = await db
    .prepare('SELECT id, doc, created_at FROM content_revisions ORDER BY id DESC LIMIT 20')
    .all<{id: number; doc: ContentDoc; created_at: string}>()
  return results.map(row => ({id: row.id, doc: row.doc, value: '', createdAt: row.created_at}))
}

export async function restoreRevision(id: number): Promise<{doc: ContentDoc}> {
  const db = await getDb()
  if (!db) throw new Error('Banco de dados indisponível.')
  const row = await db
    .prepare('SELECT doc, value FROM content_revisions WHERE id = ?1')
    .bind(id)
    .first<{doc: ContentDoc; value: string}>()
  if (!row) throw new Error('Versão não encontrada.')
  await saveContent(row.doc, JSON.parse(row.value))
  return {doc: row.doc}
}
