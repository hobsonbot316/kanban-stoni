import React from 'react'
import Column from './Column'
import { Project, Stage } from '../types'

const stages: Stage[] = ['In Progress', 'Finished', 'Wishlist', 'Archived']

interface BoardProps {
  projects: Project[]
}

export default function Board({ projects }: BoardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {stages.map((stage) => (
        <Column
          key={stage}
          stage={stage}
          projects={projects.filter((p) => p.stage === stage)}
        />
      ))}
    </div>
  )
}
