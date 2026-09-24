import { getGaAdminClient } from "../client.js";

export async function listKeyEvents(propertyId: string) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.keyEvents.list({
    parent: `properties/${propertyId}`,
  });
  return (res.data.keyEvents ?? []).map((k) => ({
    name: k.name,
    eventName: k.eventName,
    createTime: k.createTime,
    countingMethod: k.countingMethod,
    custom: k.custom,
  }));
}

export async function createKeyEvent(
  propertyId: string,
  eventName: string,
  countingMethod: string = "ONCE_PER_EVENT"
) {
  const admin = await getGaAdminClient();
  const res = await admin.properties.keyEvents.create({
    parent: `properties/${propertyId}`,
    requestBody: {
      eventName,
      countingMethod,
    },
  });
  return res.data;
}

export async function deleteKeyEvent(keyEventName: string) {
  const admin = await getGaAdminClient();
  await admin.properties.keyEvents.delete({ name: keyEventName });
}
