import React, { useEffect, useState, useCallback, useRef } from 'react'
import Board from './components/Board'
import ProjectModal from './components/ProjectModal'
import { Project, Stage } from './types'

// GitHub configuration
const GITHUB_OWNER = 'hobsonbot316'
const GITHUB_REPO = 'kanban-stoni'
const GITHUB_FILE_PATH = 'projects.json'
const GITHUB_BRANCH = 'main'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'syncing' | 'error'>('loading')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileSha, setFileSha] = useState<string | null>(null)
  const [githubToken, setGithubToken] = useState<string>('')
  
  // Track pending changes and save state
  const pendingChangesRef = useRef(false)
  const isSavingRef = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load GitHub token
  useEffect(() => {
    const token = import.meta.env.VITE_GITHUB_TOKEN || ''
    setGithubToken(token)
  }, [])

  // Load projects from GitHub
  const loadProjectsFromGitHub = async () => {
    setSyncStatus('loading')
    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      setFileSha(data.sha)

      const content = atob(data.content.replace(/\n/g, ''))
      const projects = JSON.parse(content)
      
      setProjects(projects)
      setSyncStatus('synced')
      setLastSync(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error loading from GitHub:', error)
      setSyncStatus('error')
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjectsFromGitHub()
  }, [])

  // Save projects to GitHub with retry logic
  const saveProjectsToGitHub = async (projectsToSave: Project[], retryCount = 0): Promise<boolean> => {
    if (!fileSha || !githubToken) {
      console.error('Missing file SHA or GitHub token')
      return false
    }

    if (isSavingRef.current) {
      // Already saving, mark pending and return
      pendingChangesRef.current = true
      return false
    }

    isSavingRef.current = true
    setSyncStatus('syncing')

    try {
      const content = btoa(JSON.stringify(projectsToSave, null, 2))
      
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Update projects - ${new Date().toISOString()}`,
            content: content,
            sha: fileSha,
            branch: GITHUB_BRANCH
          })
        }
      )

      if (response.status === 409) {
        // Conflict - file changed on server, refetch and retry once
        console.log('Conflict detected, refetching...')
        if (retryCount < 2) {
          await loadProjectsFromGitHub()
          isSavingRef.current = false
          return saveProjectsToGitHub(projectsToSave, retryCount + 1)
        }
        throw new Error('Conflict: Could not resolve after retry')
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      setFileSha(data.content.sha)
      setSyncStatus('synced')
      setLastSync(new Date().toLocaleTimeString())
      
      // Check if there were pending changes during save
      if (pendingChangesRef.current) {
        pendingChangesRef.current = false
        // Schedule another save
        scheduleSave()
      }
      
      return true
    } catch (error) {
      console.error('Error saving to GitHub:', error)
      setSyncStatus('error')
      return false
    } finally {
      isSavingRef.current = false
    }
  }

  // Schedule a save with debounce
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (githubToken && fileSha && !isSavingRef.current) {
        saveProjectsToGitHub(projects)
      }
    }, 30000) // 30 second debounce
  }, [projects, githubToken, fileSha])

  // Save when projects change
  useEffect(() => {
    if (!isLoading && syncStatus !== 'loading' && githubToken && fileSha) {
      pendingChangesRef.current = true
      scheduleSave()
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [projects, isLoading, syncStatus, githubToken, fileSha, scheduleSave])

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

  const handleManualSync = async () => {
    // Cancel any pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await saveProjectsToGitHub(projects)
  }

  const handleRefresh = () => {
    // Cancel any pending saves before refresh
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    loadProjectsFromGitHub()
  }

  // Expose API for console
  useEffect(() => {
    (window as any).kanban = {
      addProject,
      moveProject,
      deleteProject,
      getAllProjects: () => projects,
      refresh: handleRefresh,
      sync: handleManualSync
    }
  }, [addProject, moveProject, deleteProject, projects])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects from GitHub...</p>
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
              <p className="text-sm text-gray-500">Managed by Hobson 🎩 • GitHub Sync</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              {githubToken && (
                <button
                  onClick={handleManualSync}
                  disabled={syncStatus === 'syncing'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    syncStatus === 'syncing'
                      ? 'bg-yellow-100 text-yellow-700'
                      : syncStatus === 'synced'
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : syncStatus === 'error'
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  ) : syncStatus === 'synced' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {lastSync ? `Synced at ${lastSync}` : 'Synced'}
                    </>
                  ) : syncStatus === 'error' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sync Error
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Sync Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-gray-600">Click any project to view details and notes.</p>
            {!githubToken && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                ⚠️ Read-only mode - GitHub token not configured
              </span>
            )}
            {githubToken && syncStatus === 'synced' && (
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                ✓ Auto-sync enabled (30s delay)
              </span>
            )}
            {githubToken && syncStatus === 'error' && (
              <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-full">
                ⚠️ Sync failed - click Sync Now to retry
              </span>
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
            Built with React + TypeScript + Tailwind • GitHub Backend
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
