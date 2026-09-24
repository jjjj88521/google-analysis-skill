import { getGtmClient } from "./client.js";

export async function listContainers(accountId: string) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.list({
    parent: `accounts/${accountId}`,
  });
  return (res.data.container ?? []).map((c) => ({
    containerId: c.containerId,
    name: c.name,
    publicId: c.publicId,
    usageContext: c.usageContext,
    path: c.path,
  }));
}

export async function getContainer(accountId: string, containerId: string) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.get({
    path: `accounts/${accountId}/containers/${containerId}`,
  });
  return res.data;
}
