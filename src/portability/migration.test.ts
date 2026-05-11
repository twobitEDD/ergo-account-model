import assert from "node:assert/strict";
import test from "node:test";
import { buildAccountSession } from "../sessionBuilder";
import {
  createNoopMnemonicStrategy,
  createNoopNautilusMigrationAdapter,
  executeMigration,
  getPortabilityStatus,
  planMigration,
} from "./index";

const makeSession = (dynamic = true) =>
  buildAccountSession({
    walletConnected: true,
    walletSource: "nautilus-direct",
    ergoAddress: "9nautilus",
    accountId: dynamic ? "dynamic_1" : undefined,
    recoveryEmail: dynamic ? "dyn@example.com" : undefined,
    dynamicUser: dynamic ? { id: "dynamic_1", email: "dyn@example.com" } : null,
    providerLinks: dynamic
      ? [
          {
            providerId: "dynamic",
            subjectRef: "dynamic_1",
            status: "linked",
          },
        ]
      : undefined,
    vault: null,
    nautilusApiAvailable: false,
  });

test("getPortabilityStatus exposes mnemonic migration requirement", () => {
  const session = makeSession();
  const status = getPortabilityStatus({
    session,
    mnemonicStrategy: createNoopMnemonicStrategy(),
  });

  assert.equal(status.mnemonicExport.state, "requires-migration");
  assert.equal(status.encryptedExport.state, "requires-migration");
  assert.equal(status.serverAuthorityRef?.authority, "server-registry");
  assert.equal(status.providerLinks?.[0]?.providerId, "dynamic");
  assert.equal(status.recoveryExportHandoff.recoveryChannel, "email-service");
  assert.equal(status.recoveryExportHandoff.continuityGuaranteed, true);
});

test("planMigration reports blocked when no adapter capability", async () => {
  const session = makeSession();
  const plan = await planMigration({
    session,
    adapter: createNoopNautilusMigrationAdapter(),
  });

  assert.equal(plan.status, "blocked");
  assert.equal(plan.target.kind, "nautilus");
  assert.ok(plan.warnings.length > 0);
});

test("executeMigration returns blocked noop outcome", async () => {
  const session = makeSession(false);
  const result = await executeMigration({
    session,
    adapter: createNoopNautilusMigrationAdapter(),
  });

  assert.equal(result.status, "blocked");
  assert.equal(result.kind, "nautilus");
  assert.equal(Boolean(result.error), true);
});

