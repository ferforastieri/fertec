import treeData from '@/messages/project-trees.json'
import {extraTrees, reconstructedProjects} from '@/messages/project-extras'
import type {Project, TreeNode} from './types'

const trees = treeData as unknown as Record<string, TreeNode[]>

export type ProjectWithTree = Project & {tree: TreeNode[]; treeSource?: 'reconstructed'}

export function withTree(project: Project): ProjectWithTree {
  return {
    ...project,
    tree: trees[project.id] ?? extraTrees[project.id] ?? project.tree ?? [],
    ...(reconstructedProjects.has(project.id) ? {treeSource: 'reconstructed' as const} : {}),
  }
}
