export type Identity = {
  name: string
  brand: string
  jobTitle: string
  location: string
}

export type Contacts = { email: string; linkedin: string; github: string; x: string }
export type Metrics = { years: string; projects: string; drive: string }
export type LanguageOption = { locale: string; flag: string; key: string; code: string }

export type Experience = {
  id: string
  company: string
  role: string
  location: string
  period: string
  description: string
}

export type Education = {
  id: string
  school: string
  course: string
  period: string
  note?: string
}

export type ResumeLanguage = { id: string; name: string; level: string; cefr: string }

export type SiteCopy = {
  homePassion: string
  homeRole: string
  homeAbout: string
  profileSignature: string
  profileIntroduction: string
  resumeSummary: string
  resumeRole: string
  resumeLocation: string
  resumeEyebrow: string
  resumeTitle: string
  downloadFileName: string
}

export type SiteContent = {
  identity: Identity
  contacts: Contacts
  metrics: Metrics
  sectionNumbers: Record<string, string>
  networks: Record<string, string>
  metadata: {
    titles: { projects: string; resume: string }
    description: string
    projects: string
    resume: string
    projectPrefix: string
  }
  languages: LanguageOption[]
  resumeSkills: Record<string, string[]>
  copy: SiteCopy
  experience: Experience[]
  education: Education[]
  resumeLanguages: ResumeLanguage[]
}

export type ProjectGroup = 'personal' | 'professional'

export type TreeNode = {name: string; type: 'folder' | 'file'; children?: TreeNode[]}

export type Project = {
  id: string
  title: string
  group: ProjectGroup
  url: string
  repository: string
  tags: string[]
  technologies: string[]
  services: string[]
  description: string
  featured?: boolean
  tree?: TreeNode[]
  treeSource?: 'reconstructed'
}

export type Revision = {
  id: number
  doc: 'site' | 'projects'
  value: string
  createdAt: string
}
