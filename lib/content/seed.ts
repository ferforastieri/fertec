import type {Project, SiteContent} from './types'
import raw from './seed.json'

export const seedSite=raw.site as unknown as SiteContent
export const seedProjects=raw.projects as unknown as Project[]
