import { getGtmClient, workspacePath } from "./client.js";
import type { tagmanager_v2 } from "googleapis";

export async function listTriggers(
  accountId: string,
  containerId: string,
  workspaceId: string
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.triggers.list({
    parent: workspacePath(accountId, containerId, workspaceId),
  });
  return (res.data.trigger ?? []).map((t) => ({
    triggerId: t.triggerId,
    name: t.name,
    type: t.type,
    path: t.path,
  }));
}

export async function getTrigger(triggerPath: string) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.triggers.get({
    path: triggerPath,
  });
  return res.data;
}

export async function createTrigger(
  accountId: string,
  containerId: string,
  workspaceId: string,
  body: tagmanager_v2.Schema$Trigger
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.triggers.create({
    parent: workspacePath(accountId, containerId, workspaceId),
    requestBody: body,
  });
  return res.data;
}

export async function updateTrigger(
  triggerPath: string,
  body: tagmanager_v2.Schema$Trigger
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.triggers.update({
    path: triggerPath,
    requestBody: body,
  });
  return res.data;
}

export async function deleteTrigger(triggerPath: string) {
  const gtm = await getGtmClient();
  await gtm.accounts.containers.workspaces.triggers.delete({
    path: triggerPath,
  });
}
