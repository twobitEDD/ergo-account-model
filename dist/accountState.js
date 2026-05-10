const deriveAccountType = (session) => {
    const hasWalletBinding = Boolean(session.identity.ergoAddress ||
        session.status === "connected" ||
        session.status === "connected-readonly");
    if (hasWalletBinding)
        return "WALLET_BOUND";
    if (session.identity.accountId)
        return "REGISTERED";
    return "GUEST";
};
export const buildAccountStateSnapshot = (input) => {
    var _a, _b;
    const accountType = deriveAccountType(input.session);
    const accountId = (_a = input.session.identity.accountId) !== null && _a !== void 0 ? _a : null;
    const externalAuthRef = (_b = input.session.identity.externalAuthRef) !== null && _b !== void 0 ? _b : null;
    return {
        accountType,
        accountId,
        externalAuthRef,
        isAuthenticated: input.session.status !== "disconnected",
        hasWalletBinding: accountType === "WALLET_BOUND",
        hasExternalAuth: Boolean(externalAuthRef || input.session.isDynamicAuthenticated),
    };
};
export const buildAccountConversionSnapshot = (input) => {
    var _a, _b;
    const state = (_a = input.state) !== null && _a !== void 0 ? _a : buildAccountStateSnapshot({ session: input.session });
    const canPromoteToRegistered = state.accountType === "GUEST" && state.hasExternalAuth;
    const canBindWallet = state.accountType !== "WALLET_BOUND" && Boolean(input.session.identity.ergoAddress ||
        input.session.isSelfCustodyReady ||
        input.session.migration.canLinkNautilus);
    const canDetachFromExternalAuth = Boolean(state.externalAuthRef) && input.session.migration.canRunWithoutDynamic;
    let targetType = state.accountType;
    if (canBindWallet)
        targetType = "WALLET_BOUND";
    else if (canPromoteToRegistered)
        targetType = "REGISTERED";
    const conversionState = state.accountType === "WALLET_BOUND"
        ? "completed"
        : state.accountType === targetType
            ? "none"
            : "eligible";
    const notes = [];
    if (canPromoteToRegistered) {
        notes.push("External auth identity can be converted to a registered local account.");
    }
    if (canBindWallet) {
        notes.push("Wallet binding path is available from current account posture.");
    }
    if (canDetachFromExternalAuth) {
        notes.push("Provider lock-in can be reduced by running account flow without external auth.");
    }
    return {
        sourceType: state.accountType,
        targetType,
        accountId: state.accountId,
        externalAuthRef: (_b = state.externalAuthRef) !== null && _b !== void 0 ? _b : null,
        conversionState,
        canPromoteToRegistered,
        canBindWallet,
        canDetachFromExternalAuth,
        notes,
    };
};
