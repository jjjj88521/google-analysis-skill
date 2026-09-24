import { getGaDataClient } from "./client.js";

export async function runRealtimeReport(
  propertyId: string,
  dimensions: string[] = ["unifiedScreenName"],
  metrics: string[] = ["activeUsers"]
) {
  const client = await getGaDataClient();
  const res = await client.properties.runRealtimeReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dimensions: dimensions.map((d) => ({ name: d })),
      metrics: metrics.map((m) => ({ name: m })),
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

  return { rows, rowCount: res.data.rowCount };
}
