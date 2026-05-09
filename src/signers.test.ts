import assert from "node:assert/strict";
import test from "node:test";
import { buildDefaultSigners, resolveSignerSnapshot } from "./signers";
import { buildAccountSession } from "./sessionBuilder";

test("buildDefaultSigners resolves dynamic-nautilus signer", () => {
  const session = buildAccountSession({
    walletConnected: true,
    walletSource: "dynamic-nautilus",
    ergoAddress: "9dynamic",
    dynamicUser: { email: "dynamic@example.com" },
    vault: null,
    nautilusApiAvailable: true,
  });

  const signers = buildDefaultSigners({
    session,
    walletConnected: true,
    walletSource: "dynamic-nautilus",
    dynamicUser: { email: "dynamic@example.com" },
    vault: null,
    nautilusApiAvailable: true,
  });

  assert.equal(signers[0]?.id, "dynamic-nautilus");
  assert.equal(signers[0]?.canSign, true);
});

test("buildDefaultSigners resolves vault signer", () => {
  const session = buildAccountSession({
    walletConnected: true,
    walletSource: "vault",
    ergoAddress: "9vault",
    dynamicUser: { email: "vault@example.com" },
    vault: {
      ergoAddress: "9vault",
      hasPasskeyWrap: true,
      hasRecoveryWrap: true,
      createdAt: Date.now(),
    },
    nautilusApiAvailable: false,
  });

  const signers = buildDefaultSigners({
    session,
    walletConnected: true,
    walletSource: "vault",
    dynamicUser: { email: "vault@example.com" },
    vault: { id: "vault-ref" },
    nautilusApiAvailable: false,
  });

  assert.equal(signers[0]?.id, "self-custody-vault");
  assert.equal(signers[0]?.mode, "direct");
});

test("resolveSignerSnapshot falls back to readonly signer", () => {
  const snapshot = resolveSignerSnapshot([]);
  assert.equal(snapshot.signers.length, 1);
  assert.equal(snapshot.activeSignerId, null);
  assert.equal(snapshot.signers[0]?.mode, "readonly");
});

