const SOURCE_DYNAMIC_NAUTILUS = "dynamic-nautilus";
const SOURCE_NAUTILUS_DIRECT = "nautilus-direct";
const SOURCE_VAULT = "vault";
const buildReadonlySigner = (reasonUnavailable) => ({
    id: "readonly",
    provider: "none",
    authority: "dynamic-session",
    mode: "readonly",
    canSign: false,
    canSubmit: false,
    reasonUnavailable,
});
export const buildDefaultSigners = (input) => {
    const signers = [];
    if (input.session.status === "disconnected" || !input.session.identity.ergoAddress) {
        signers.push(buildReadonlySigner("No connected Ergo wallet authority."));
        return signers;
    }
    if (input.walletSource === SOURCE_DYNAMIC_NAUTILUS) {
        signers.push({
            id: "dynamic-nautilus",
            provider: "dynamic",
            authority: "nautilus-eip12",
            mode: "direct",
            canSign: true,
            canSubmit: true,
        });
    }
    else if (input.walletSource === SOURCE_NAUTILUS_DIRECT) {
        signers.push({
            id: "nautilus-direct",
            provider: "nautilus",
            authority: "nautilus-eip12",
            mode: "direct",
            canSign: true,
            canSubmit: true,
        });
    }
    else if (input.walletSource === SOURCE_VAULT) {
        signers.push({
            id: "self-custody-vault",
            provider: "vault",
            authority: "self-custody-vault",
            mode: "direct",
            canSign: true,
            canSubmit: true,
        });
    }
    if (signers.length === 0) {
        if (input.nautilusApiAvailable) {
            signers.push(buildReadonlySigner("Nautilus API is available but not currently connected."));
        }
        else {
            signers.push(buildReadonlySigner("No signer authority available in this session."));
        }
    }
    return signers;
};
export const resolveSignerSnapshot = (signers) => {
    var _a, _b;
    const safeSigners = signers.length > 0 ? signers : [buildReadonlySigner("No signer configured.")];
    const activeSigner = (_a = safeSigners.find((signer) => signer.canSign)) !== null && _a !== void 0 ? _a : null;
    return {
        activeSignerId: (_b = activeSigner === null || activeSigner === void 0 ? void 0 : activeSigner.id) !== null && _b !== void 0 ? _b : null,
        signers: safeSigners,
    };
};
