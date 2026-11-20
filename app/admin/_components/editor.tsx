'use client'

import {useEffect, useMemo, useState, type ReactNode} from 'react'
import type {Project, Revision, SiteContent} from '@/lib/content/types'

type Tab = 'perfil' | 'textos' | 'curriculo' | 'projetos' | 'historico'

const tabs: {id: Tab; label: string}[] = [
  {id: 'perfil', label: 'Perfil'},
  {id: 'textos', label: 'Textos'},
  {id: 'curriculo', label: 'Currículo'},
  {id: 'projetos', label: 'Projetos'},
  {id: 'historico', label: 'Histórico'},
]

const inputClass =
  'w-full rounded-lg border border-[color-mix(in_srgb,var(--paper)_24%,transparent)] bg-[color-mix(in_srgb,var(--paper)_6%,transparent)] px-3 py-2 text-body-sm text-paper outline-none focus:border-paper'
const labelClass = 'mb-1 block text-[10px] font-bold tracking-[.14em] uppercase opacity-55'
const cardClass =
  'rounded-xl border border-[color-mix(in_srgb,var(--paper)_18%,transparent)] bg-[color-mix(in_srgb,var(--paper)_4%,transparent)] p-4'
const buttonClass =
  'inline-flex items-center gap-2 rounded-lg border border-paper bg-paper px-3 py-2 text-caption font-bold tracking-[.09em] text-ink uppercase disabled:opacity-50'
const ghostButton =
  'inline-flex items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--paper)_32%,transparent)] px-2.5 py-1.5 text-[11px] font-bold tracking-[.08em] uppercase opacity-75 hover:opacity-100'

function Field({label, value, onChange, multiline = false, type = 'text'}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  type?: string
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {multiline ? (
        <textarea className={`${inputClass} min-h-24`} value={value} onChange={event => onChange(event.target.value)} />
      ) : (
        <input className={inputClass} type={type} value={value} onChange={event => onChange(event.target.value)} />
      )}
    </label>
  )
}

