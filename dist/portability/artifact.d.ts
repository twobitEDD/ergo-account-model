import type { AccountSession } from "../types";
import type { PortabilityStatus } from "./contracts";
export declare const ACCOUNT_EXPORT_SCHEMA = "ergo-account-export";
export declare const ACCOUNT_EXPORT_LATEST_VERSION: 2;
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
export declare const buildExportArtifact: (input: BuildExportArtifactInput) => AccountExportArtifactV2;
export declare const validateExportArtifact: (artifact: unknown) => {
    ok: boolean;
    version?: 1 | 2;
    errors: string[];
};
export declare const parseExportArtifact: (artifact: unknown) => AccountExportArtifactAny;
export declare const upgradeArtifactToV2: (artifact: AccountExportArtifactAny, portabilityStatus: PortabilityStatus) => AccountExportArtifactV2;
