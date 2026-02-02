import React, { useEffect, useState, useCallback } from 'react'
import Board from './components/Board'
import { Project, Stage } from './types'

const STORAGE_KEY = 'kanban-projects-hobson'

// Hobson-controlled initial state - empty to start fresh
const defaultProjects: Project[] = []

function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        return JSON.parse(raw)
      }
    } catch (e) {
      console.error('Failed to load projects:', e)
    }
    return defaultProjects
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  // === HOBSON CONTROL FUNCTIONS ===
  // These are exposed for Hobson to manage projects programmatically

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newProject: Project = {
      ...project,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    }
    setProjects((prev) => [...prev, newProject])
    return newProject.id
  }, [])

  const moveProject = useCallback((projectId: string, newStage: Stage) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, stage: newStage, updatedAt: new Date().toISOString() } : p
      )
    )
  }, [])

  const updateProject = useCallback((projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    )
  }, [])

  const archiveProject = useCallback((projectId: string) => {
    moveProject(projectId, 'Archived')
  }, [moveProject])

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }, [])

  const getProjectsByStage = useCallback((stage: Stage) => {
    return projects.filter((p) => p.stage === stage)
  }, [projects])

  // Expose control functions to window for Hobson to access
  useEffect(() => {
    const api = {
      addProject,
      moveProject,
      updateProject,
      archiveProject,
      deleteProject,
      getProjectsByStage,
      getAllProjects: () => projects,
      clearAll: () => setProjects([]),
    }
    ;(window as any).kanban = api
    console.log('🎩 Kanban API ready. Use window.kanban to manage projects.')
  }, [addProject, moveProject, updateProject, archiveProject, deleteProject, getProjectsByStage, projects])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📋 Projects with Stoni Beauchamp</h1>
          <p className="text-sm text-gray-600 mt-1">
            Managed by Hobson 🎩 • Open browser console to see available commands
          </p>
        </header>

        <Board projects={projects} />

        <footer className="mt-8 text-xs text-gray-500 text-center">
          Built with React + TypeScript + Tailwind • LocalStorage persistence
        </footer>
      </div>
    </div>
  )
}

export default App
