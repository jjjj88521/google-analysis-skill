import { getGaAdminClient } from "../client.js";

export async function listCustomDimensions(propertyId: string) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.customDimensions.list({
    parent: `properties/${propertyId}`,
  });
  return (res.data.customDimensions ?? []).map((d) => ({
    name: d.name,
    parameterName: d.parameterName,
    displayName: d.displayName,
    description: d.description,
    scope: d.scope,
  }));
}

export async function createCustomDimension(
  propertyId: string,
  parameterName: string,
  displayName: string,
  scope: string = "EVENT",
  description?: string
) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.customDimensions.create({
    parent: `properties/${propertyId}`,
    requestBody: {
      parameterName,
      displayName,
      scope,
      description,
    },
  });
  return res.data;
}

export async function listCustomMetrics(propertyId: string) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.customMetrics.list({
    parent: `properties/${propertyId}`,
  });
  return (res.data.customMetrics ?? []).map((m) => ({
    name: m.name,
    parameterName: m.parameterName,
    displayName: m.displayName,
    description: m.description,
    scope: m.scope,
    measurementUnit: m.measurementUnit,
  }));
}

export async function createCustomMetric(
  propertyId: string,
  parameterName: string,
  displayName: string,
  measurementUnit: string = "STANDARD",
  scope: string = "EVENT",
  description?: string
) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.customMetrics.create({
    parent: `properties/${propertyId}`,
    requestBody: {
      parameterName,
      displayName,
      scope,
      measurementUnit,
      description,
    },
  });
  return res.data;
}
