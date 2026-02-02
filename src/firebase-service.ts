import { initializeApp, FirebaseApp } from 'firebase/app'
import { 
  getFirestore, 
  Firestore,
  doc, 
  onSnapshot, 
  setDoc,
  getDoc
} from 'firebase/firestore'
import { firebaseConfig } from './firebase-config'
import { Project } from './types'

// Lazy initialization - don't connect until explicitly requested
let app: FirebaseApp | null = null
let db: Firestore | null = null
let isInitialized = false
let initError: Error | null = null

export function initializeFirebase(): boolean {
  if (isInitialized) return true
  if (initError) return false
  
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    isInitialized = true
    console.log('Firebase initialized successfully')
    return true
  } catch (error) {
    initError = error as Error
    console.error('Firebase initialization failed:', error)
    return false
  }
}

export { isInitialized }

// Get document reference (only after initialization)
function getProjectsDoc() {
  if (!db) {
    throw new Error('Firebase not initialized')
  }
  return doc(db, 'kanban', 'stoni-projects')
}

// Subscribe to projects (real-time sync)
export function subscribeToProjects(
  callback: (projects: Project[]) => void,
  onError?: (error: Error) => void
) {
  if (!initializeFirebase()) {
    console.warn('Firebase not available')
    callback([])
    return () => {}
  }

  let hasReceivedData = false

  // Timeout - if no data in 5 seconds, return empty
  const timeoutId = setTimeout(() => {
    if (!hasReceivedData) {
      console.warn('Firebase timeout')
      callback([])
    }
  }, 5000)

  try {
    const projectsDoc = getProjectsDoc()
    
    const unsubscribe = onSnapshot(
      projectsDoc,
      (docSnap) => {
        hasReceivedData = true
        clearTimeout(timeoutId)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          callback(data.projects || [])
        } else {
          callback([])
        }
      },
      (error) => {
        hasReceivedData = true
        clearTimeout(timeoutId)
        console.error('Firestore error:', error)
        onError?.(error)
        callback([])
      }
    )

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('Subscription error:', error)
    callback([])
    return () => {}
  }
}

// Save projects to Firestore
export async function saveProjects(projects: Project[]): Promise<boolean> {
  if (!initializeFirebase()) {
    return false
  }

  try {
    const projectsDoc = getProjectsDoc()
    await setDoc(projectsDoc, { 
      projects, 
      updatedAt: new Date().toISOString() 
    })
    return true
  } catch (error) {
    console.error('Failed to save:', error)
    return false
  }
}

// Initialize document if needed
export async function initializeDocument(): Promise<boolean> {
  if (!initializeFirebase()) {
    return false
  }

  try {
    const projectsDoc = getProjectsDoc()
    const docSnap = await getDoc(projectsDoc)
    if (!docSnap.exists()) {
      await setDoc(projectsDoc, { 
        projects: [], 
        updatedAt: new Date().toISOString() 
      })
    }
    return true
  } catch (error) {
    console.error('Failed to init document:', error)
    return false
  }
}
