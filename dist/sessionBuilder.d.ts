import { AccountSession, ProviderLinkMetadata, ServerRegistryAuthorityRef, VaultSnapshot } from "./types";
import type { DynamicUserInput } from "./dynamicUser";
export type WalletSourceKind = "dynamic-nautilus" | "nautilus-direct" | "vault" | null;
export interface BuildSessionInput {
    walletConnected: boolean;
    walletSource: WalletSourceKind;
    ergoAddress: string | null;
    /** Dynamic.xyz (or compatible) user profile; see {@link DynamicUserInput}. */
    dynamicUser: DynamicUserInput | null;
    accountId?: string | null;
    externalAuthRef?: string | null;
    providerLinks?: ProviderLinkMetadata[];
    serverRegistry?: ServerRegistryAuthorityRef;
    recoveryEmail?: string | null;
    vault: VaultSnapshot | null;
    nautilusApiAvailable: boolean;
}
export declare const buildAccountSession: (input: BuildSessionInput) => AccountSession;
