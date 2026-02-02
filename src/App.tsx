import React, { useEffect, useState, useCallback } from 'react'
import Board from './components/Board'
import ProjectModal from './components/ProjectModal'
import { Project, Stage } from './types'

const STORAGE_KEY = 'kanban-projects-hobson'
const FIREBASE_COOLDOWN = 30000 // 30 seconds between Firebase attempts

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'local' | 'cloud' | 'error'>('local')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Load projects - LocalStorage first, then try Firebase once
  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | null = null

    const loadProjects = async () => {
      // Always load LocalStorage first (instant)
      let localProjects: Project[] = []
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          localProjects = JSON.parse(raw)
          if (isMounted) setProjects(localProjects)
        }
      } catch (e) {
        console.error('LocalStorage error:', e)
      }
      
      // Stop loading spinner immediately
      if (isMounted) setIsLoading(false)

      // Check if we should try Firebase (cooldown to avoid rate limits)
      const lastFirebaseAttempt = localStorage.getItem('kanban-firebase-last-attempt')
      const now = Date.now()
      
      if (lastFirebaseAttempt && (now - parseInt(lastFirebaseAttempt)) < FIREBASE_COOLDOWN) {
        console.log('Firebase cooldown active, skipping')
        return
      }

      // Try Firebase once (not aggressively)
      try {
        localStorage.setItem('kanban-firebase-last-attempt', now.toString())
        
        const { subscribeToProjects, initializeDocument, isInitialized } = await import('./firebase-service')
        
        if (!isInitialized) {
          console.log('Firebase not initialized')
          return
        }

        await initializeDocument()

        // Single subscription with error handling
        unsubscribe = subscribeToProjects(
          (firestoreProjects) => {
            if (!isMounted) return
            if (firestoreProjects.length > 0) {
              setProjects(firestoreProjects)
              setSyncStatus('cloud')
            }
          },
          (error) => {
            console.error('Firebase error:', error)
            if (isMounted) setSyncStatus('error')
          }
        )
      } catch (error) {
        console.log('Firebase unavailable:', error)
      }
    }

    loadProjects()

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // Save projects - Firebase if cloud mode, else LocalStorage
  useEffect(() => {
    if (isLoading) return

    // Always save to LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))

    // Also try Firebase if we're in cloud mode
    if (syncStatus === 'cloud') {
      import('./firebase-service').then(({ saveProjects }) => {
        saveProjects(projects).catch(err => {
          console.error('Failed to save to Firebase:', err)
        })
      })
    }
  }, [projects, isLoading, syncStatus])

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

  // Expose API
  useEffect(() => {
    (window as any).kanban = {
      addProject,
      moveProject,
      getAllProjects: () => projects,
    }
  }, [addProject, moveProject, projects])

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects with Stoni Beauchamp</h1>
              <p className="text-sm text-gray-500">Managed by Hobson 🎩</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-gray-600">Click any project to view details and notes.</p>
            {syncStatus === 'local' && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">⚠️ Local only</span>
            )}
            {syncStatus === 'cloud' && (
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">✓ Cloud synced</span>
            )}
          </div>
        </header>

        <Board 
          projects={projects} 
          onMoveProject={moveProject}
          onSelectProject={handleSelectProject}
        />

        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Built with React + TypeScript + Tailwind
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
