---
name: Google Analytics & Tag Manager Skill
description: Query GA4 reports, manage GTM tags/triggers/variables, and administer GA4 properties via CLI commands.
---

# Google Analytics & Tag Manager Skill

You are an expert at Google Analytics 4 (GA4) and Google Tag Manager (GTM). You can run reports, manage tags, and administer GA4 properties using the CLI tool in this project.

## Prerequisites

Before using any command, authentication must be configured:

1. **Service Account**: Set `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` in `.env` pointing to a service account JSON key.
2. **OAuth2**: Run `auth login` to authenticate via browser.

Check status with:
```bash
ga-skill auth status
```

## Available Commands

### Authentication
| Command | Description |
|---------|-------------|
| `auth login` | Login via OAuth2 browser flow |
| `auth service-account --file <path>` | Verify a service account key file |
| `auth status` | Show current auth method |
| `auth logout` | Clear cached OAuth2 tokens |

### Google Tag Manager (GTM)

#### Accounts & Containers
```bash
# List all GTM accounts
ga-skill gtm accounts list

# List containers under an account
ga-skill gtm containers list --account <ACCOUNT_ID>
```

#### Workspaces
```bash
# List workspaces
ga-skill gtm workspaces list --account <ACCOUNT_ID> --container <CONTAINER_ID>

# Create a workspace
ga-skill gtm workspaces create --account <ACCOUNT_ID> --container <CONTAINER_ID> --name "My Workspace"

# Sync a workspace
ga-skill gtm workspaces sync --account <ACCOUNT_ID> --container <CONTAINER_ID> --workspace <WORKSPACE_ID>
```

#### Tags
```bash
# List tags
ga-skill gtm tags list --account <ACCOUNT_ID> --container <CONTAINER_ID> --workspace <WORKSPACE_ID>

# Create a tag (pass JSON body)
ga-skill gtm tags create --account <ACCOUNT_ID> --container <CONTAINER_ID> --workspace <WORKSPACE_ID> --body '{"name":"My Tag","type":"html","parameter":[{"type":"TEMPLATE","key":"html","value":"<script>console.log(1)</script>"}]}'

# Update a tag
ga-skill gtm tags update --path "accounts/123/containers/456/workspaces/1/tags/789" --body '{"name":"Updated Tag"}'

# Delete a tag
ga-skill gtm tags delete --path "accounts/123/containers/456/workspaces/1/tags/789"
```

#### Triggers
```bash
# List triggers
ga-skill gtm triggers list --account <ACCOUNT_ID> --container <CONTAINER_ID> --workspace <WORKSPACE_ID>

# Create a trigger
ga-skill gtm triggers create --account <ACCOUNT_ID> --container <CONTAINER_ID> --workspace <WORKSPACE_ID> --body '{"name":"Page View Trigger","type":"PAGEVIEW"}'

# Update / Delete (same pattern as tags, use --path and --body)
```

#### Variables
```bash
# List variables
ga-skill gtm variables list --account <ACCOUNT_ID> --container <CONTAINER_ID> --workspace <WORKSPACE_ID>

# Create a variable
ga-skill gtm variables create --account <ACCOUNT_ID> --container <CONTAINER_ID> --workspace <WORKSPACE_ID> --body '{"name":"Click URL","type":"v"}'
```

#### Versions & Publishing
```bash
# List versions
ga-skill gtm versions list --account <ACCOUNT_ID> --container <CONTAINER_ID>

# Create a version from workspace
ga-skill gtm versions create --account <ACCOUNT_ID> --container <CONTAINER_ID> --workspace <WORKSPACE_ID> --name "v1.0"

# Publish a version
# NOTE: the flag is --version-id, not --version (--version is reserved by the CLI itself)
ga-skill gtm versions publish --account <ACCOUNT_ID> --container <CONTAINER_ID> --version-id <VERSION_ID>
```

Publishing is per-container: run the command once for each container (e.g. DEV and PROD).
Verify afterwards with `ga-skill gtm versions list`; a publish that only prints a version
number and exits 0 without JSON output did **not** publish.

### Google Analytics 4 (GA4)

#### Reports
```bash
# Run a report
ga-skill ga report run \
  --property <PROPERTY_ID> \
  --start 7daysAgo --end yesterday \
  --dimensions date,country \
  --metrics activeUsers,sessions \
  --limit 50

# Realtime report
ga-skill ga report realtime --property <PROPERTY_ID>

# Batch reports (from JSON config file)
ga-skill ga report batch --property <PROPERTY_ID> --config batch-config.json
```

Batch config file format:
```json
[
  {
    "startDate": "7daysAgo",
    "endDate": "yesterday",
    "dimensions": ["date"],
    "metrics": ["activeUsers"]
  },
  {
    "startDate": "30daysAgo",
    "endDate": "yesterday",
    "dimensions": ["country"],
    "metrics": ["sessions", "conversions"]
  }
]
```

#### Admin – Properties
```bash
# List properties
ga-skill ga admin properties list --filter "parent:accounts/123456"

# Get a property
ga-skill ga admin properties get --property <PROPERTY_ID>
```

#### Admin – Data Streams
```bash
ga-skill ga admin streams list --property <PROPERTY_ID>
```

#### Admin – Key Events
```bash
# List key events
ga-skill ga admin key-events list --property <PROPERTY_ID>

# Create a key event
ga-skill ga admin key-events create --property <PROPERTY_ID> --event-name "purchase"

# Delete a key event
ga-skill ga admin key-events delete --name "properties/123/keyEvents/456"
```

#### Admin – Custom Dimensions & Metrics
```bash
# List custom dimensions
ga-skill ga admin dimensions list --property <PROPERTY_ID>

# Create a custom dimension
ga-skill ga admin dimensions create --property <PROPERTY_ID> --parameter-name "user_type" --display-name "User Type" --scope EVENT

# List custom metrics
ga-skill ga admin metrics list --property <PROPERTY_ID>

# Create a custom metric
ga-skill ga admin metrics create --property <PROPERTY_ID> --parameter-name "score" --display-name "Score" --unit STANDARD
```

## Output Formats

All list/report commands support `--format` (global option):

```bash
# Table (default)
ga-skill gtm accounts list --format table

# JSON
ga-skill gtm accounts list --format json

# CSV
ga-skill gtm accounts list --format csv
```

## Common Workflows

### 1. Set up a new GA4 event tracking tag in GTM
1. List accounts → pick account ID
2. List containers → pick container ID
3. List/create workspace
4. Create trigger (e.g., custom event)
5. Create tag with the trigger
6. Create version → publish

### 2. Analyze weekly traffic
```bash
ga-skill ga report run --property 123456 --start 7daysAgo --end yesterday --dimensions date --metrics activeUsers,sessions --format table
```

### 3. Monitor realtime users
```bash
ga-skill ga report realtime --property 123456 --dimensions unifiedScreenName --metrics activeUsers
```
