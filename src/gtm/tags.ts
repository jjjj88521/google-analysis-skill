import { getGtmClient, workspacePath } from "./client.js";
import type { tagmanager_v2 } from "googleapis";

export async function listTags(
  accountId: string,
  containerId: string,
  workspaceId: string
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.tags.list({
    parent: workspacePath(accountId, containerId, workspaceId),
  });
  return (res.data.tag ?? []).map((t) => ({
    tagId: t.tagId,
    name: t.name,
    type: t.type,
    firingTriggerId: t.firingTriggerId,
    path: t.path,
  }));
}

export async function getTag(tagPath: string) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.tags.get({
    path: tagPath,
  });
  return res.data;
}

export async function createTag(
  accountId: string,
  containerId: string,
  workspaceId: string,
  body: tagmanager_v2.Schema$Tag
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.tags.create({
    parent: workspacePath(accountId, containerId, workspaceId),
    requestBody: body,
  });
  return res.data;
}

export async function updateTag(
  tagPath: string,
  body: tagmanager_v2.Schema$Tag
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.tags.update({
    path: tagPath,
    requestBody: body,
  });
  return res.data;
}

export async function deleteTag(tagPath: string) {
  const gtm = await getGtmClient();
  await gtm.accounts.containers.workspaces.tags.delete({ path: tagPath });
}
