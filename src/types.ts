export type Stage = 'In Progress' | 'Finished' | 'Wishlist' | 'Archived'

export type Project = {
  id: string
  title: string
  description?: string
  priority?: 'Low' | 'Medium' | 'High'
  dueDate?: string
  tags?: string[]
  stage: Stage
  createdAt: string
  updatedAt: string
}
