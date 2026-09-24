import { getGaDataClient } from "./client.js";

export interface ReportRequest {
  propertyId: string;
  startDate: string;
  endDate: string;
  dimensions: string[];
  metrics: string[];
  limit?: number;
  offset?: number;
  orderBy?: string;
  dimensionFilter?: string;
}

export async function runReport(req: ReportRequest) {
  const client = await getGaDataClient();
  const res = await client.properties.runReport({
    property: `properties/${req.propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: req.startDate, endDate: req.endDate }],
      dimensions: req.dimensions.map((d) => ({ name: d })),
      metrics: req.metrics.map((m) => ({ name: m })),
      limit: req.limit ? String(req.limit) : undefined,
      offset: req.offset ? String(req.offset) : undefined,
    },
  });

  const dimensionHeaders =
    res.data.dimensionHeaders?.map((h) => h.name ?? "") ?? [];
  const metricHeaders =
    res.data.metricHeaders?.map((h) => h.name ?? "") ?? [];

  const rows = (res.data.rows ?? []).map((row) => {
    const obj: Record<string, string> = {};
    (row.dimensionValues ?? []).forEach((v, i) => {
      obj[dimensionHeaders[i]] = v.value ?? "";
    });
    (row.metricValues ?? []).forEach((v, i) => {
      obj[metricHeaders[i]] = v.value ?? "";
    });
    return obj;
  });

  return {
    rows,
    rowCount: res.data.rowCount,
    metadata: res.data.metadata,
  };
}

export interface BatchReportConfig {
  propertyId: string;
  requests: {
    startDate: string;
    endDate: string;
    dimensions: string[];
    metrics: string[];
  }[];
}

export async function batchRunReports(config: BatchReportConfig) {
  const client = await getGaDataClient();
  const res = await client.properties.batchRunReports({
    property: `properties/${config.propertyId}`,
    requestBody: {
      requests: config.requests.map((r) => ({
        dateRanges: [{ startDate: r.startDate, endDate: r.endDate }],
        dimensions: r.dimensions.map((d) => ({ name: d })),
        metrics: r.metrics.map((m) => ({ name: m })),
      })),
    },
  });

  return (res.data.reports ?? []).map((report, idx) => {
    const dimensionHeaders =
      report.dimensionHeaders?.map((h) => h.name ?? "") ?? [];
    const metricHeaders =
      report.metricHeaders?.map((h) => h.name ?? "") ?? [];

    const rows = (report.rows ?? []).map((row) => {
      const obj: Record<string, string> = {};
      (row.dimensionValues ?? []).forEach((v, i) => {
        obj[dimensionHeaders[i]] = v.value ?? "";
      });
      (row.metricValues ?? []).forEach((v, i) => {
        obj[metricHeaders[i]] = v.value ?? "";
      });
      return obj;
    });

    return { reportIndex: idx, rows, rowCount: report.rowCount };
  });
}
