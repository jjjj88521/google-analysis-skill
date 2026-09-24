import { getGtmClient } from "./client.js";

export async function listWorkspaces(accountId: string, containerId: string) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.list({
    parent: `accounts/${accountId}/containers/${containerId}`,
  });
  return (res.data.workspace ?? []).map((w) => ({
    workspaceId: w.workspaceId,
    name: w.name,
    description: w.description,
    path: w.path,
  }));
}

export async function createWorkspace(
  accountId: string,
  containerId: string,
  name: string,
  description?: string
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.create({
    parent: `accounts/${accountId}/containers/${containerId}`,
    requestBody: { name, description },
  });
  return res.data;
}

export async function syncWorkspace(
  accountId: string,
  containerId: string,
  workspaceId: string
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.sync({
    path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
  });
  return res.data;
}
