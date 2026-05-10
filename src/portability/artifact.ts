import type { AccountSession } from "../types";
import type { PortabilityStatus } from "./contracts";

export const ACCOUNT_EXPORT_SCHEMA = "ergo-account-export";
export const ACCOUNT_EXPORT_LATEST_VERSION = 2 as const;

export interface LegacyAccountExportArtifactV1 {
  schema: typeof ACCOUNT_EXPORT_SCHEMA;
  schemaVersion: 1;
  exportedAt: string;
  app: {
    id: string;
    version?: string;
  };
  session: AccountSession;
  walletBinding: {
    ergoAddress: string | null;
    walletStatus: string | null;
  };
  encryptedVault: {
    format: string;
    source: "local-storage" | "dynamic-metadata" | "app-provided";
    payload: Record<string, unknown>;
  } | null;
  notes: string[];
}

export interface AccountIdentityReferenceV2 {
  canonicalId: string;
  accountId: string | null;
  ergoAddress: string | null;
  provider: string;
  authority: string;
  externalAuthRef?: string | null;
}

export interface LinkedAuthProviderMetadataV2 {
  providerId: string;
  subjectRef?: string;
  linkedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ExportedEncryptedWalletContainerV2 {
  format: string;
  source: "local-storage" | "dynamic-metadata" | "app-provided" | "external";
  encrypted: boolean;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AccountExportArtifactV2 {
  schema: typeof ACCOUNT_EXPORT_SCHEMA;
  schemaVersion: 2;
  compatibility: {
    minReaderVersion: 1;
    maxKnownVersion: 2;
    generatedBy: string;
  };
  exportedAt: string;
  app: {
    id: string;
    version?: string;
  };
  identity: AccountIdentityReferenceV2;
  authProviders?: LinkedAuthProviderMetadataV2[];
  authority: {
    current: string;
    runWithoutDynamic: boolean;
    summary: string[];
  };
  migration: {
    portabilityStatus: PortabilityStatus;
    plannedAt: string;
  };
  encryptedWallet?: ExportedEncryptedWalletContainerV2;
  integrity: {
    algorithm: "fnv1a-32";
    checksum: string;
    canonicalization: "stable-json-v1";
  };
  notes: string[];
  sessionSnapshot: AccountSession;
}

export type AccountExportArtifactAny = LegacyAccountExportArtifactV1 | AccountExportArtifactV2;

export interface BuildExportArtifactInput {
  session: AccountSession;
  portabilityStatus: PortabilityStatus;
  appId: string;
  appVersion?: string;
  authProviders?: LinkedAuthProviderMetadataV2[];
  encryptedWallet?: ExportedEncryptedWalletContainerV2;
  notes?: string[];
  exportedAt?: Date;
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

const fnv1a32 = (content: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i += 1) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const buildCanonicalIdentity = (session: AccountSession): AccountIdentityReferenceV2 => {
  const canonicalId =
    session.identity.accountId ??
    session.identity.ergoAddress ??
    session.identity.externalAuthRef ??
    "anonymous";
  return {
    canonicalId,
    accountId: session.identity.accountId,
    ergoAddress: session.identity.ergoAddress,
    provider: session.identity.provider,
    authority: session.identity.authority,
    externalAuthRef: session.identity.externalAuthRef ?? null,
  };
};

export const buildExportArtifact = (input: BuildExportArtifactInput): AccountExportArtifactV2 => {
  const exportedAt = (input.exportedAt ?? new Date()).toISOString();
  const artifactWithoutIntegrity: Omit<AccountExportArtifactV2, "integrity"> = {
    schema: ACCOUNT_EXPORT_SCHEMA,
    schemaVersion: ACCOUNT_EXPORT_LATEST_VERSION,
    compatibility: {
      minReaderVersion: 1 as const,
      maxKnownVersion: 2 as const,
      generatedBy: "@twobitedd/ergo-account-model",
    },
    exportedAt,
    app: {
      id: input.appId,
      version: input.appVersion,
    },
    identity: buildCanonicalIdentity(input.session),
    authProviders: input.authProviders,
    authority: {
      current: input.session.identity.authority,
      runWithoutDynamic: input.session.migration.canRunWithoutDynamic,
      summary: input.session.migration.notes,
    },
    migration: {
      portabilityStatus: input.portabilityStatus,
      plannedAt: exportedAt,
    },
    encryptedWallet: input.encryptedWallet,
    notes: input.notes ?? [],
    sessionSnapshot: input.session,
  };

  const checksum = fnv1a32(stableStringify(artifactWithoutIntegrity));
  return {
    ...artifactWithoutIntegrity,
    integrity: {
      algorithm: "fnv1a-32",
      checksum,
      canonicalization: "stable-json-v1",
    },
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

export const validateExportArtifact = (
  artifact: unknown
): { ok: boolean; version?: 1 | 2; errors: string[] } => {
  const errors: string[] = [];
  if (!isRecord(artifact)) {
    return { ok: false, errors: ["Artifact must be an object."] };
  }

  if (artifact.schema !== ACCOUNT_EXPORT_SCHEMA) {
    errors.push(`Unsupported schema: ${String(artifact.schema)}.`);
  }

  const schemaVersion = artifact.schemaVersion;
  if (schemaVersion !== 1 && schemaVersion !== 2) {
    errors.push(`Unsupported schemaVersion: ${String(schemaVersion)}.`);
  }

  if (typeof artifact.exportedAt !== "string") {
    errors.push("exportedAt must be an ISO string.");
  }

  if (!isRecord(artifact.app) || typeof artifact.app.id !== "string") {
    errors.push("app.id is required.");
  }

  if (schemaVersion === 1) {
    if (!isRecord(artifact.session)) {
      errors.push("v1 artifact must include session.");
    }
  }

  if (schemaVersion === 2) {
    if (!isRecord(artifact.identity) || typeof artifact.identity.canonicalId !== "string") {
      errors.push("v2 artifact must include identity.canonicalId.");
    }
    if (!isRecord(artifact.migration)) {
      errors.push("v2 artifact must include migration.");
    }
    if (!isRecord(artifact.integrity) || typeof artifact.integrity.checksum !== "string") {
      errors.push("v2 artifact must include integrity.checksum.");
    }
  }

  return {
    ok: errors.length === 0,
    version: schemaVersion === 1 || schemaVersion === 2 ? schemaVersion : undefined,
    errors,
  };
};

export const parseExportArtifact = (artifact: unknown): AccountExportArtifactAny => {
  const result = validateExportArtifact(artifact);
  if (!result.ok || !result.version) {
    throw new Error(`Invalid export artifact: ${result.errors.join(" ")}`);
  }
  return artifact as AccountExportArtifactAny;
};

export const upgradeArtifactToV2 = (
  artifact: AccountExportArtifactAny,
  portabilityStatus: PortabilityStatus
): AccountExportArtifactV2 => {
  if (artifact.schemaVersion === 2) {
    return artifact;
  }

  return buildExportArtifact({
    session: artifact.session,
    portabilityStatus,
    appId: artifact.app.id,
    appVersion: artifact.app.version,
    encryptedWallet: artifact.encryptedVault
      ? {
          format: artifact.encryptedVault.format,
          source: artifact.encryptedVault.source,
          encrypted: true,
          payload: artifact.encryptedVault.payload,
        }
      : undefined,
    notes: artifact.notes,
    exportedAt: new Date(artifact.exportedAt),
  });
};

