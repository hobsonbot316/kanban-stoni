export type Stage = 'Backlog' | 'In Progress' | 'Review' | 'Done'

export type Project = {
  id: string
  title: string
  description?: string
  priority?: 'Low' | 'Medium' | 'High'
  dueDate?: string
  tags?: string[]
  stage: Stage
}
