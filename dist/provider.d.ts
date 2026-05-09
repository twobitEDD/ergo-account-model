import React from "react";
import { AccountProviderAdapter, AccountSession, AccountSigner, ResolveAccountSigners, SessionProvider, VaultSnapshot } from "./types";
export interface AccountModelValue<TDynamicUser = unknown, TVault = unknown> extends SessionProvider {
    session: AccountSession;
    activeAdapter: AccountProviderAdapter;
    activeSigner: AccountSigner | null;
    signers: AccountSigner[];
    dynamicUser: TDynamicUser | null;
    vault: TVault | null;
}
export interface AccountModelProviderProps<TDynamicUser = unknown, TVault = unknown> {
    children: React.ReactNode;
    dynamicUser: TDynamicUser | null;
    walletConnected: boolean;
    walletSource: string | null | undefined;
    ergoAddress: string | null;
    vault: TVault | null;
    toVaultSnapshot?: (vault: TVault | null) => VaultSnapshot | null;
    nautilusApiAvailable?: boolean;
    resolveSigners?: ResolveAccountSigners<TDynamicUser, TVault>;
}
export declare const AccountModelProvider: <TDynamicUser = unknown, TVault = unknown>({ children, dynamicUser, walletConnected, walletSource, ergoAddress, vault, toVaultSnapshot, nautilusApiAvailable, resolveSigners, }: AccountModelProviderProps<TDynamicUser, TVault>) => import("react/jsx-runtime").JSX.Element;
export declare const useAccountModel: <TDynamicUser = unknown, TVault = unknown>() => AccountModelValue<TDynamicUser, TVault>;
