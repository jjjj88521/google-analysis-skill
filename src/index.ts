#!/usr/bin/env node
import { Command } from "commander";
import { loginOAuth, logout, getAuthStatus } from "./auth/index.js";
import { listAccounts } from "./gtm/accounts.js";
import { listContainers } from "./gtm/containers.js";
import {
  listWorkspaces,
  createWorkspace,
  syncWorkspace,
} from "./gtm/workspaces.js";
import { listTags, createTag, updateTag, deleteTag } from "./gtm/tags.js";
import {
  listTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
} from "./gtm/triggers.js";
import {
  listVariables,
  createVariable,
  updateVariable,
  deleteVariable,
} from "./gtm/variables.js";
import {
  listVersions,
  createVersion,
  publishVersion,
} from "./gtm/versions.js";
import { runReport, batchRunReports } from "./ga/reporting.js";
import { runRealtimeReport } from "./ga/realtime.js";
import { listProperties, getProperty } from "./ga/admin/properties.js";
import { listDataStreams } from "./ga/admin/streams.js";
import {
  listKeyEvents,
  createKeyEvent,
  deleteKeyEvent,
} from "./ga/admin/key-events.js";
import {
  listCustomDimensions,
  createCustomDimension,
  listCustomMetrics,
  createCustomMetric,
} from "./ga/admin/custom-definitions.js";
import {
  printOutput,
  printSuccess,
  printError,
  printInfo,
  type OutputFormat,
} from "./utils/output.js";
import { readFileSync } from "node:fs";

const program = new Command();

program
  .name("ga-skill")
  .description("CLI for Google Tag Manager & Google Analytics 4")
  .version("1.0.0");

// ─── Global option ───────────────────────────────────────────
program.option("-f, --format <format>", "Output format: table | json | csv", "table");

function fmt(cmd: Command): OutputFormat {
  const root = cmd.optsWithGlobals();
  return (root.format as OutputFormat) ?? "table";
}

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════
const auth = program.command("auth").description("Authentication management");

