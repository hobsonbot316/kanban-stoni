import React from 'react'
import { Project } from '../types'

interface CardProps {
  project: Project
}

const priorityColors = {
  High: 'bg-red-500',
  Medium: 'bg-amber-500',
  Low: 'bg-emerald-500',
}

export default function Card({ project }: CardProps) {
  return (
    <div className="border p-3 rounded bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{project.title}</div>
          {project.description && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-2">{project.description}</div>
          )}
        </div>
        {project.priority && (
          <div
            className={`text-xs px-2 py-0.5 rounded text-white font-medium shrink-0 ${priorityColors[project.priority]}`}
          >
            {project.priority}
          </div>
        )}
      </div>
      
      {(project.tags?.length || project.dueDate) && (
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex flex-wrap gap-1">
            {project.tags?.map((t) => (
              <span key={t} className="text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                #{t}
              </span>
            ))}
          </div>
          {project.dueDate && (
            <div className="text-gray-400 shrink-0">{project.dueDate}</div>
          )}
        </div>
      )}
      
      <div className="mt-2 text-[10px] text-gray-400">
        Updated: {new Date(project.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
