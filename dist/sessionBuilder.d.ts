import { AccountSession, ProviderLinkMetadata, ServerRegistryAuthorityRef, VaultSnapshot } from "./types";
export type WalletSourceKind = "dynamic-nautilus" | "nautilus-direct" | "vault" | null;
export interface BuildSessionInput {
    walletConnected: boolean;
    walletSource: WalletSourceKind;
    ergoAddress: string | null;
    dynamicUser: {
        id?: string;
        userId?: string;
        email?: string;
        externalAuthRef?: string;
    } | null;
    accountId?: string | null;
    externalAuthRef?: string | null;
    providerLinks?: ProviderLinkMetadata[];
    serverRegistry?: ServerRegistryAuthorityRef;
    recoveryEmail?: string | null;
    vault: VaultSnapshot | null;
    nautilusApiAvailable: boolean;
}
export declare const buildAccountSession: (input: BuildSessionInput) => AccountSession;
