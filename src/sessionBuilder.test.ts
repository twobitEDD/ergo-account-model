import assert from "node:assert/strict";
import test from "node:test";
import { buildAccountSession } from "./sessionBuilder";

test("marks vault sessions as self-custody ready", () => {
  const session = buildAccountSession({
    walletConnected: true,
    walletSource: "vault",
    ergoAddress: "9abc",
    dynamicUser: { email: "user@example.com" },
    accountId: "acct_123",
    vault: {
      ergoAddress: "9abc",
      hasPasskeyWrap: true,
      hasRecoveryWrap: true,
      createdAt: Date.now(),
    },
    nautilusApiAvailable: true,
  });

  assert.equal(session.identity.authority, "self-custody-vault");
  assert.equal(session.identity.accountId, "acct_123");
  assert.equal(session.isSelfCustodyReady, true);
  assert.equal(session.migration.canExportEncryptedVault, true);
  assert.equal(session.migration.canUseRecoveryPhrase, true);
  assert.equal(session.state?.accountType, "WALLET_BOUND");
  assert.equal(session.conversion?.conversionState, "completed");
});

test("marks nautilus-direct sessions as dynamic-optional", () => {
  const session = buildAccountSession({
    walletConnected: true,
    walletSource: "nautilus-direct",
    ergoAddress: "9xyz",
    dynamicUser: null,
    vault: null,
    nautilusApiAvailable: true,
  });

  assert.equal(session.identity.authority, "nautilus-eip12");
  assert.equal(session.isDynamicAuthenticated, false);
  assert.equal(session.migration.canRunWithoutDynamic, true);
  assert.equal(session.state?.accountType, "WALLET_BOUND");
});

test("keeps legacy status behavior while adding canonical identity fields", () => {
  const session = buildAccountSession({
    walletConnected: false,
    walletSource: null,
    ergoAddress: null,
    dynamicUser: { id: "dyn_7", email: "guest@example.com", externalAuthRef: "dynamic:dyn_7" },
    accountId: null,
    vault: null,
    nautilusApiAvailable: true,
  });

  assert.equal(session.status, "disconnected");
  assert.equal(session.identity.userHandle, "guest@example.com");
  assert.equal(session.identity.accountId, "dyn_7");
  assert.equal(session.identity.externalAuthRef, "dynamic:dyn_7");
  assert.equal(session.state?.accountType, "REGISTERED");
  assert.equal(session.conversion?.targetType, "WALLET_BOUND");
  assert.equal(session.conversion?.conversionState, "eligible");
});
