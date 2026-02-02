# Firebase Setup for Kanban Cloud Sync

To enable cross-device sync (so your phone shows the same projects as your computer), you need to configure Firebase.

## Quick Setup (5 minutes)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it: `kanban-stoni`
4. Disable Google Analytics (simpler)
5. Click "Create project"

### 2. Create Firestore Database
1. In Firebase console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Choose "Start in production mode"
4. Select location: `us-central` (or closest to you)
5. Click "Enable"

### 3. Get Your Config
1. Click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Register app: nickname "kanban-web"
5. **Copy the config object** (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "kanban-stoni.firebaseapp.com",
  projectId: "kanban-stoni",
  storageBucket: "kanban-stoni.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 4. Update Config File
Replace the contents of `src/firebase-config.ts` with your actual values:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "kanban-stoni.firebaseapp.com",
  projectId: "kanban-stoni",
  storageBucket: "kanban-stoni.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 5. Set Firestore Rules
1. In Firebase console, go to Firestore Database
2. Click "Rules" tab
3. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kanban/stoni-projects {
      allow read, write: if true;
    }
  }
}
```

4. Click "Publish"

### 6. Rebuild & Deploy

```bash
npm run build
cd dist && npx surge --domain kanban-stoni.surge.sh
```

## That's It!

Now when you open https://kanban-stoni.surge.sh on any device, you'll see the same projects. Changes sync in real-time.

## Cost

Firebase free tier includes:
- 50,000 reads/day
- 20,000 writes/day
- 1GB stored data

This is plenty for personal use. You'll never hit these limits.

## Security Note

The rules above allow anyone to read/write your kanban data. For personal use this is fine (obscure URL). If you want security later, we can add authentication.
