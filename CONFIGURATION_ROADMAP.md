# Hobson Configuration Roadmap

*Last updated: February 2, 2026*

## Immediate Issues to Address

### 1. Cross-Device Sync (CRITICAL)
**Problem:** LocalStorage only exists on this computer. Your phone sees empty board.

**Solutions (pick one):**

| Option | Effort | Cost | Pros | Cons |
|--------|--------|------|------|------|
| **Firebase Firestore** | Low | Free tier | Real-time sync, easy setup | Google ecosystem |
| **Supabase** | Low | Free tier | PostgreSQL, open source | Newer, smaller community |
| **Notion API** | Medium | Free | You already want this | Rate limits, less real-time |
| **MongoDB Atlas** | Medium | Free tier | Document store fits well | More complex setup |

**Recommended:** Firebase Firestore
- 50k reads/day free (plenty for this)
- Real-time sync across all devices
- Simple JavaScript SDK
- Built-in auth if you want it later

### 2. API Keys & Credentials Management

**Current Risk:** Some keys in config files

**Best Practices:**
- Use environment variables for sensitive data
- Store non-secret config in workspace files
- Rotate tokens periodically
- Use GitHub's secret scanning (already enabled)

**Files to secure:**
```
C:\Users\hobso\.openclaw\openclaw.json  (already has tokens)
C:\Users\hobso\.openclaw\workspace\TOOLS.md  (has app passwords)
```

## Capability Enhancements

### 3. Code Assistant (Codex) Optimization

**Current Status:** Installed, OAuth authenticated, configured

**Next Steps:**
- [ ] Test with a multi-file refactor task
- [ ] Set up project-specific .codex/config.yaml
- [ ] Configure auto-approval rules for trusted patterns
- [ ] Document your preferred code style preferences

**Recommended .codex/config.yaml:**
```yaml
model: gpt-4o
approval_mode: auto-edit  # Auto-approve file edits, prompt for commands
project_context: |
  React + TypeScript + Tailwind CSS
  Prefer functional components
  Use explicit types, avoid 'any'
  Mobile-first responsive design
```

### 4. Browser Automation Reliability

**Current Issue:** Element refs change between snapshots

**Solutions:**
- Use `refs="aria"` for stable references
- Always refresh snapshot before actions
- Add retry logic with exponential backoff
- Use `data-testid` attributes in your own apps

**Better Pattern:**
```javascript
// Instead of storing refs across calls
const snapshot = await browser({ action: "snapshot", refs: "aria" })
const button = snapshot.find(el => el.name === "Submit")
await browser({ action: "act", request: { kind: "click", ref: button.ref }})
```

### 5. Model Provider Strategy

**Current Setup:**
- Primary: moonshot/kimi-k2.5
- Fallback: openai/gpt-5-mini

**Optimization:**
- Use gpt-5-nano for: reminders, simple lists, routine summaries
- Use gpt-5-mini for: drafts, research, most coding
- Use kimi-k2.5 for: complex strategy, multi-step planning
- Use o3 (via Codex) for: deep reasoning tasks

**Cost Efficiency Rule:**
If a task takes you <5 minutes to think through → use cheaper model
If a task needs synthesis across multiple sources → use stronger model

## Automation & Workflows

### 6. Cron Jobs for Proactive Work

**Current:** Heartbeat is empty (no periodic tasks)

**Recommended additions:**

```json
{
  "morning_brief": "Every day at 7:30 AM - Check calendar, weather, urgent emails",
  "weekly_review": "Sundays at 6 PM - Review open projects, update Kanban",
  "pool_season": "March 1 - Pre-season checklist for Humble Pools",
  "monthly_finance": "1st of month - Review expenses, invoices, P&L"
}
```

### 7. Humble Pools Integration

**Current:** Jobber is source of truth, but no API connection

**Priority Actions:**
1. Request Jobber API access (account admin)
2. Explore Zapier/Make.com for no-code automation
3. Set up daily digest of:
   - Crew schedules
   - Pending quotes
   - Overdue invoices
   - Water test reminders

### 8. AI-dapt Academy Infrastructure

**Missing:**
- Course content management system
- Student enrollment tracking
- Email automation for nurture sequences
- Calendly/_scheduling integration

**Quick Wins:**
- [Notion template for course content]
- [Zapier: Calendly → Notion → Email notification]
- [Loom integration for recording lessons]

## Data & Memory

### 9. Session Memory Optimization

**Current Status:** 
- ✅ Memory compaction flush enabled
- ✅ Session memory search enabled
- ✅ Sources: ["memory", "sessions"]

**Tuning:**
- Monitor token usage (check `/status` regularly)
- Archive old daily memory files monthly
- Curate MEMORY.md quarterly (remove outdated info)

### 10. Knowledge Base Expansion

**Create these files:**

| File | Purpose |
|------|---------|
| `SOPs/` | Standard operating procedures |
| `templates/` | Reusable document templates |
| `contacts/` | Key people and their preferences |
| `decisions/` | Major decisions with rationale |
| `learnings/` | What worked, what didn't |

## Security & Privacy

### 11. Access Control Audit

**Checklist:**
- [ ] Review who has access to this workspace
- [ ] Verify no secrets in git history (✅ GitHub scanning helps)
- [ ] Set up 2FA on all accounts
- [ ] Document recovery procedures

### 12. Backup Strategy

**Current:** GitHub repo backs up code

**Missing:**
- Automated backups of `C:\Users\hobso\.openclaw\`
- Document how to restore from scratch
- Export key config files to encrypted storage

## Communication Tools

### 13. Channel Integrations

**Current:** Telegram working

**Expand to:**
- [ ] Email send capability (SMTP or Graph API)
- [ ] Slack workspace (for team coordination)
- [ ] Discord (for community/ADA students)
- [ ] WhatsApp Business (for Humble Pools customers)

### 14. Notification Strategy

**Define urgency levels:**
- **URGENT:** Phone call + SMS + multiple channels
- **HIGH:** Telegram + email
- **NORMAL:** Telegram only
- **LOW:** Digest email only

## Development Environment

### 15. VS Code Integration

**If you want me to help with code:**
- Install OpenClaw extension for VS Code
- Enable workspace sharing
- Set up file watchers for auto-sync

### 16. Testing & QA

**Add to projects:**
- Basic unit tests (Vitest for Vite projects)
- Pre-commit hooks for linting
- GitHub Actions for CI/CD

## Success Metrics

**Track these monthly:**
1. Time saved vs. manual work
2. Projects completed on Kanban
3. Revenue impact (new leads, closed deals)
4. Response time to your requests
5. Errors/bugs introduced

## Immediate Next Steps (Priority Order)

1. **TODAY:** Set up Firebase for Kanban sync
2. **THIS WEEK:** Connect Jobber or explore Zapier
3. **THIS WEEK:** Test Codex on a real coding task
4. **THIS MONTH:** Build SOP library
5. **THIS MONTH:** Set up morning cron job

---

*Questions? Add them here as you think of them.*
