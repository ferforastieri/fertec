import treeData from '@/messages/project-trees.json'
import type {Project, TreeNode} from './types'

const trees = treeData as unknown as Record<string, TreeNode[]>

export type ProjectWithTree = Project & {tree: TreeNode[]; treeSource?: 'reconstructed'}

export function withTree(project: Project): ProjectWithTree {
  return {...project, tree: trees[project.id] ?? project.tree ?? []}
}
