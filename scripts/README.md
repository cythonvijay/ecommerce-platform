# scripts/

Top-level automation scripts that operate **across** frontend/backend/database
(local dev bootstrap, combined lint/test runners). Module-specific scripts
(DB seeding, admin bootstrap) live inside `backend/scripts/` instead.

Populated in a later step:
- `setup_local_env.sh` — one-shot local dev bootstrap (venv, npm install, .env copy)
- `run_all_tests.sh` — run backend + frontend test suites
- `lint_all.sh` — run backend + frontend linters
