import test from "node:test";
import assert from "node:assert/strict";
import { buildAccountSession } from "./sessionBuilder";
import { buildAccountLifecycleSnapshot } from "./lifecycle";

test("buildAccountLifecycleSnapshot reports migratable sovereignty posture", () => {
  const session = buildAccountSession({
    walletConnected: true,
    walletSource: "vault",
    ergoAddress: "9f_test_address",
    dynamicUser: { id: "dyn_1", email: "player@example.com" },
    vault: {
      ergoAddress: "9f_test_address",
      hasPasskeyWrap: true,
      hasRecoveryWrap: true,
      createdAt: Date.now(),
    },
    nautilusApiAvailable: true,
  });

  const snapshot = buildAccountLifecycleSnapshot({
    session,
    bootstrapSource: "dynamic-bridge",
    walletBound: true,
  });

  assert.equal(snapshot.stage, "migratable");
  assert.equal(snapshot.derivedStage, "migratable");
  assert.equal(snapshot.bootstrapSource, "dynamic-bridge");
  assert.equal(snapshot.canMigrateWithoutProviderLockIn, true);
  assert.equal(snapshot.dimensions.accountType, "WALLET_BOUND");
  assert.equal(snapshot.dimensions.hasWalletBinding, true);
  assert.ok(snapshot.sovereigntyScore >= 60);
  assert.ok(snapshot.indicators.includes("provider-portable"));
});
