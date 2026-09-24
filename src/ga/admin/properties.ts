import { getGaAdminClient } from "../client.js";

export async function listProperties(filter?: string) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.list({
    filter: filter || undefined,
  });
  return (res.data.properties ?? []).map((p) => ({
    name: p.name,
    displayName: p.displayName,
    propertyType: p.propertyType,
    createTime: p.createTime,
    timeZone: p.timeZone,
    currencyCode: p.currencyCode,
    industryCategory: p.industryCategory,
  }));
}

export async function getProperty(propertyId: string) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.get({
    name: `properties/${propertyId}`,
  });
  return res.data;
}
