'use client'

import {createContext, useContext, type ReactNode} from 'react'
import type {Project, SiteContent} from '@/lib/content/types'

type Content = {site: SiteContent; projects: Project[]}

const ContentContext = createContext<Content | null>(null)

export function ContentProvider({site, projects, children}: Content & {children: ReactNode}) {
  return <ContentContext.Provider value={{site, projects}}>{children}</ContentContext.Provider>
}

export function useContent(): Content {
  const value = useContext(ContentContext)
  if (!value) throw new Error('useContent deve ser usado dentro de ContentProvider')
  return value
}

export function useSite(): SiteContent {
  return useContent().site
}

export function useProjects(): Project[] {
  return useContent().projects
}
