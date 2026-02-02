import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc,
  getDoc,
  enableIndexedDbPersistence
} from 'firebase/firestore'
import { firebaseConfig } from './firebase-config'
import { Project } from './types'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence enabled in first tab only')
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support offline persistence')
  }
})

// Collection reference
const PROJECTS_DOC = doc(db, 'kanban', 'stoni-projects')

// Subscribe to projects (real-time sync)
export function subscribeToProjects(callback: (projects: Project[]) => void) {
  return onSnapshot(PROJECTS_DOC, (doc) => {
    if (doc.exists()) {
      const data = doc.data()
      callback(data.projects || [])
    } else {
      callback([])
    }
  }, (error) => {
    console.error('Firestore subscription error:', error)
    // Fallback to empty array on error
    callback([])
  })
}

// Save projects to Firestore
export async function saveProjects(projects: Project[]) {
  try {
    await setDoc(PROJECTS_DOC, { projects, updatedAt: new Date().toISOString() })
    return true
  } catch (error) {
    console.error('Failed to save projects:', error)
    return false
  }
}

// Load projects once (for initial load)
export async function loadProjects(): Promise<Project[]> {
  try {
    const docSnap = await getDoc(PROJECTS_DOC)
    if (docSnap.exists()) {
      const data = docSnap.data()
      return data.projects || []
    }
    return []
  } catch (error) {
    console.error('Failed to load projects:', error)
    return []
  }
}
