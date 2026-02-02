import React from 'react'
import { Project, Stage } from '../types'

interface CardProps {
  project: Project
  onClick: () => void
  onMove: (projectId: string, newStage: Stage) => void
}

const priorityConfig = {
  High: { color: 'bg-rose-500', light: 'bg-rose-50 text-rose-700', label: 'High' },
  Medium: { color: 'bg-amber-500', light: 'bg-amber-50 text-amber-700', label: 'Medium' },
  Low: { color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700', label: 'Low' },
}

export default function Card({ project, onClick, onMove }: CardProps) {
  const priority = project.priority ? priorityConfig[project.priority] : null
  
  return (
    <div 
      className="group bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-300"
    >
      {/* Header with Priority - clickable for details */}
      <div 
        onClick={onClick}
        className="flex items-start justify-between gap-3 cursor-pointer"
      >
        <h3 className="font-semibold text-gray-900 leading-tight">{project.title}</h3>
        {priority && (
          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${priority.light}`}>
            {priority.label}
          </span>
        )}
      </div>
      
      {/* Description - clickable */}
      {project.description && (
        <p 
          onClick={onClick}
          className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed cursor-pointer"
        >
          {project.description}
        </p>
      )}
      
      {/* Notes indicator - clickable */}
      {project.notes && (
        <div 
          onClick={onClick}
          className="flex items-center gap-1 mt-2 text-xs text-indigo-600 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Has notes</span>
        </div>
      )}
      
      {/* Tags - clickable */}
      {project.tags && project.tags.length > 0 && (
        <div 
          onClick={onClick}
          className="flex flex-wrap gap-1.5 mt-2 cursor-pointer"
        >
          {project.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Footer with Due Date */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div onClick={onClick} className="cursor-pointer">
          {project.dueDate ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          ) : (
            <span></span>
          )}
        </div>
        
        <span 
          onClick={onClick}
          className="text-[10px] text-gray-400 cursor-pointer"
        >
          Updated {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Quick Action Buttons - Only for Finished projects */}
      {project.stage === 'Finished' && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMove(project.id, 'In Progress')
            }}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Needs Work
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMove(project.id, 'Archived')
            }}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </button>
        </div>
      )}
    </div>
  )
}
