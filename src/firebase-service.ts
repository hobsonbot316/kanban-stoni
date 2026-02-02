import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc,
  getDoc,
  enableIndexedDbPersistence
} from 'firebase/firestore'
import { firebaseConfig } from './firebase-config'
import { Project } from './types'

// Initialize Firebase
let app;
let db;
let isInitialized = false;

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  isInitialized = true;
  
  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence enabled in first tab only')
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support offline persistence')
    }
  })
} catch (error) {
  console.error('Firebase initialization failed:', error)
  isInitialized = false;
}

export { db, isInitialized }

// Document reference
const PROJECTS_DOC = isInitialized ? doc(db!, 'kanban', 'stoni-projects') : null

// Subscribe to projects (real-time sync)
export function subscribeToProjects(
  callback: (projects: Project[]) => void,
  onError?: (error: Error) => void
) {
  if (!PROJECTS_DOC) {
    console.warn('Firebase not initialized, using empty projects')
    callback([])
    return () => {}
  }

  let hasReceivedData = false

  // Set up timeout - if no data received in 5 seconds, call callback with empty array
  const timeoutId = setTimeout(() => {
    if (!hasReceivedData) {
      console.warn('Firebase subscription timeout - no data received')
      callback([])
    }
  }, 5000)

  const unsubscribe = onSnapshot(
    PROJECTS_DOC,
    (docSnap) => {
      hasReceivedData = true
      clearTimeout(timeoutId)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        callback(data.projects || [])
      } else {
        // Document doesn't exist yet - return empty array
        callback([])
      }
    },
    (error) => {
      hasReceivedData = true
      clearTimeout(timeoutId)
      console.error('Firestore subscription error:', error)
      onError?.(error)
      callback([])
    }
  )

  return () => {
    clearTimeout(timeoutId)
    unsubscribe()
  }
}

// Save projects to Firestore
export async function saveProjects(projects: Project[]): Promise<boolean> {
  if (!PROJECTS_DOC) {
    console.warn('Firebase not initialized, cannot save')
    return false
  }

  try {
    await setDoc(PROJECTS_DOC, { 
      projects, 
      updatedAt: new Date().toISOString() 
    })
    return true
  } catch (error) {
    console.error('Failed to save projects:', error)
    return false
  }
}

// Load projects once (for initial load)
export async function loadProjects(): Promise<Project[]> {
  if (!PROJECTS_DOC) {
    console.warn('Firebase not initialized, returning empty projects')
    return []
  }

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

// Initialize document if it doesn't exist
export async function initializeDocument(): Promise<boolean> {
  if (!PROJECTS_DOC) {
    return false
  }

  try {
    const docSnap = await getDoc(PROJECTS_DOC)
    if (!docSnap.exists()) {
      await setDoc(PROJECTS_DOC, { 
        projects: [], 
        updatedAt: new Date().toISOString() 
      })
      console.log('Initialized Firestore document')
    }
    return true
  } catch (error) {
    console.error('Failed to initialize document:', error)
    return false
  }
}
