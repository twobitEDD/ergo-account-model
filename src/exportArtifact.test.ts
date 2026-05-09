import assert from "node:assert/strict";
import test from "node:test";
import { buildAccountSession } from "./sessionBuilder";
import { buildAccountExportArtifact } from "./exportArtifact";

test("buildAccountExportArtifact includes encrypted vault when provided", () => {
  const session = buildAccountSession({
    walletConnected: true,
    walletSource: "vault",
    ergoAddress: "9vault",
    dynamicUser: { email: "vault@example.com" },
    vault: {
      ergoAddress: "9vault",
      hasPasskeyWrap: true,
      hasRecoveryWrap: true,
      createdAt: 1000,
    },
    nautilusApiAvailable: true,
  });

  const artifact = buildAccountExportArtifact({
    session,
    appId: "ergo-games-day1",
    walletBinding: {
      ergoAddress: "9vault",
      walletStatus: "bound_stub",
    },
    encryptedVault: {
      format: "ergo-dynamic-vault-v1",
      source: "local-storage",
      payload: {
        v: 1,
        ergoAddress: "9vault",
      },
    },
    exportedAt: new Date("2026-01-01T00:00:00.000Z"),
  });

  assert.equal(artifact.schema, "ergo-account-export");
  assert.equal(artifact.schemaVersion, 1);
  assert.equal(artifact.exportedAt, "2026-01-01T00:00:00.000Z");
  assert.equal(artifact.encryptedVault?.format, "ergo-dynamic-vault-v1");
  assert.equal(artifact.walletBinding.walletStatus, "bound_stub");
});

