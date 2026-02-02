export type Stage = 'Wishlist' | 'In Progress' | 'Finished' | 'Archived'

export type Project = {
  id: string
  title: string
  description?: string
  notes?: string
  priority?: 'Low' | 'Medium' | 'High'
  dueDate?: string
  tags?: string[]
  stage: Stage
  createdAt: string
  updatedAt: string
}
