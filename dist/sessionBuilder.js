import { buildAccountConversionSnapshot, buildAccountStateSnapshot } from "./accountState";
const deriveAuthority = (source) => {
    if (source === "dynamic-nautilus" || source === "nautilus-direct") {
        return "nautilus-eip12";
    }
    if (source === "vault")
        return "self-custody-vault";
    return "none";
};
const deriveProvider = (source) => {
    if (source === "dynamic-nautilus")
        return "dynamic";
    if (source === "nautilus-direct")
        return "nautilus";
    if (source === "vault")
        return "vault";
    return "none";
};
const deriveStatus = (walletConnected, ergoAddress) => {
    if (!walletConnected || !ergoAddress)
        return "disconnected";
    return "connected";
};
const deriveUserHandle = (dynamicUser) => (dynamicUser === null || dynamicUser === void 0 ? void 0 : dynamicUser.email) || (dynamicUser === null || dynamicUser === void 0 ? void 0 : dynamicUser.userId) || (dynamicUser === null || dynamicUser === void 0 ? void 0 : dynamicUser.id) || null;
const buildMigrationPlan = (input) => {
    var _a;
    const notes = [];
    if (input.vault) {
        notes.push("Vault is encrypted locally and can be mirrored to Dynamic metadata without exposing the private key.");
    }
    else {
        notes.push("No vault found yet. Provisioning a vault creates self-custody material independent from Dynamic.");
    }
    if (input.nautilusApiAvailable) {
        notes.push("Nautilus can be linked as an alternate signer authority.");
    }
    else {
        notes.push("Nautilus extension not detected in this browser session.");
    }
    if (!input.dynamicUser) {
        notes.push("Dynamic login is optional for Nautilus-only operation.");
    }
    return {
        canExportEncryptedVault: Boolean(input.vault),
        canUseRecoveryPhrase: Boolean((_a = input.vault) === null || _a === void 0 ? void 0 : _a.hasRecoveryWrap),
        canLinkNautilus: input.nautilusApiAvailable,
        canRunWithoutDynamic: input.walletSource === "nautilus-direct" || !input.dynamicUser,
        notes,
    };
};
export const buildAccountSession = (input) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const authority = deriveAuthority(input.walletSource);
    const provider = deriveProvider(input.walletSource);
    const identity = {
        accountId: (_e = (_c = (_a = input.accountId) !== null && _a !== void 0 ? _a : (_b = input.dynamicUser) === null || _b === void 0 ? void 0 : _b.userId) !== null && _c !== void 0 ? _c : (_d = input.dynamicUser) === null || _d === void 0 ? void 0 : _d.id) !== null && _e !== void 0 ? _e : null,
        externalAuthRef: (_h = (_f = input.externalAuthRef) !== null && _f !== void 0 ? _f : (_g = input.dynamicUser) === null || _g === void 0 ? void 0 : _g.externalAuthRef) !== null && _h !== void 0 ? _h : null,
        authority,
        provider,
        ergoAddress: input.ergoAddress,
        userHandle: deriveUserHandle(input.dynamicUser),
        displayName: ((_j = input.dynamicUser) === null || _j === void 0 ? void 0 : _j.email) || null,
    };
    const session = {
        status: deriveStatus(input.walletConnected, input.ergoAddress),
        identity,
        isDynamicAuthenticated: Boolean(input.dynamicUser),
        isSelfCustodyReady: Boolean(input.vault),
        migration: buildMigrationPlan(input),
    };
    const state = buildAccountStateSnapshot({ session });
    const conversion = buildAccountConversionSnapshot({ session, state });
    return {
        ...session,
        state,
        conversion,
    };
};
