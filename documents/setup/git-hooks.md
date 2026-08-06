# Git Hooks Setup

This repository uses custom Git hooks stored in `.githooks/` to enforce code quality, linting, type-checking, and build stability across the monorepo (`frontend` and `backend`).

## Configuration

Git has been configured to use `.githooks/` as its hooks directory:

```bash
git config core.hooksPath .githooks
```

Hooks are also duplicated to `.git/hooks/` for compatibility.

## Included Hooks

### 1. `pre-commit` ([.githooks/pre-commit](file:///.githooks/pre-commit))
Executes fast checks before code is committed:
- **Conflict Marker Check**: Scans staged files for unresolved Git merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
- **Frontend Staged Linting**: Runs ESLint on modified/staged JavaScript and TypeScript files in `frontend/`.
- **Frontend Typecheck**: Executes TypeScript compiler check (`npm run typecheck`) in `frontend/`.
- **Backend Typecheck**: Executes TypeScript compiler check (`npm run typecheck`) in `backend/`.

### 2. `pre-push` ([.githooks/pre-push](file:///.githooks/pre-push))
Executes full build verification before code is pushed to a remote repository:
- **Frontend Production Build**: Executes `npm run build` in `frontend/`.
- **Backend Production Build**: Executes `prisma generate && tsc` (`npm run build`) in `backend/`.

## Manual Setup / Re-installation

If cloning on a new machine, configure Git hooks by running:

```bash
chmod +x .githooks/pre-commit .githooks/pre-push
git config core.hooksPath .githooks
```

## Bypassing Hooks (Emergency Only)

If you need to bypass hooks temporarily (e.g., WIP commits or emergency hotfixes):

- Bypass pre-commit: `git commit -m "wip" --no-verify`
- Bypass pre-push: `git push --no-verify`
