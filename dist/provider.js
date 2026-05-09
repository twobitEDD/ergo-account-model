import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo } from "react";
import { buildAdapter } from "./adapters";
import { buildDefaultSigners, resolveSignerSnapshot } from "./signers";
import { buildAccountSession } from "./sessionBuilder";
const AccountModelContext = createContext(null);
const defaultToVaultSnapshot = (vault) => {
    var _a;
    if (!vault)
        return null;
    return {
        ergoAddress: vault.ergoAddress,
        hasPasskeyWrap: Boolean(vault.passkey && vault.passkeyEncrypted),
        hasRecoveryWrap: Boolean((_a = vault.recoveryEncrypted) === null || _a === void 0 ? void 0 : _a.ciphertext),
        createdAt: vault.createdAt,
    };
};
const toWalletSourceKind = (source) => {
    if (source === "dynamic-nautilus")
        return "dynamic-nautilus";
    if (source === "nautilus-direct")
        return "nautilus-direct";
    if (source === "vault")
        return "vault";
    return null;
};
export const AccountModelProvider = ({ children, dynamicUser, walletConnected, walletSource, ergoAddress, vault, toVaultSnapshot, nautilusApiAvailable, resolveSigners, }) => {
    const vaultSnapshot = useMemo(() => {
        if (toVaultSnapshot) {
            return toVaultSnapshot(vault);
        }
        return defaultToVaultSnapshot(vault);
    }, [vault, toVaultSnapshot]);
    const session = useMemo(() => {
        var _a, _b;
        return buildAccountSession({
            walletConnected,
            walletSource: toWalletSourceKind(walletSource),
            ergoAddress: ergoAddress !== null && ergoAddress !== void 0 ? ergoAddress : null,
            dynamicUser: (_a = dynamicUser) !== null && _a !== void 0 ? _a : null,
            vault: vaultSnapshot,
            nautilusApiAvailable: nautilusApiAvailable !== null && nautilusApiAvailable !== void 0 ? nautilusApiAvailable : (typeof window !== "undefined" &&
                Boolean(((_b = window.ergoConnector) === null || _b === void 0 ? void 0 : _b.nautilus) || window.ergo)),
        });
    }, [
        walletConnected,
        walletSource,
        ergoAddress,
        dynamicUser,
        vaultSnapshot,
        nautilusApiAvailable,
    ]);
    const signerSnapshot = useMemo(() => {
        var _a;
        const signerResolver = resolveSigners !== null && resolveSigners !== void 0 ? resolveSigners : buildDefaultSigners;
        const resolvedSigners = signerResolver({
            session,
            walletConnected,
            walletSource,
            dynamicUser,
            vault,
            nautilusApiAvailable: nautilusApiAvailable !== null && nautilusApiAvailable !== void 0 ? nautilusApiAvailable : (typeof window !== "undefined" &&
                Boolean(((_a = window.ergoConnector) === null || _a === void 0 ? void 0 : _a.nautilus) || window.ergo)),
        });
        return resolveSignerSnapshot(resolvedSigners);
    }, [
        session,
        walletConnected,
        walletSource,
        dynamicUser,
        vault,
        nautilusApiAvailable,
        resolveSigners,
    ]);
    const activeAdapter = useMemo(() => buildAdapter({
        identity: session.identity,
        migration: session.migration,
    }), [session.identity, session.migration]);
    const value = useMemo(() => {
        var _a;
        return ({
            session,
            activeAdapter,
            activeSigner: (_a = signerSnapshot.signers.find((signer) => signer.id === signerSnapshot.activeSignerId)) !== null && _a !== void 0 ? _a : null,
            signers: signerSnapshot.signers,
            dynamicUser,
            vault,
            getSession: () => session,
        });
    }, [session, activeAdapter, signerSnapshot, dynamicUser, vault]);
    return _jsx(AccountModelContext.Provider, { value: value, children: children });
};
export const useAccountModel = () => {
    const ctx = useContext(AccountModelContext);
    if (!ctx) {
        throw new Error("useAccountModel must be used inside <AccountModelProvider />");
    }
    return ctx;
};
