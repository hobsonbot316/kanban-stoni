import React, { useEffect, useState, useCallback } from 'react'
import Board from './components/Board'
import ProjectModal from './components/ProjectModal'
import { Project, Stage } from './types'

// Fallback to LocalStorage if Firebase not configured
const STORAGE_KEY = 'kanban-projects-hobson'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'local' | 'cloud' | 'error'>('local')
  const [firebaseError, setFirebaseError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load projects from LocalStorage only (Firebase disabled due to quota)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setProjects(JSON.parse(raw))
      }
    } catch (e) {
      console.error('Failed to load from LocalStorage:', e)
    }
    setSyncStatus('local')
    setIsLoading(false)
  }, [])

  // Save projects to LocalStorage only
  useEffect(() => {
    if (isLoading) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects, isLoading])

  // === HOBSON CONTROL FUNCTIONS ===

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
    console.log('🎩 Moved project to:', newStage)
    setSelectedProject((prev) => 
      prev && prev.id === projectId ? { ...prev, stage: newStage } : prev
    )
  }, [])

  const updateProject = useCallback((projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    )
    setSelectedProject((prev) => 
      prev && prev.id === projectId ? { ...prev, ...updates } : prev
    )
  }, [])

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

  const archiveProject = useCallback((projectId: string) => {
    moveProject(projectId, 'Archived')
  }, [moveProject])

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
      setIsModalOpen(false)
    }
  }, [selectedProject])

  const getProjectsByStage = useCallback((stage: Stage) => {
    return projects.filter((p) => p.stage === stage)
  }, [projects])

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }, [])

  const retryFirebase = useCallback(async () => {
    setIsLoading(true)
    setFirebaseError(null)
    window.location.reload()
  }, [])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
          <p className="text-sm text-gray-400 mt-2">This may take up to 10 seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📋
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects with Stoni Beauchamp</h1>
              <p className="text-sm text-gray-500">Managed by Hobson 🎩</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-gray-600">
              Click any project to view details and notes. Use arrows to move between stages.
            </p>
            {syncStatus === 'local' && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                ⚠️ Local only
              </span>
            )}
            {syncStatus === 'cloud' && (
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                ✓ Cloud synced
              </span>
            )}
            {syncStatus === 'error' && (
              <button
                onClick={retryFirebase}
                className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-full hover:bg-rose-200"
              >
                ⚠️ Sync error — click to retry
              </button>
            )}
          </div>
          {firebaseError && (
            <p className="text-xs text-rose-600 mt-2">Error: {firebaseError}</p>
          )}
        </header>

        <Board 
          projects={projects} 
          onMoveProject={moveProject}
          onSelectProject={handleSelectProject}
        />

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Built with React + TypeScript + Tailwind • {syncStatus === 'cloud' ? 'Firebase real-time sync' : syncStatus === 'error' ? 'Firebase error — using LocalStorage' : 'LocalStorage (device only)'}
          </p>
        </footer>
      </div>

      {/* Project Detail Modal */}
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
