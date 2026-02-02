import React from 'react'
import Column from './Column'
import { Project, Stage } from '../types'

const stages: Stage[] = ['In Progress', 'Finished', 'Wishlist', 'Archived']

const stageConfig: Record<Stage, { color: string; icon: string; description: string }> = {
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
  'Wishlist': { 
    color: 'from-violet-500 to-purple-400', 
    icon: '✨',
    description: 'Future ideas'
  },
  'Archived': { 
    color: 'from-slate-500 to-gray-400', 
    icon: '📦',
    description: 'Past work'
  },
}

interface BoardProps {
  projects: Project[]
}

export default function Board({ projects }: BoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stages.map((stage) => (
        <Column
          key={stage}
          stage={stage}
          projects={projects.filter((p) => p.stage === stage)}
          config={stageConfig[stage]}
        />
      ))}
    </div>
  )
}
