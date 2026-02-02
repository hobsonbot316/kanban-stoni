import React, { useEffect, useState, useCallback } from 'react'
import Board from './components/Board'
import ProjectModal from './components/ProjectModal'
import { Project, Stage } from './types'

const STORAGE_KEY = 'kanban-projects-hobson'
const FIREBASE_COOLDOWN = 30000 // 30 seconds between Firebase attempts

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'local' | 'cloud' | 'error' | 'syncing'>('local')
  const [lastSync, setLastSync] = useState<string | null>(null)
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
              setLastSync(new Date().toLocaleTimeString())
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

  // Manual sync to Firebase
  const handleManualSync = useCallback(async () => {
    setSyncStatus('syncing')
    
    try {
      const { saveProjects, initializeDocument, isInitialized } = await import('./firebase-service')
      
      if (!isInitialized) {
        throw new Error('Firebase not initialized')
      }

      const initSuccess = await initializeDocument()
      if (!initSuccess) {
        throw new Error('Failed to initialize Firebase document')
      }

      const saveSuccess = await saveProjects(projects)
      if (saveSuccess) {
        setSyncStatus('cloud')
        setLastSync(new Date().toLocaleTimeString())
        alert('✓ Synced to cloud! Check your other devices.')
      } else {
        throw new Error('Failed to save to Firebase')
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
      alert('⚠️ Sync failed. Firebase may be temporarily unavailable.')
    }
  }, [projects])

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

  // Expose API
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
              <p className="text-sm text-gray-500">Managed by Hobson 🎩</p>
            </div>
            {/* Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={syncStatus === 'syncing'}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                syncStatus === 'syncing'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : syncStatus === 'cloud'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              {syncStatus === 'syncing' ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </>
              ) : syncStatus === 'cloud' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {lastSync ? `Synced at ${lastSync}` : 'Cloud Synced'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Sync to Cloud
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-gray-600">Click any project to view details and notes.</p>
            {syncStatus === 'local' && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">⚠️ Local only — press Sync to save to cloud</span>
            )}
            {syncStatus === 'error' && (
              <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-full">⚠️ Sync error — try again later</span>
            )}
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
