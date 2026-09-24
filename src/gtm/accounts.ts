import { getGtmClient } from "./client.js";

export async function listAccounts() {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.list();
  return (res.data.account ?? []).map((a) => ({
    accountId: a.accountId,
    name: a.name,
    path: a.path,
    fingerprint: a.fingerprint,
  }));
}

export async function getAccount(accountId: string) {
  const gtm = await getGtmClient();
  const res = await gtm.accounts.get({ path: `accounts/${accountId}` });
  return res.data;
}
