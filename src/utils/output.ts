import Table from "cli-table3";
import chalk from "chalk";

export type OutputFormat = "table" | "json" | "csv";

export function formatOutput(
  data: Record<string, unknown>[],
  format: OutputFormat,
  columns?: { key: string; label: string }[]
): string {
  if (!data || data.length === 0) {
    return chalk.yellow("No data found.");
  }

  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);
    case "csv":
      return formatCsv(data, columns);
    case "table":
    default:
      return formatTable(data, columns);
  }
}

function formatTable(
  data: Record<string, unknown>[],
  columns?: { key: string; label: string }[]
): string {
  const cols = columns ?? inferColumns(data);
  const table = new Table({
    head: cols.map((c) => chalk.cyan(c.label)),
    style: { head: [], border: [] },
  });

  for (const row of data) {
    table.push(cols.map((c) => String(row[c.key] ?? "")));
  }

  return table.toString();
}

function formatCsv(
  data: Record<string, unknown>[],
  columns?: { key: string; label: string }[]
): string {
  const cols = columns ?? inferColumns(data);
  const header = cols.map((c) => escapeCsvField(c.label)).join(",");
  const rows = data.map((row) =>
    cols.map((c) => escapeCsvField(String(row[c.key] ?? ""))).join(",")
  );
  return [header, ...rows].join("\n");
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function inferColumns(
  data: Record<string, unknown>[]
): { key: string; label: string }[] {
  const keys = Object.keys(data[0]);
  return keys.map((k) => ({ key: k, label: k }));
}

export function printOutput(
  data: Record<string, unknown>[],
  format: OutputFormat,
  columns?: { key: string; label: string }[]
): void {
  console.log(formatOutput(data, format, columns));
}

export function printSuccess(message: string): void {
  console.log(chalk.green("✓ ") + message);
}

export function printError(message: string): void {
  console.error(chalk.red("✗ ") + message);
}

export function printInfo(message: string): void {
  console.log(chalk.blue("ℹ ") + message);
}
