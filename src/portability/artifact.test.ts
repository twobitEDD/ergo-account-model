import assert from "node:assert/strict";
import test from "node:test";
import { buildAccountSession } from "../sessionBuilder";
import { buildAccountExportArtifact } from "../exportArtifact";
import {
  buildExportArtifact,
  parseExportArtifact,
  upgradeArtifactToV2,
  validateExportArtifact,
} from "./artifact";
import { getPortabilityStatus } from "./status";

const buildSession = () =>
  buildAccountSession({
    walletConnected: true,
    walletSource: "vault",
    ergoAddress: "9portability",
    dynamicUser: { id: "dyn_01", email: "portability@example.com" },
    accountId: "acct_portability_01",
    recoveryEmail: "portability@example.com",
    vault: {
      ergoAddress: "9portability",
      hasPasskeyWrap: true,
      hasRecoveryWrap: false,
      createdAt: 1000,
    },
    nautilusApiAvailable: true,
  });

test("buildExportArtifact builds v2 artifact with checksum and canonical identity", () => {
  const session = buildSession();
  const status = getPortabilityStatus({ session });
  const artifact = buildExportArtifact({
    session,
    portabilityStatus: status,
    appId: "day1",
    appVersion: "2.0.0",
    recovery: {
      channel: "email-service",
      contact: "portability@example.com",
      notes: ["Fallback recovery path remains available without Dynamic."],
    },
  });

  assert.equal(artifact.schemaVersion, 2);
  assert.equal(artifact.identity.canonicalId, "acct_portability_01");
  assert.equal(typeof artifact.integrity.checksum, "string");
  assert.ok(artifact.integrity.checksum.length > 0);
  assert.equal(artifact.authority.serverRegistry?.registryId, "day1-registry");
  assert.equal(artifact.recovery?.channel, "email-service");
  assert.equal(artifact.migration.portabilityStatus.serverAuthorityRef?.registryId, "day1-registry");
  assert.equal(artifact.migration.portabilityStatus.recoveryExportHandoff.recoveryChannel, "email-service");
});

test("validateExportArtifact accepts legacy v1 and v2", () => {
  const session = buildSession();
  const v1 = buildAccountExportArtifact({
    session,
    appId: "day1",
    exportedAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  const v2 = buildExportArtifact({
    session,
    portabilityStatus: getPortabilityStatus({ session }),
    appId: "day1",
    exportedAt: new Date("2026-01-01T00:00:00.000Z"),
  });

  assert.equal(validateExportArtifact(v1).ok, true);
  assert.equal(validateExportArtifact(v2).ok, true);
});

test("parseExportArtifact + upgradeArtifactToV2 converts legacy artifact", () => {
  const session = buildSession();
  const legacy = buildAccountExportArtifact({
    session,
    appId: "day1",
    exportedAt: new Date("2026-01-02T00:00:00.000Z"),
  });
  const parsed = parseExportArtifact(legacy);
  const upgraded = upgradeArtifactToV2(parsed, getPortabilityStatus({ session }));

  assert.equal(upgraded.schemaVersion, 2);
  assert.equal(upgraded.identity.accountId, "acct_portability_01");
});

