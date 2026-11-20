import type {TreeNode} from '@/lib/content/types'

const folder = (name: string, children: TreeNode[] = []): TreeNode => ({name, type: 'folder', children})
const file = (name: string): TreeNode => ({name, type: 'file'})

// Árvores que ficavam embutidas em messages/project-data.ts antes da migração.
export const extraTrees: Record<string, TreeNode[]> = {
  valk: [
    folder('src', [folder('components'), folder('cli'), folder('lib'), folder('styles')]),
    folder('docs'),
    folder('templates'),
    file('package.json'),
  ],
  leoplus: [
    folder('frontend', [folder('src', [folder('components'), folder('features'), folder('services')])]),
    folder('api', [folder('src', [folder('modules'), folder('integrations')])]),
    folder('infrastructure'),
  ],
}

export const reconstructedProjects = new Set(['valk', 'leoplus'])
