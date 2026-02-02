import React from 'react'
import { Project, Stage } from '../types'

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onMove: (projectId: string, newStage: Stage) => void
  onUpdateNotes: (projectId: string, notes: string) => void
}

const stages: Stage[] = ['Wishlist', 'In Progress', 'Finished', 'Archived']

const stageColors: Record<Stage, string> = {
  'Wishlist': 'bg-violet-100 text-violet-700 border-violet-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Finished': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Archived': 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function ProjectModal({ project, isOpen, onClose, onMove, onUpdateNotes }: ProjectModalProps) {
  if (!isOpen || !project) return null

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNotes(project.id, e.target.value)
  }

  const getNextStage = (current: Stage): Stage | null => {
    const idx = stages.indexOf(current)
    return idx < stages.length - 1 ? stages[idx + 1] : null
  }

  const getPrevStage = (current: Stage): Stage | null => {
    const idx = stages.indexOf(current)
    return idx > 0 ? stages[idx - 1] : null
  }

  const nextStage = getNextStage(project.stage)
  const prevStage = getPrevStage(project.stage)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{project.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${stageColors[project.stage]}`}>
                  {project.stage}
                </span>
                {project.priority && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    project.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                    project.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {project.priority} Priority
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {project.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Notes</h3>
            <textarea
              value={project.notes || ''}
              onChange={handleNotesChange}
              placeholder="Add detailed notes about this project..."
              className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Due Date */}
          {project.dueDate && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Due Date</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(project.dueDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          )}

          {/* Created/Updated */}
          <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            <p>Created: {new Date(project.createdAt).toLocaleString()}</p>
            <p>Last updated: {new Date(project.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Footer with Move Controls */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Move project:</span>
            <div className="flex gap-2">
              {prevStage && (
                <button
                  onClick={() => onMove(project.id, prevStage)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← {prevStage}
                </button>
              )}
              {nextStage && (
                <button
                  onClick={() => onMove(project.id, nextStage)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {nextStage} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
