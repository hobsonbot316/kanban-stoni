import React, { useEffect, useState } from 'react'
import Board from './components/Board'
import { Project, Stage } from './types'

const STORAGE_KEY = 'kanban-projects'

const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Website redesign',
    description: 'Refresh the marketing site look and content',
    priority: 'High',
    dueDate: '2026-03-01',
    tags: ['marketing', 'web'],
    stage: 'Backlog',
  },
  {
    id: '2',
    title: 'Onboard Stoni',
    description: "Create intro materials and schedule meetings",
    priority: 'Medium',
    dueDate: '2026-02-10',
    tags: ['people'],
    stage: 'In Progress',
  },
]

function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : initialProjects
    } catch (e) {
      return initialProjects
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  return (
    <div className="p-4 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kanban — Projects with Stoni Beauchamp</h1>
        <div className="text-sm text-gray-600">LocalStorage persistence</div>
      </header>

      <Board projects={projects} setProjects={setProjects} />

      <footer className="mt-6 text-xs text-gray-500">Built with React + TypeScript + Tailwind</footer>
    </div>
  )
}

export default App
