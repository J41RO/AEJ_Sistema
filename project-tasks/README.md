# Project Tasks Management

This folder contains all pending and completed tasks for the AEJ Sistema POS project.

## 📁 File Structure

```
project-tasks/
├── README.md       # This file
├── pending.md      # All pending tasks organized by priority
└── completed.md    # Archive of completed tasks
```

## 📋 How to Use

### When Starting a New Task:
1. Open `pending.md`
2. Find the task you're working on
3. Update status to "In Progress"
4. Add your name/date if working in a team

### When Completing a Task:
1. Copy the complete task section from `pending.md`
2. Paste it into `completed.md` under the appropriate date
3. Remove it from `pending.md`
4. Update "Last Updated" date in both files

### When Adding a New Task:
1. Open `pending.md`
2. Add task under the appropriate priority section:
   - 🔴 CRITICAL - Blockers, must be done immediately
   - 🟠 HIGH - Important features, should be done soon
   - 🟡 MEDIUM - Nice to have, can wait
   - 🔵 TESTING - Validation and QA tasks
3. Include:
   - Task number
   - Clear title
   - Status: Pending
   - Estimated time
   - Detailed description
   - Files to modify/create
   - Any blockers or dependencies

## 🎯 Priority Guidelines

### 🔴 CRITICAL
- System is broken or unusable
- Users cannot perform basic operations
- Production is down
- Security vulnerabilities

### 🟠 HIGH PRIORITY
- New core features
- Important functionality
- Database changes
- Backend architecture

### 🟡 MEDIUM PRIORITY
- UX improvements
- UI enhancements
- Refactoring
- Documentation

### 🔵 TESTING
- Feature validation
- Bug verification
- Performance testing
- User acceptance testing

## 📊 Task Template

```markdown
### [Number]. [Task Title]
**Status:** Pending | In Progress | Blocked
**Estimated Time:** X hours/minutes
**Assigned To:** [Name] (if applicable)
**Description:**
- Clear description of what needs to be done
- Expected outcome
- Any specific requirements

**Files to Modify/Create:**
- `path/to/file1.tsx`
- `path/to/file2.py`

**Dependencies:**
- Task #X must be completed first
- Requires Y library/tool

**Blocker:** (if applicable)
- What is blocking this task from completion

**Notes:**
- Any additional information
- Links to documentation
- Related issues
```

## 🔄 Workflow

1. **Planning Phase**
   - Add all identified tasks to `pending.md`
   - Assign priorities
   - Estimate time

2. **Execution Phase**
   - Pick highest priority task
   - Update status to "In Progress"
   - Complete the task
   - Test thoroughly

3. **Completion Phase**
   - Move task to `completed.md`
   - Add completion date
   - Update any dependent tasks
   - Commit changes to git

## 💡 Tips

- Keep descriptions clear and actionable
- Update estimated times based on actual completion time
- Add notes about challenges or learnings
- Reference commit hashes for completed tasks
- Review completed tasks regularly for patterns

## 📈 Tracking Progress

Current sprint focus is tracked at the top of `pending.md`.
Review weekly to:
- Reassess priorities
- Update estimates
- Add new tasks discovered
- Archive old completed tasks (monthly)

---

**Last Updated:** 2025-11-07
**Maintained By:** Development Team
