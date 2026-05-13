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
const deriveUserHandle = (dynamicUser) => (dynamicUser === null || dynamicUser === void 0 ? void 0 : dynamicUser.email) ||
    (dynamicUser === null || dynamicUser === void 0 ? void 0 : dynamicUser.userId) ||
    (dynamicUser === null || dynamicUser === void 0 ? void 0 : dynamicUser.id) ||
    ((dynamicUser === null || dynamicUser === void 0 ? void 0 : dynamicUser.username) ? String(dynamicUser.username) : null) ||
    null;
const buildMigrationPlan = (input) => {
    var _a, _b, _c, _d;
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
    const nautilusLinkage = {
        status: input.walletSource === "dynamic-nautilus" || input.walletSource === "nautilus-direct" ? "linked" : "unlinked",
        address: input.ergoAddress,
        network: input.ergoAddress ? "erg" : undefined,
        note: input.nautilusApiAvailable
            ? "Nautilus runtime detected for optional self-custody handoff."
            : "Nautilus runtime not detected in this session.",
    };
    const walletMigration = {
        sourceAuthority: deriveAuthority(input.walletSource),
        targetAuthority: input.nautilusApiAvailable ? "nautilus-eip12" : "none",
        stage: input.nautilusApiAvailable ? "ready" : "blocked",
        canExportToNautilus: input.nautilusApiAvailable,
        canExportToRecoveryService: Boolean(input.recoveryEmail || ((_a = input.vault) === null || _a === void 0 ? void 0 : _a.hasRecoveryWrap)),
        recoveryChannel: input.recoveryEmail ? "email-service" : ((_b = input.vault) === null || _b === void 0 ? void 0 : _b.hasRecoveryWrap) ? "manual-export" : "none",
        capabilityGated: !((_c = input.vault) === null || _c === void 0 ? void 0 : _c.hasRecoveryWrap),
        blockers: input.nautilusApiAvailable ? [] : ["Nautilus extension is not currently available."],
    };
    return {
        canExportEncryptedVault: Boolean(input.vault),
        canUseRecoveryPhrase: Boolean((_d = input.vault) === null || _d === void 0 ? void 0 : _d.hasRecoveryWrap),
        canLinkNautilus: input.nautilusApiAvailable,
        canRunWithoutDynamic: input.walletSource === "nautilus-direct" || !input.dynamicUser,
        notes,
        nautilusLinkage,
        walletMigration,
    };
};
export const buildAccountSession = (input) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const authority = deriveAuthority(input.walletSource);
    const provider = deriveProvider(input.walletSource);
    const identity = {
        accountId: (_e = (_c = (_a = input.accountId) !== null && _a !== void 0 ? _a : (_b = input.dynamicUser) === null || _b === void 0 ? void 0 : _b.userId) !== null && _c !== void 0 ? _c : (_d = input.dynamicUser) === null || _d === void 0 ? void 0 : _d.id) !== null && _e !== void 0 ? _e : null,
        externalAuthRef: (_h = (_f = input.externalAuthRef) !== null && _f !== void 0 ? _f : (_g = input.dynamicUser) === null || _g === void 0 ? void 0 : _g.externalAuthRef) !== null && _h !== void 0 ? _h : null,
        authority,
        provider,
        ergoAddress: input.ergoAddress,
        userHandle: deriveUserHandle(input.dynamicUser),
        displayName: ((_j = input.dynamicUser) === null || _j === void 0 ? void 0 : _j.email) || ((_k = input.dynamicUser) === null || _k === void 0 ? void 0 : _k.username) || null,
        serverRegistry: (_l = input.serverRegistry) !== null && _l !== void 0 ? _l : (input.accountId
            ? {
                authority: "server-registry",
                registryId: "day1-registry",
                userId: input.accountId,
                recoveryEmail: (_p = (_m = input.recoveryEmail) !== null && _m !== void 0 ? _m : (_o = input.dynamicUser) === null || _o === void 0 ? void 0 : _o.email) !== null && _p !== void 0 ? _p : null,
            }
            : undefined),
        providerLinks: input.providerLinks,
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
