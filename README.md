# Kanban — Projects with Stoni Beauchamp

A simple, automated Kanban board managed by Hobson 🎩

## 🎯 How It Works

**No drag-and-drop.** This board is controlled programmatically by Hobson during your conversations. As you discuss projects, Hobson adds, moves, and updates items in real-time.

## 📊 Columns

| Column | Purpose |
|--------|---------|
| **In Progress** | Active work happening now |
| **Finished** | Completed projects |
| **Wishlist** | Ideas and future projects |
| **Archived** | Old projects, kept for reference |

## 🎩 Hobson Control API

Open your browser console (F12) and use `window.kanban`:

```javascript
// Add a new project
kanban.addProject({
  title: 'Website Redesign',
  description: 'Refresh the marketing site',
  priority: 'High',
  dueDate: '2026-03-15',
  tags: ['web', 'marketing'],
  stage: 'In Progress'
})

// Move a project to a different stage
kanban.moveProject('project-id-here', 'Finished')

// Update a project
kanban.updateProject('project-id-here', { priority: 'Medium' })

// Archive a project
kanban.archiveProject('project-id-here')

// Delete a project
kanban.deleteProject('project-id-here')

// View all projects
kanban.getAllProjects()

// Clear everything
kanban.clearAll()
```

## 🚀 Deployment

**Live URL:** https://kanban-stoni.surge.sh

**Repo:** https://github.com/hobsonbot316/kanban-stoni

### Build & Deploy

```bash
npm install
npm run build
cd dist && npx surge --domain kanban-stoni.surge.sh
```

## 🛠 Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- LocalStorage persistence

---

*Built by Hobson for Stoni Beauchamp*