function Section({title, children, actions}: {title: string; children: ReactNode; actions?: ReactNode}) {
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 font-display text-2xl font-normal">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function Editor({email}: {email: string}) {
  const [site, setSite] = useState<SiteContent | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [tab, setTab] = useState<Tab>('perfil')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [revisions, setRevisions] = useState<Revision[]>([])

  useEffect(() => {
    fetch('/api/admin/content')
      .then(response => response.json() as Promise<{error?: string; site: SiteContent; projects: Project[]}>)
      .then(data => {
        if (data.error) {
          setStatus(data.error)
          return
        }
        setSite(data.site)
        setProjects(data.projects)
      })
      .catch(() => setStatus('Não foi possível carregar o conteúdo.'))
  }, [])

  const loadRevisions = () =>
    fetch('/api/admin/revisions')
      .then(response => response.json() as Promise<{revisions?: Revision[]}>)
      .then(data => setRevisions(data.revisions ?? []))

  useEffect(() => {
    if (tab === 'historico') loadRevisions()
  }, [tab])

  const updateSite = (change: (draft: SiteContent) => void) => {
    setSite(current => {
      if (!current) return current
      const next = structuredClone(current)
      change(next)
      return next
    })
    setDirty(true)
    setStatus('')
  }

  const updateProjects = (change: (draft: Project[]) => void) => {
    setProjects(current => {
      const next = structuredClone(current)
      change(next)
      return next
    })
    setDirty(true)
    setStatus('')
  }

  const save = async () => {
    setSaving(true)
    setStatus('Salvando…')
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({site, projects}),
      })
      const data = (await response.json()) as {error?: string; savedAt: string}
      if (!response.ok) throw new Error(data.error ?? 'Falha ao salvar.')
      setDirty(false)
      setStatus(`Salvo às ${new Date(data.savedAt).toLocaleTimeString('pt-BR')}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Falha ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const listText = useMemo(() => (items: string[]) => items.join(', '), [])

  if (!site) {
    return <p className="p-8 text-body opacity-70">{status || 'Carregando painel…'}</p>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="grid content-start gap-2">
        {tabs.map(item => (
          <button
            key={item.id}
            type="button"
            className={`rounded-lg px-3 py-2 text-left text-body-sm ${tab === item.id ? 'bg-paper text-ink' : 'opacity-70 hover:opacity-100'}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
        <div className="mt-4 grid gap-2 border-t border-[color-mix(in_srgb,var(--paper)_18%,transparent)] pt-4">
          <a className="text-caption uppercase tracking-[.09em] opacity-70 hover:opacity-100" href="/" target="_blank" rel="noreferrer">
            Ver site ↗
          </a>
          <button
            type="button"
            className="text-left text-caption uppercase tracking-[.09em] opacity-70 hover:opacity-100"
            onClick={() => fetch('/api/admin/logout', {method: 'POST'}).then(() => (window.location.href = '/admin/login'))}
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="grid min-w-0 content-start gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color-mix(in_srgb,var(--paper)_18%,transparent)] pb-4">
          <div>
            <h1 className="m-0 font-display text-3xl font-normal">Conteúdo do site</h1>
            <p className="m-0 text-caption opacity-55">{email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-caption opacity-60">{status}</span>
            <button className={buttonClass} type="button" disabled={saving || !dirty} onClick={save}>
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </div>

        {tab === 'perfil' && (
          <div className="grid gap-5">
            <Section title="Identidade">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome" value={site.identity.name} onChange={value => updateSite(draft => { draft.identity.name = value })} />
                <Field label="Marca" value={site.identity.brand} onChange={value => updateSite(draft => { draft.identity.brand = value })} />
                <Field label="Cargo" value={site.identity.jobTitle} onChange={value => updateSite(draft => { draft.identity.jobTitle = value })} />
                <Field label="Localização" value={site.identity.location} onChange={value => updateSite(draft => { draft.identity.location = value })} />
              </div>
            </Section>
            <Section title="Contatos">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="E-mail" value={site.contacts.email} onChange={value => updateSite(draft => { draft.contacts.email = value })} />
                <Field label="LinkedIn" value={site.contacts.linkedin} onChange={value => updateSite(draft => { draft.contacts.linkedin = value })} />
                <Field label="GitHub" value={site.contacts.github} onChange={value => updateSite(draft => { draft.contacts.github = value })} />
                <Field label="X" value={site.contacts.x} onChange={value => updateSite(draft => { draft.contacts.x = value })} />
              </div>
            </Section>
            <Section title="Indicadores">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Anos de experiência" value={site.metrics.years} onChange={value => updateSite(draft => { draft.metrics.years = value })} />
                <Field label="Projetos (texto)" value={site.metrics.projects} onChange={value => updateSite(draft => { draft.metrics.projects = value })} />
                <Field label="Dedicação" value={site.metrics.drive} onChange={value => updateSite(draft => { draft.metrics.drive = value })} />
              </div>
              <p className="m-0 text-[11px] opacity-50">O número de projetos na home vem da contagem da aba Projetos.</p>
            </Section>
          </div>
        )}

        {tab === 'textos' && (
          <div className="grid gap-5">
            <Section title="Home">
              <div className="grid gap-3">
                <Field label="Frase em destaque" value={site.copy.homePassion} onChange={value => updateSite(draft => { draft.copy.homePassion = value })} />
                <Field label="Cargo apresentado" value={site.copy.homeRole} onChange={value => updateSite(draft => { draft.copy.homeRole = value })} />
                <Field label="Resumo" multiline value={site.copy.homeAbout} onChange={value => updateSite(draft => { draft.copy.homeAbout = value })} />
              </div>
            </Section>
            <Section title="Assinatura e apresentação">
              <div className="grid gap-3">
                <Field label="Assinatura" value={site.copy.profileSignature} onChange={value => updateSite(draft => { draft.copy.profileSignature = value })} />
                <Field label="Introdução" multiline value={site.copy.profileIntroduction} onChange={value => updateSite(draft => { draft.copy.profileIntroduction = value })} />
              </div>
            </Section>
            <Section title="Currículo">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Sobretítulo" value={site.copy.resumeEyebrow} onChange={value => updateSite(draft => { draft.copy.resumeEyebrow = value })} />
                <Field label="Título" value={site.copy.resumeTitle} onChange={value => updateSite(draft => { draft.copy.resumeTitle = value })} />
                <Field label="Cargo" value={site.copy.resumeRole} onChange={value => updateSite(draft => { draft.copy.resumeRole = value })} />
                <Field label="Local" value={site.copy.resumeLocation} onChange={value => updateSite(draft => { draft.copy.resumeLocation = value })} />
                <Field label="Nome do PDF" value={site.copy.downloadFileName} onChange={value => updateSite(draft => { draft.copy.downloadFileName = value })} />
              </div>
              <Field label="Resumo profissional" multiline value={site.copy.resumeSummary} onChange={value => updateSite(draft => { draft.copy.resumeSummary = value })} />
            </Section>
            <Section title="SEO">
              <div className="grid gap-3">
                <Field label="Descrição (Google)" multiline value={site.metadata.description} onChange={value => updateSite(draft => { draft.metadata.description = value })} />
              </div>
            </Section>
          </div>
        )}

        {tab === 'curriculo' && (
          <div className="grid gap-6">
            <Section
              title="Experiências"
              actions={
                <button
                  className={ghostButton}
                  type="button"
                  onClick={() => updateSite(draft => { draft.experience.push({id: `exp-${Date.now()}`, company: '', role: '', location: '', period: '', description: ''}) })}
                >
                  + Adicionar
                </button>
              }
            >
              {site.experience.map((entry, index) => (
                <div className={cardClass} key={entry.id}>
                  <div className="mb-3 flex items-center justify-between">
                    <strong className="text-caption uppercase tracking-[.12em] opacity-60">Experiência {index + 1}</strong>
                    <div className="flex gap-1">
                      <button className={ghostButton} type="button" onClick={() => updateSite(draft => { draft.experience = move(draft.experience, index, index - 1) })}>↑</button>
                      <button className={ghostButton} type="button" onClick={() => updateSite(draft => { draft.experience = move(draft.experience, index, index + 1) })}>↓</button>
                      <button className={ghostButton} type="button" onClick={() => updateSite(draft => { draft.experience.splice(index, 1) })}>Remover</button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Empresa" value={entry.company} onChange={value => updateSite(draft => { draft.experience[index].company = value })} />
                    <Field label="Cargo" value={entry.role} onChange={value => updateSite(draft => { draft.experience[index].role = value })} />
                    <Field label="Local" value={entry.location} onChange={value => updateSite(draft => { draft.experience[index].location = value })} />
                    <Field label="Período" value={entry.period} onChange={value => updateSite(draft => { draft.experience[index].period = value })} />
                  </div>
                  <div className="mt-3">
                    <Field label="Descrição" multiline value={entry.description} onChange={value => updateSite(draft => { draft.experience[index].description = value })} />
                  </div>
                  <p className="mt-2 mb-0 text-[11px] opacity-45">Para registrar promoção use "Cargo · Júnior → Pleno".</p>
                </div>
              ))}
            </Section>

            <Section
              title="Formação"
              actions={
                <button
                  className={ghostButton}
                  type="button"
                  onClick={() => updateSite(draft => { draft.education.push({id: `edu-${Date.now()}`, school: '', course: '', period: '', note: ''}) })}
                >
                  + Adicionar
                </button>
              }
            >
              {site.education.map((entry, index) => (
                <div className="grid gap-3 rounded-xl border border-[color-mix(in_srgb,var(--paper)_18%,transparent)] p-4 sm:grid-cols-[1fr_1fr_auto]" key={entry.id}>
                  <Field label="Instituição" value={entry.school} onChange={value => updateSite(draft => { draft.education[index].school = value })} />
                  <Field label="Curso" value={entry.course} onChange={value => updateSite(draft => { draft.education[index].course = value })} />
                  <div className="flex items-end gap-1">
                    <Field label="Período" value={entry.period} onChange={value => updateSite(draft => { draft.education[index].period = value })} />
                    <button className={ghostButton} type="button" onClick={() => updateSite(draft => { draft.education.splice(index, 1) })}>×</button>
                  </div>
                  <div className="sm:col-span-3">
                    <Field label="Observação (opcional)" value={entry.note ?? ''} onChange={value => updateSite(draft => { draft.education[index].note = value })} />
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Competências">
              {Object.entries(site.resumeSkills).map(([group, items]) => (
                <Field
                  key={group}
                  label={group}
                  value={listText(items)}
                  onChange={value => updateSite(draft => { draft.resumeSkills[group] = value.split(',').map(item => item.trim()).filter(Boolean) })}
                />
              ))}
              <p className="m-0 text-[11px] opacity-45">Separe as competências por vírgula.</p>
            </Section>

            <Section title="Idiomas">
              {site.resumeLanguages.map((entry, index) => (
                <div className="grid gap-3 rounded-xl border border-[color-mix(in_srgb,var(--paper)_18%,transparent)] p-4 sm:grid-cols-[1fr_1fr_80px_auto]" key={entry.id}>
                  <Field label="Idioma" value={entry.name} onChange={value => updateSite(draft => { draft.resumeLanguages[index].name = value })} />
                  <Field label="Nível" value={entry.level} onChange={value => updateSite(draft => { draft.resumeLanguages[index].level = value })} />
                  <Field label="CEFR" value={entry.cefr} onChange={value => updateSite(draft => { draft.resumeLanguages[index].cefr = value })} />
                  <div className="flex items-end">
                    <button className={ghostButton} type="button" onClick={() => updateSite(draft => { draft.resumeLanguages.splice(index, 1) })}>×</button>
                  </div>
                </div>
              ))}
            </Section>
          </div>
        )}

        {tab === 'projetos' && (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between">
              <p className="m-0 text-body-sm opacity-60">{projects.length} projetos no site.</p>
              <button
                className={ghostButton}
                type="button"
                onClick={() =>
                  updateProjects(draft => {
                    draft.unshift({id: `projeto-${Date.now()}`, title: 'Novo projeto', group: 'personal', url: '', repository: '', tags: [], technologies: [], services: [], description: ''})
                  })
                }
              >
                + Adicionar projeto
              </button>
            </div>
            {projects.map((project, index) => (
              <div className={cardClass} key={project.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-caption uppercase tracking-[.12em] opacity-60">
                    {index + 1} · {project.title || 'Sem título'}
                  </strong>
                  <div className="flex gap-1">
                    <button className={ghostButton} type="button" onClick={() => updateProjects(draft => { draft.splice(index, 1) })}>Remover</button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Título" value={project.title} onChange={value => updateProjects(draft => { draft[index].title = value })} />
                  <Field label="Identificador (URL)" value={project.id} onChange={value => updateProjects(draft => { draft[index].id = value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
                  <label className="block">
                    <span className={labelClass}>Grupo</span>
                    <select
                      className={inputClass}
                      value={project.group}
                      onChange={event => updateProjects(draft => { draft[index].group = event.target.value as Project['group'] })}
                    >
                      <option value="personal">Pessoal</option>
                      <option value="professional">Profissional</option>
                    </select>
                  </label>
                  <Field label="Link do projeto" value={project.url} onChange={value => updateProjects(draft => { draft[index].url = value })} />
                  <Field label="Repositório" value={project.repository} onChange={value => updateProjects(draft => { draft[index].repository = value })} />
                  <Field label="Tags" value={listText(project.tags)} onChange={value => updateProjects(draft => { draft[index].tags = value.split(',').map(item => item.trim()).filter(Boolean) })} />
                  <Field label="Tecnologias" value={listText(project.technologies)} onChange={value => updateProjects(draft => { draft[index].technologies = value.split(',').map(item => item.trim()).filter(Boolean) })} />
                  <Field label="Frentes" value={listText(project.services)} onChange={value => updateProjects(draft => { draft[index].services = value.split(',').map(item => item.trim()).filter(Boolean) })} />
                </div>
                <div className="mt-3">
                  <Field label="Descrição" multiline value={project.description} onChange={value => updateProjects(draft => { draft[index].description = value })} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'historico' && (
          <div className="grid gap-3">
            <p className="m-0 text-body-sm opacity-60">As últimas 20 gravações. Restaurar cria uma nova versão com o conteúdo escolhido.</p>
            {revisions.length === 0 && <p className="text-body-sm opacity-50">Nenhuma versão salva ainda.</p>}
            {revisions.map(revision => (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color-mix(in_srgb,var(--paper)_18%,transparent)] px-4 py-3" key={revision.id}>
                <span className="text-body-sm">
                  #{revision.id} · {revision.doc === 'site' ? 'perfil e currículo' : 'projetos'} ·{' '}
                  {new Date(revision.createdAt).toLocaleString('pt-BR')}
                </span>
                <button
                  className={ghostButton}
                  type="button"
                  onClick={async () => {
                    const response = await fetch('/api/admin/revisions', {
                      method: 'POST',
                      headers: {'content-type': 'application/json'},
                      body: JSON.stringify({id: revision.id}),
                    })
                    if (response.ok) {
                      const data = (await fetch('/api/admin/content').then(item => item.json())) as {site: SiteContent; projects: Project[]}
                      setSite(data.site)
                      setProjects(data.projects)
                      setDirty(false)
                      setStatus('Versão restaurada.')
                    } else {
                      setStatus(((await response.json()) as {error?: string}).error ?? 'Falha ao restaurar.')
                    }
                  }}
                >
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
