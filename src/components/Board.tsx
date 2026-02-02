import React from 'react'
import Column from './Column'
import { Project, Stage } from '../types'

const stages: Stage[] = ['Wishlist', 'In Progress', 'Finished', 'Archived']

const stageConfig: Record<Stage, { color: string; icon: string; description: string }> = {
  'Wishlist': { 
    color: 'from-violet-500 to-purple-400', 
    icon: '✨',
    description: 'Future ideas'
  },
  'In Progress': { 
    color: 'from-blue-500 to-cyan-400', 
    icon: '⚡',
    description: 'Active work'
  },
  'Finished': { 
    color: 'from-emerald-500 to-teal-400', 
    icon: '✓',
    description: 'Completed'
  },
  'Archived': { 
    color: 'from-slate-500 to-gray-400', 
    icon: '📦',
    description: 'Past work'
  },
}

interface BoardProps {
  projects: Project[]
  onMoveProject: (projectId: string, newStage: Stage) => void
  onSelectProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
}

export default function Board({ projects, onMoveProject, onSelectProject, onDeleteProject }: BoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stages.map((stage) => (
        <Column
          key={stage}
          stage={stage}
          projects={projects.filter((p) => p.stage === stage)}
          config={stageConfig[stage]}
          onMoveProject={onMoveProject}
          onSelectProject={onSelectProject}
          onDeleteProject={onDeleteProject}
        />
      ))}
    </div>
  )
}
