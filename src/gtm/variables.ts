import { getGtmClient, workspacePath } from "./client.js";
import type { tagmanager_v2 } from "googleapis";

export async function listVariables(
  accountId: string,
  containerId: string,
  workspaceId: string
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.variables.list({
    parent: workspacePath(accountId, containerId, workspaceId),
  });
  return (res.data.variable ?? []).map((v) => ({
    variableId: v.variableId,
    name: v.name,
    type: v.type,
    path: v.path,
  }));
}

export async function getVariable(variablePath: string) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.variables.get({
    path: variablePath,
  });
  return res.data;
}

export async function createVariable(
  accountId: string,
  containerId: string,
  workspaceId: string,
  body: tagmanager_v2.Schema$Variable
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.variables.create({
    parent: workspacePath(accountId, containerId, workspaceId),
    requestBody: body,
  });
  return res.data;
}

export async function updateVariable(
  variablePath: string,
  body: tagmanager_v2.Schema$Variable
) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.containers.workspaces.variables.update({
    path: variablePath,
    requestBody: body,
  });
  return res.data;
}

export async function deleteVariable(variablePath: string) {
  const gtm = await getGtmClient();
  await gtm.accounts.containers.workspaces.variables.delete({
    path: variablePath,
  });
}
