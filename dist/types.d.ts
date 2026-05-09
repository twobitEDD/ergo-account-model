export type AccountProviderKind = "dynamic" | "nautilus" | "vault" | "none";
export type AccountAuthorityKind = "dynamic-session" | "nautilus-eip12" | "self-custody-vault" | "none";
export type AccountSessionStatus = "disconnected" | "connected" | "connected-readonly";
export interface AccountIdentity {
    authority: AccountAuthorityKind;
    provider: AccountProviderKind;
    ergoAddress: string | null;
    userHandle: string | null;
    displayName: string | null;
}
export interface AccountMigrationPlan {
    canExportEncryptedVault: boolean;
    canUseRecoveryPhrase: boolean;
    canLinkNautilus: boolean;
    canRunWithoutDynamic: boolean;
    notes: string[];
}
export type AccountSignerMode = "direct" | "external" | "public-sponsor" | "readonly";
export type AccountSignerAuthority = Exclude<AccountAuthorityKind, "none"> | "sponsor-service";
export interface AccountSignerRequest {
    unsignedEip12: unknown;
    inputBoxes?: unknown[];
    context?: Record<string, unknown>;
}
export interface AccountSignerResult {
    ok: boolean;
    txId?: string;
    responseText: string;
}
export interface AccountSigner {
    id: string;
    provider: AccountProviderKind | "sponsor";
    authority: AccountSignerAuthority;
    mode: AccountSignerMode;
    canSign: boolean;
    canSubmit: boolean;
    reasonUnavailable?: string;
    signAndSubmit?: (request: AccountSignerRequest) => Promise<AccountSignerResult>;
}
export interface AccountSignerSnapshot {
    activeSignerId: string | null;
    signers: AccountSigner[];
}
export interface AccountSession {
    status: AccountSessionStatus;
    identity: AccountIdentity;
    isDynamicAuthenticated: boolean;
    isSelfCustodyReady: boolean;
    migration: AccountMigrationPlan;
}
export interface AccountExportEncryptedVault {
    format: string;
    source: "local-storage" | "dynamic-metadata" | "app-provided";
    payload: Record<string, unknown>;
}
export interface AccountExportWalletBinding {
    ergoAddress: string | null;
    walletStatus: string | null;
}
export interface AccountExportArtifact {
    schema: "ergo-account-export";
    schemaVersion: 1;
    exportedAt: string;
    app: {
        id: string;
        version?: string;
    };
    session: AccountSession;
    walletBinding: AccountExportWalletBinding;
    encryptedVault: AccountExportEncryptedVault | null;
    notes: string[];
}
export interface VaultSnapshot {
    ergoAddress: string;
    hasPasskeyWrap: boolean;
    hasRecoveryWrap: boolean;
    createdAt: number;
}
export interface AccountProviderAdapter {
    readonly provider: AccountProviderKind;
    getIdentity(): AccountIdentity;
    getMigrationPlan(): AccountMigrationPlan;
}
export interface SessionProvider {
    getSession(): AccountSession;
}
export interface SignerResolutionInput<TDynamicUser = unknown, TVault = unknown> {
    session: AccountSession;
    walletConnected: boolean;
    walletSource: string | null | undefined;
    dynamicUser: TDynamicUser | null;
    vault: TVault | null;
    nautilusApiAvailable: boolean;
}
export type ResolveAccountSigners<TDynamicUser = unknown, TVault = unknown> = (input: SignerResolutionInput<TDynamicUser, TVault>) => AccountSigner[];
