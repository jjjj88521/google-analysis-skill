# Google Analytics & Tag Manager CLI Skill

A TypeScript CLI tool and Agent Skill for managing **Google Tag Manager (GTM)** and **Google Analytics 4 (GA4)**.

## Features

- **GTM**: List/create/update/delete accounts, containers, workspaces, tags, triggers, variables, versions
- **GA4 Reporting**: `runReport`, `batchRunReports`, realtime reports
- **GA4 Admin**: Properties, data streams, key events, custom dimensions & metrics
- **Auth**: Service Account + OAuth2 browser flow
- **Output**: Table, JSON, CSV formats

## Quick Start

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your credentials

# Build and link local command
npm run build
npm link

# Run commands
ga-skill auth status
ga-skill gtm accounts list
ga-skill ga report run --property 123456 --start 7daysAgo --end yesterday
```

## Install

```bash
# Option A: Install globally from npm (public/private registry)
npm install -g google-analysis-skill

# Option B: Install via curl script from this repository
# Replace URL with your repository path before running.
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/<branch>/scripts/install.sh | bash

# Option C: Install from a custom source (GitHub or local path)
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/<branch>/scripts/install.sh | bash -s -- --source github:owner/repo
```

## Authentication

### Option 1: Service Account
1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Set `GOOGLE_SERVICE_ACCOUNT_KEY_FILE=/path/to/key.json` in `.env`

### Option 2: OAuth2
1. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
2. Run `ga-skill auth login`
3. Complete the browser flow

## Build

```bash
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled version
```

## All Commands

Run `ga-skill --help` for the full command tree, or see [SKILL.md](.agents/skills/google-analysis/SKILL.md) for detailed documentation.

| Area | Commands |
|------|----------|
| Auth | `login`, `service-account`, `status`, `logout` |
| GTM Accounts | `list` |
| GTM Containers | `list` |
| GTM Workspaces | `list`, `create`, `sync` |
| GTM Tags | `list`, `create`, `update`, `delete` |
| GTM Triggers | `list`, `create`, `update`, `delete` |
| GTM Variables | `list`, `create`, `update`, `delete` |
| GTM Versions | `list`, `create`, `publish` |
| GA Report | `run`, `realtime`, `batch` |
| GA Admin Properties | `list`, `get` |
| GA Admin Streams | `list` |
| GA Admin Key Events | `list`, `create`, `delete` |
| GA Admin Dimensions | `list`, `create` |
| GA Admin Metrics | `list`, `create` |

## License

MIT
