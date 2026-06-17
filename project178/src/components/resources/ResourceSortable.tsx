import type { LearningResource, ResourceStatus, KeyResult } from '@/types'
import ResourceCard from './ResourceCard'
import { ArrowDown } from 'lucide-react'

interface ResourceSortableProps {
  resources: LearningResource[]
  allResources: LearningResource[]
  keyResults: KeyResult[]
  onEdit: (resource: LearningResource) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ResourceStatus) => void
}

interface ResourceNode {
  resource: LearningResource
  children: ResourceNode[]
}

function buildDependencyTree(resources: LearningResource[]): ResourceNode[] {
  const map = new Map<string, ResourceNode>()
  resources.forEach((r) => map.set(r.id, { resource: r, children: [] }))

  const roots: ResourceNode[] = []
  resources.forEach((r) => {
    const node = map.get(r.id)!
    if (r.dependsOn && map.has(r.dependsOn)) {
      map.get(r.dependsOn)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function flattenTree(nodes: ResourceNode[], depth = 0): { node: ResourceNode; depth: number }[] {
  const result: { node: ResourceNode; depth: number }[] = []
  nodes.forEach((n) => {
    result.push({ node: n, depth })
    result.push(...flattenTree(n.children, depth + 1))
  })
  return result
}

export default function ResourceSortable({
  resources,
  allResources,
  keyResults,
  onEdit,
  onDelete,
  onStatusChange,
}: ResourceSortableProps) {
  const sorted = [...resources].sort((a, b) => a.priority - b.priority)
  const tree = buildDependencyTree(sorted)
  const flat = flattenTree(tree)

  if (resources.length === 0) {
    return (
      <div className="card-static p-8 rounded-xl text-center">
        <div className="text-sm text-[var(--color-text-muted)]">暂无学习资源，点击上方按钮添加</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {flat.map(({ node, depth }) => {
        const depTitle = node.resource.dependsOn
          ? allResources.find((r) => r.id === node.resource.dependsOn)?.title
          : undefined
        const kr = node.resource.krId
          ? keyResults.find((k) => k.id === node.resource.krId)
          : undefined

        return (
          <div key={node.resource.id} className="relative">
            {depth > 0 && (
              <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1">
                {Array.from({ length: depth }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-6 h-full border-l-2 border-dashed border-[var(--color-border)]" />
                  </div>
                ))}
                <ArrowDown className="w-3 h-3 text-[var(--color-text-muted)] shrink-0 -rotate-90" />
              </div>
            )}
            <div style={{ paddingLeft: depth * 28 }}>
              <ResourceCard
                resource={node.resource}
                dependencyTitle={depth > 0 ? depTitle : undefined}
                krDescription={kr?.description}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
