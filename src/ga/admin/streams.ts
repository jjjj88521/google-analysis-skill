import { getGaAdminClient } from "../client.js";

export async function listDataStreams(propertyId: string) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.dataStreams.list({
    parent: `properties/${propertyId}`,
  });
  return (res.data.dataStreams ?? []).map((s) => ({
    name: s.name,
    displayName: s.displayName,
    type: s.type,
    webStreamData: s.webStreamData,
    androidAppStreamData: s.androidAppStreamData,
    iosAppStreamData: s.iosAppStreamData,
    createTime: s.createTime,
    updateTime: s.updateTime,
  }));
}
