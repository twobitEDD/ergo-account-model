export const buildAccountExportArtifact = (input) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const exportedAt = ((_a = input.exportedAt) !== null && _a !== void 0 ? _a : new Date()).toISOString();
    return {
        schema: "ergo-account-export",
        schemaVersion: 1,
        exportedAt,
        app: {
            id: input.appId,
            version: input.appVersion,
        },
        session: input.session,
        walletBinding: {
            ergoAddress: (_c = (_b = input.walletBinding) === null || _b === void 0 ? void 0 : _b.ergoAddress) !== null && _c !== void 0 ? _c : null,
            walletStatus: (_e = (_d = input.walletBinding) === null || _d === void 0 ? void 0 : _d.walletStatus) !== null && _e !== void 0 ? _e : null,
        },
        encryptedVault: (_f = input.encryptedVault) !== null && _f !== void 0 ? _f : null,
        notes: (_g = input.notes) !== null && _g !== void 0 ? _g : [],
    };
};
