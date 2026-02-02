import React from 'react'
import { Project, Stage } from '../types'
import Card from './Card'

interface ColumnProps {
  stage: Stage
  projects: Project[]
  config: { color: string; icon: string; description: string }
}

export default function Column({ stage, projects, config }: ColumnProps) {
  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className={`rounded-t-xl bg-gradient-to-r ${config.color} p-4 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <h2 className="font-bold text-lg">{stage}</h2>
          </div>
          <span className="bg-white/20 px-2.5 py-1 rounded-full text-sm font-semibold">
            {projects.length}
          </span>
        </div>
        <p className="text-white/80 text-xs mt-1">{config.description}</p>
      </div>
      
      {/* Cards Container */}
      <div className="flex-1 bg-gray-50/80 rounded-b-xl p-3 min-h-[400px] space-y-3 border-x border-b border-gray-200">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <span className="text-2xl mb-1">{config.icon}</span>
            <span className="text-sm">No projects yet</span>
          </div>
        ) : (
          projects.map((project) => <Card key={project.id} project={project} />)
        )}
      </div>
    </div>
  )
}