auth
  .command("login")
  .description("Login via OAuth2 browser flow")
  .action(async () => {
    try {
      printInfo("Opening browser for OAuth2 login...");
      await loginOAuth();
      printSuccess("Successfully authenticated via OAuth2.");
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

auth
  .command("service-account")
  .description("Configure Service Account authentication")
  .requiredOption("--file <path>", "Path to service account JSON key file")
  .action(async (opts) => {
    try {
      // Validate file exists and is valid JSON
      const content = readFileSync(opts.file, "utf-8");
      JSON.parse(content);
      printSuccess(`Service account key file verified: ${opts.file}`);
      printInfo(
        "Set GOOGLE_SERVICE_ACCOUNT_KEY_FILE in your .env to use it permanently."
      );
    } catch (e: unknown) {
      printError(`Invalid service account file: ${(e as Error).message}`);
      process.exitCode = 1;
    }
  });

auth
  .command("status")
  .description("Show current authentication status")
  .action(() => {
    const status = getAuthStatus();
    if (status.method === "none") {
      printInfo("Not authenticated. Run `auth login` or `auth service-account`.");
    } else {
      printSuccess(`Auth method: ${status.method}`);
      if (status.email) printInfo(`Account: ${status.email}`);
    }
  });

auth
  .command("logout")
  .description("Clear cached OAuth2 tokens")
  .action(() => {
    logout();
    printSuccess("Logged out. Token cache cleared.");
  });

// ═══════════════════════════════════════════════════════════════
//  GTM
// ═══════════════════════════════════════════════════════════════
const gtm = program.command("gtm").description("Google Tag Manager operations");

// --- accounts ---
const gtmAccounts = gtm.command("accounts").description("GTM Account operations");
gtmAccounts
  .command("list")
  .description("List all GTM accounts")
  .action(async function (this: Command) {
    try {
      const data = await listAccounts();
      printOutput(data, fmt(this), [
        { key: "accountId", label: "Account ID" },
        { key: "name", label: "Name" },
        { key: "path", label: "Path" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// --- containers ---
const gtmContainers = gtm.command("containers").description("GTM Container operations");
gtmContainers
  .command("list")
  .description("List containers for an account")
  .requiredOption("--account <id>", "GTM Account ID")
  .action(async function (this: Command, opts: { account: string }) {
    try {
      const data = await listContainers(opts.account);
      printOutput(data, fmt(this), [
        { key: "containerId", label: "Container ID" },
        { key: "name", label: "Name" },
        { key: "publicId", label: "Public ID" },
        { key: "path", label: "Path" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// --- workspaces ---
const gtmWorkspaces = gtm.command("workspaces").description("GTM Workspace operations");
gtmWorkspaces
  .command("list")
  .description("List workspaces")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .action(async function (this: Command, opts: { account: string; container: string }) {
    try {
      const data = await listWorkspaces(opts.account, opts.container);
      printOutput(data, fmt(this), [
        { key: "workspaceId", label: "Workspace ID" },
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmWorkspaces
  .command("create")
  .description("Create a workspace")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--name <name>", "Workspace name")
  .option("--description <desc>", "Workspace description")
  .action(async (opts) => {
    try {
      const ws = await createWorkspace(
        opts.account,
        opts.container,
        opts.name,
        opts.description
      );
      printSuccess(`Workspace created: ${ws.name} (${ws.workspaceId})`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmWorkspaces
  .command("sync")
  .description("Sync a workspace")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--workspace <id>", "GTM Workspace ID")
  .action(async (opts) => {
    try {
      const result = await syncWorkspace(
        opts.account,
        opts.container,
        opts.workspace
      );
      printSuccess("Workspace synced.");
      if (result.mergeConflict) {
        printInfo(
          `Merge conflicts detected: ${JSON.stringify(result.mergeConflict)}`
        );
      }
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// --- tags ---
const gtmTags = gtm.command("tags").description("GTM Tag operations");
gtmTags
  .command("list")
  .description("List tags in a workspace")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--workspace <id>", "GTM Workspace ID")
  .action(async function (this: Command, opts: { account: string; container: string; workspace: string }) {
    try {
      const data = await listTags(opts.account, opts.container, opts.workspace);
      printOutput(data, fmt(this), [
        { key: "tagId", label: "Tag ID" },
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmTags
  .command("create")
  .description("Create a tag from JSON")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--workspace <id>", "GTM Workspace ID")
  .requiredOption("--body <json>", "Tag JSON body")
  .action(async (opts) => {
    try {
      const body = JSON.parse(opts.body);
      const tag = await createTag(opts.account, opts.container, opts.workspace, body);
      printSuccess(`Tag created: ${tag.name} (${tag.tagId})`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmTags
  .command("update")
  .description("Update a tag")
  .requiredOption("--path <path>", "Full tag path")
  .requiredOption("--body <json>", "Tag JSON body")
  .action(async (opts) => {
    try {
      const body = JSON.parse(opts.body);
      const tag = await updateTag(opts.path, body);
      printSuccess(`Tag updated: ${tag.name}`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmTags
  .command("delete")
  .description("Delete a tag")
  .requiredOption("--path <path>", "Full tag path")
  .action(async (opts) => {
    try {
      await deleteTag(opts.path);
      printSuccess("Tag deleted.");
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// --- triggers ---
const gtmTriggers = gtm.command("triggers").description("GTM Trigger operations");
gtmTriggers
  .command("list")
  .description("List triggers in a workspace")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--workspace <id>", "GTM Workspace ID")
  .action(async function (this: Command, opts: { account: string; container: string; workspace: string }) {
    try {
      const data = await listTriggers(opts.account, opts.container, opts.workspace);
      printOutput(data, fmt(this), [
        { key: "triggerId", label: "Trigger ID" },
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmTriggers
  .command("create")
  .description("Create a trigger from JSON")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--workspace <id>", "GTM Workspace ID")
  .requiredOption("--body <json>", "Trigger JSON body")
  .action(async (opts) => {
    try {
      const body = JSON.parse(opts.body);
      const trigger = await createTrigger(opts.account, opts.container, opts.workspace, body);
      printSuccess(`Trigger created: ${trigger.name} (${trigger.triggerId})`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmTriggers
  .command("update")
  .description("Update a trigger")
  .requiredOption("--path <path>", "Full trigger path")
  .requiredOption("--body <json>", "Trigger JSON body")
  .action(async (opts) => {
    try {
      const body = JSON.parse(opts.body);
      const trigger = await updateTrigger(opts.path, body);
      printSuccess(`Trigger updated: ${trigger.name}`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmTriggers
  .command("delete")
  .description("Delete a trigger")
  .requiredOption("--path <path>", "Full trigger path")
  .action(async (opts) => {
    try {
      await deleteTrigger(opts.path);
      printSuccess("Trigger deleted.");
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// --- variables ---
const gtmVariables = gtm.command("variables").description("GTM Variable operations");
gtmVariables
  .command("list")
  .description("List variables in a workspace")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--workspace <id>", "GTM Workspace ID")
  .action(async function (this: Command, opts: { account: string; container: string; workspace: string }) {
    try {
      const data = await listVariables(opts.account, opts.container, opts.workspace);
      printOutput(data, fmt(this), [
        { key: "variableId", label: "Variable ID" },
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmVariables
  .command("create")
  .description("Create a variable from JSON")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--workspace <id>", "GTM Workspace ID")
  .requiredOption("--body <json>", "Variable JSON body")
  .action(async (opts) => {
    try {
      const body = JSON.parse(opts.body);
      const v = await createVariable(opts.account, opts.container, opts.workspace, body);
      printSuccess(`Variable created: ${v.name} (${v.variableId})`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmVariables
  .command("update")
  .description("Update a variable")
  .requiredOption("--path <path>", "Full variable path")
  .requiredOption("--body <json>", "Variable JSON body")
  .action(async (opts) => {
    try {
      const body = JSON.parse(opts.body);
      const v = await updateVariable(opts.path, body);
      printSuccess(`Variable updated: ${v.name}`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmVariables
  .command("delete")
  .description("Delete a variable")
  .requiredOption("--path <path>", "Full variable path")
  .action(async (opts) => {
    try {
      await deleteVariable(opts.path);
      printSuccess("Variable deleted.");
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// --- versions ---
const gtmVersions = gtm.command("versions").description("GTM Version operations");
gtmVersions
  .command("list")
  .description("List container versions")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .action(async function (this: Command, opts: { account: string; container: string }) {
    try {
      const data = await listVersions(opts.account, opts.container);
      printOutput(data, fmt(this), [
        { key: "containerVersionId", label: "Version ID" },
        { key: "name", label: "Name" },
        { key: "numTags", label: "Tags" },
        { key: "numTriggers", label: "Triggers" },
        { key: "numVariables", label: "Variables" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmVersions
  .command("create")
  .description("Create a new container version from a workspace")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--workspace <id>", "GTM Workspace ID")
  .option("--name <name>", "Version name")
  .action(async (opts) => {
    try {
      const result = await createVersion(
        opts.account,
        opts.container,
        opts.workspace,
        opts.name
      );
      printSuccess(`Version created.`);
      console.log(JSON.stringify(result, null, 2));
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gtmVersions
  .command("publish")
  .description("Publish a container version")
  .requiredOption("--account <id>", "GTM Account ID")
  .requiredOption("--container <id>", "GTM Container ID")
  .requiredOption("--version-id <id>", "Version ID to publish")
  .action(async (opts) => {
    try {
      const result = await publishVersion(
        opts.account,
        opts.container,
        opts.versionId
      );
      printSuccess("Version published.");
      console.log(JSON.stringify(result, null, 2));
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// ═══════════════════════════════════════════════════════════════
//  GA
// ═══════════════════════════════════════════════════════════════
const ga = program.command("ga").description("Google Analytics 4 operations");

// --- report ---
const gaReport = ga.command("report").description("GA4 Reporting");
gaReport
  .command("run")
  .description("Run a report")
  .requiredOption("--property <id>", "GA4 Property ID")
  .requiredOption("--start <date>", "Start date (e.g. 7daysAgo, 2024-01-01)")
  .requiredOption("--end <date>", "End date (e.g. yesterday, 2024-01-31)")
  .option("--dimensions <dims>", "Comma-separated dimensions", "date")
  .option("--metrics <mets>", "Comma-separated metrics", "activeUsers,sessions")
  .option("--limit <n>", "Row limit", "100")
  .action(async function (this: Command, opts: {
    property: string;
    start: string;
    end: string;
    dimensions: string;
    metrics: string;
    limit: string;
  }) {
    try {
      const result = await runReport({
        propertyId: opts.property,
        startDate: opts.start,
        endDate: opts.end,
        dimensions: opts.dimensions.split(","),
        metrics: opts.metrics.split(","),
        limit: parseInt(opts.limit, 10),
      });
      printInfo(`Total rows: ${result.rowCount ?? result.rows.length}`);
      printOutput(result.rows, fmt(this));
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gaReport
  .command("realtime")
  .description("Run a realtime report")
  .requiredOption("--property <id>", "GA4 Property ID")
  .option("--dimensions <dims>", "Comma-separated dimensions", "unifiedScreenName")
  .option("--metrics <mets>", "Comma-separated metrics", "activeUsers")
  .action(async function (this: Command, opts: { property: string; dimensions: string; metrics: string }) {
    try {
      const result = await runRealtimeReport(
        opts.property,
        opts.dimensions.split(","),
        opts.metrics.split(",")
      );
      printInfo(`Realtime rows: ${result.rowCount ?? result.rows.length}`);
      printOutput(result.rows, fmt(this));
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gaReport
  .command("batch")
  .description("Run batch reports from a JSON config file")
  .requiredOption("--property <id>", "GA4 Property ID")
  .requiredOption("--config <file>", "Path to batch config JSON file")
  .action(async function (this: Command, opts: { property: string; config: string }) {
    try {
      const configContent = readFileSync(opts.config, "utf-8");
      const requests = JSON.parse(configContent);
      const results = await batchRunReports({
        propertyId: opts.property,
        requests,
      });
      for (const report of results) {
        printInfo(`--- Report ${report.reportIndex} (${report.rowCount ?? report.rows.length} rows) ---`);
        printOutput(report.rows, fmt(this));
      }
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// --- admin ---
const gaAdmin = ga.command("admin").description("GA4 Admin operations");

// admin > properties
const gaProperties = gaAdmin.command("properties").description("GA4 Property management");
gaProperties
  .command("list")
  .description("List GA4 properties")
  .option("--filter <filter>", "Filter expression (e.g. parent:accounts/123)")
  .action(async function (this: Command, opts: { filter?: string }) {
    try {
      const data = await listProperties(opts.filter);
      printOutput(data, fmt(this), [
        { key: "name", label: "Resource Name" },
        { key: "displayName", label: "Display Name" },
        { key: "propertyType", label: "Type" },
        { key: "timeZone", label: "Time Zone" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gaProperties
  .command("get")
  .description("Get a GA4 property")
  .requiredOption("--property <id>", "GA4 Property ID")
  .action(async function (this: Command, opts: { property: string }) {
    try {
      const data = await getProperty(opts.property);
      printOutput([data as Record<string, unknown>], fmt(this));
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// admin > streams
const gaStreams = gaAdmin.command("streams").description("GA4 Data Stream management");
gaStreams
  .command("list")
  .description("List data streams for a property")
  .requiredOption("--property <id>", "GA4 Property ID")
  .action(async function (this: Command, opts: { property: string }) {
    try {
      const data = await listDataStreams(opts.property);
      printOutput(data as Record<string, unknown>[], fmt(this), [
        { key: "name", label: "Resource Name" },
        { key: "displayName", label: "Display Name" },
        { key: "type", label: "Type" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// admin > key-events
const gaKeyEvents = gaAdmin.command("key-events").description("GA4 Key Event management");
gaKeyEvents
  .command("list")
  .description("List key events for a property")
  .requiredOption("--property <id>", "GA4 Property ID")
  .action(async function (this: Command, opts: { property: string }) {
    try {
      const data = await listKeyEvents(opts.property);
      printOutput(data as Record<string, unknown>[], fmt(this), [
        { key: "name", label: "Resource Name" },
        { key: "eventName", label: "Event Name" },
        { key: "countingMethod", label: "Counting" },
        { key: "custom", label: "Custom" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gaKeyEvents
  .command("create")
  .description("Create a key event")
  .requiredOption("--property <id>", "GA4 Property ID")
  .requiredOption("--event-name <name>", "Event name")
  .option("--counting <method>", "Counting method", "ONCE_PER_EVENT")
  .action(async (opts) => {
    try {
      const ke = await createKeyEvent(
        opts.property,
        opts.eventName,
        opts.counting
      );
      printSuccess(`Key event created: ${ke.eventName}`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gaKeyEvents
  .command("delete")
  .description("Delete a key event")
  .requiredOption("--name <resourceName>", "Full resource name of the key event")
  .action(async (opts) => {
    try {
      await deleteKeyEvent(opts.name);
      printSuccess("Key event deleted.");
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// admin > dimensions
const gaDimensions = gaAdmin.command("dimensions").description("GA4 Custom Dimensions");
gaDimensions
  .command("list")
  .description("List custom dimensions")
  .requiredOption("--property <id>", "GA4 Property ID")
  .action(async function (this: Command, opts: { property: string }) {
    try {
      const data = await listCustomDimensions(opts.property);
      printOutput(data, fmt(this), [
        { key: "parameterName", label: "Parameter" },
        { key: "displayName", label: "Display Name" },
        { key: "scope", label: "Scope" },
        { key: "description", label: "Description" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gaDimensions
  .command("create")
  .description("Create a custom dimension")
  .requiredOption("--property <id>", "GA4 Property ID")
  .requiredOption("--parameter-name <name>", "Event parameter name")
  .requiredOption("--display-name <name>", "Display name")
  .option("--scope <scope>", "Scope (EVENT or USER)", "EVENT")
  .option("--description <desc>", "Description")
  .action(async (opts) => {
    try {
      const d = await createCustomDimension(
        opts.property,
        opts.parameterName,
        opts.displayName,
        opts.scope,
        opts.description
      );
      printSuccess(`Custom dimension created: ${d.displayName}`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// admin > metrics
const gaMetrics = gaAdmin.command("metrics").description("GA4 Custom Metrics");
gaMetrics
  .command("list")
  .description("List custom metrics")
  .requiredOption("--property <id>", "GA4 Property ID")
  .action(async function (this: Command, opts: { property: string }) {
    try {
      const data = await listCustomMetrics(opts.property);
      printOutput(data, fmt(this), [
        { key: "parameterName", label: "Parameter" },
        { key: "displayName", label: "Display Name" },
        { key: "scope", label: "Scope" },
        { key: "measurementUnit", label: "Unit" },
      ]);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

gaMetrics
  .command("create")
  .description("Create a custom metric")
  .requiredOption("--property <id>", "GA4 Property ID")
  .requiredOption("--parameter-name <name>", "Event parameter name")
  .requiredOption("--display-name <name>", "Display name")
  .option("--unit <unit>", "Measurement unit (STANDARD, CURRENCY, FEET, etc.)", "STANDARD")
  .option("--scope <scope>", "Scope", "EVENT")
  .option("--description <desc>", "Description")
  .action(async (opts) => {
    try {
      const m = await createCustomMetric(
        opts.property,
        opts.parameterName,
        opts.displayName,
        opts.unit,
        opts.scope,
        opts.description
      );
      printSuccess(`Custom metric created: ${m.displayName}`);
    } catch (e: unknown) {
      printError((e as Error).message);
      process.exitCode = 1;
    }
  });

// ═══════════════════════════════════════════════════════════════
program.parseAsync(process.argv);
