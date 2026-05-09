import { AccountSession, VaultSnapshot } from "./types";
export type WalletSourceKind = "dynamic-nautilus" | "nautilus-direct" | "vault" | null;
export interface BuildSessionInput {
    walletConnected: boolean;
    walletSource: WalletSourceKind;
    ergoAddress: string | null;
    dynamicUser: {
        id?: string;
        userId?: string;
        email?: string;
    } | null;
    vault: VaultSnapshot | null;
    nautilusApiAvailable: boolean;
}
export declare const buildAccountSession: (input: BuildSessionInput) => AccountSession;
