import React from 'react'
import { Project, Stage } from '../types'
import Card from './Card'

interface ColumnProps {
  stage: Stage
  projects: Project[]
}

const stageColors: Record<Stage, string> = {
  'In Progress': 'border-blue-400 bg-blue-50',
  'Finished': 'border-green-400 bg-green-50',
  'Wishlist': 'border-purple-400 bg-purple-50',
  'Archived': 'border-gray-400 bg-gray-50',
}

export default function Column({ stage, projects }: ColumnProps) {
  return (
    <div className={`rounded-lg shadow p-3 flex-1 min-w-[220px] border-t-4 ${stageColors[stage]}`}>
      <h2 className="font-semibold mb-3 text-gray-800">
        {stage} <span className="text-sm text-gray-500">({projects.length})</span>
      </h2>
      <div className="space-y-2 min-h-[60px]">
        {projects.map((project) => (
          <Card key={project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <div className="text-xs text-gray-400 italic text-center py-4">No projects</div>
        )}
      </div>
    </div>
  )
}
