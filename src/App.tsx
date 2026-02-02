import React, { useEffect, useState, useCallback } from 'react'
import Board from './components/Board'
import ProjectModal from './components/ProjectModal'
import { Project, Stage } from './types'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'local' | 'cloud' | 'error' | 'syncing'>('local')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load projects from JSON file (fetched from server)
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/projects.json')
        if (!response.ok) {
          throw new Error('Failed to load projects')
        }
        const data = await response.json()
        setProjects(data)
        setSyncStatus('local')
      } catch (error) {
        console.error('Error loading projects:', error)
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  // Control functions
  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newProject: Project = {
      ...project,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    }
    setProjects((prev) => [...prev, newProject])
    console.log('🎩 Added project:', newProject.title)
    return newProject.id
  }, [])

  const moveProject = useCallback((projectId: string, newStage: Stage) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, stage: newStage, updatedAt: new Date().toISOString() } : p
      )
    )
    setSelectedProject((prev) => 
      prev && prev.id === projectId ? { ...prev, stage: newStage } : prev
    )
  }, [])

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
      setIsModalOpen(false)
    }
  }, [selectedProject])

  const updateProjectNotes = useCallback((projectId: string, notes: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, notes, updatedAt: new Date().toISOString() } : p
      )
    )
    setSelectedProject((prev) => 
      prev && prev.id === projectId ? { ...prev, notes } : prev
    )
  }, [])

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }, [])

  // Expose API for console access
  useEffect(() => {
    (window as any).kanban = {
      addProject,
      moveProject,
      deleteProject,
      getAllProjects: () => projects,
    }
  }, [addProject, moveProject, deleteProject, projects])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📋
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Projects with Stoni Beauchamp</h1>
              <p className="text-sm text-gray-500">Managed by Hobson 🎩 • JSON Backend</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-gray-600">Click any project to view details and notes.</p>
            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              ✓ JSON Backend (No browser storage)
            </span>
          </div>
        </header>

        <Board 
          projects={projects} 
          onMoveProject={moveProject}
          onSelectProject={handleSelectProject}
          onDeleteProject={deleteProject}
        />

        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Built with React + TypeScript + Tailwind • JSON File Backend
          </p>
        </footer>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMove={moveProject}
        onUpdateNotes={updateProjectNotes}
      />
    </div>
  )
}

export default App
