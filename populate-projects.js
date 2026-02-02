// Script to populate Firebase with initial projects
// Run this in browser console on kanban-stoni.surge.sh

const initialProjects = [
  // Finished projects
  {
    id: '1',
    title: 'OpenClaw Gateway Config',
    description: 'Enabled memory compaction flush, session memory search, configured CLI backends',
    priority: 'High',
    dueDate: '2026-02-02',
    tags: ['config', 'openclaw', 'infrastructure'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '2',
    title: 'Codex CLI Setup',
    description: 'Installed Codex CLI with OAuth authentication, configured for complex coding tasks',
    priority: 'High',
    dueDate: '2026-02-02',
    tags: ['codex', 'openai', 'cli'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '3',
    title: 'Chrome Browser Relay',
    description: 'Enabled OpenClaw Browser Relay extension for Chrome tab control',
    priority: 'High',
    dueDate: '2026-02-02',
    tags: ['browser', 'chrome', 'extension'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '4',
    title: 'Email Account Integration',
    description: 'Connected Google and Microsoft accounts, sent test email',
    priority: 'Medium',
    dueDate: '2026-02-02',
    tags: ['email', 'google', 'microsoft'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '5',
    title: 'OpenAI Backup Provider',
    description: 'Added OpenAI as fallback model provider with gpt-5-mini and gpt-5-nano',
    priority: 'Medium',
    dueDate: '2026-02-02',
    tags: ['openai', 'models', 'fallback'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '6',
    title: 'Kanban Board MVP',
    description: 'Built and deployed Kanban project tracker with React + TypeScript + Tailwind',
    priority: 'High',
    dueDate: '2026-02-02',
    tags: ['kanban', 'react', 'project'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '7',
    title: 'Kanban Visual Redesign',
    description: 'Improved UI with gradient headers, modern cards, better typography',
    priority: 'Medium',
    dueDate: '2026-02-02',
    tags: ['kanban', 'design', 'ui'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '8',
    title: 'Kanban Quick Actions',
    description: 'Added Archive and Needs Work buttons directly on Finished cards',
    priority: 'Medium',
    dueDate: '2026-02-02',
    tags: ['kanban', 'ux', 'features'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '9',
    title: 'Kanban Cloud Sync Setup',
    description: 'Implemented Firebase integration for cross-device synchronization',
    priority: 'High',
    dueDate: '2026-02-02',
    tags: ['kanban', 'firebase', 'sync'],
    stage: 'Finished',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  // Wishlist projects
  {
    id: '10',
    title: 'Microsoft Graph API Integration',
    description: 'Implement robust programmatic email sending via Microsoft Graph API',
    priority: 'Low',
    dueDate: '2026-02-15',
    tags: ['email', 'microsoft', 'api'],
    stage: 'Wishlist',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '11',
    title: 'Humble Pools Jobber Integration',
    description: 'Connect to Jobber API for automated scheduling and CRM workflows',
    priority: 'Medium',
    dueDate: '2026-02-28',
    tags: ['humble-pools', 'jobber', 'automation'],
    stage: 'Wishlist',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '12',
    title: 'AI-dapt Academy Content System',
    description: 'Build system for managing AI 101 and AI 201 course materials',
    priority: 'Medium',
    dueDate: '2026-03-01',
    tags: ['ai-dapt', 'education', 'content'],
    stage: 'Wishlist',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  },
  {
    id: '13',
    title: 'Notion Integration',
    description: 'Connect Kanban board to Notion for persistent cloud storage',
    priority: 'Low',
    dueDate: '2026-03-15',
    tags: ['notion', 'integration', 'database'],
    stage: 'Wishlist',
    createdAt: '2026-02-02T12:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z'
  }
];

// Add all projects
initialProjects.forEach(p => {
  try {
    window.kanban.addProject(p);
  } catch(e) {
    console.log('Error adding project:', p.title, e);
  }
});

console.log('Added ' + initialProjects.length + ' projects');
