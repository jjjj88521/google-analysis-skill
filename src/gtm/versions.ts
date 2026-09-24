import { getGtmClient } from "./client.js";

export async function listVersions(accountId: string, containerId: string) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.version_headers.list({
    parent: `accounts/${accountId}/containers/${containerId}`,
  });
  return (res.data.containerVersionHeader ?? []).map((v) => ({
    containerVersionId: v.containerVersionId,
    name: v.name,
    numTags: v.numTags,
    numTriggers: v.numTriggers,
    numVariables: v.numVariables,
    path: v.path,
  }));
}

export async function createVersion(
  accountId: string,
  containerId: string,
  workspaceId: string,
  name?: string
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.create_version({
    path: `accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
    requestBody: { name },
  });
  return res.data;
}

export async function publishVersion(
  accountId: string,
  containerId: string,
  versionId: string
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.versions.publish({
    path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
  });
  return res.data;
}

export async function getVersion(
  accountId: string,
  containerId: string,
  versionId: string
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.versions.get({
    path: `accounts/${accountId}/containers/${containerId}/versions/${versionId}`,
  });
  return res.data;
}
