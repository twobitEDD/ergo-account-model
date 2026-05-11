export const buildAccountExportArtifact = (input) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
        portability: {
            nautilusLinkage: input.session.migration.nautilusLinkage,
            walletMigration: input.session.migration.walletMigration,
            recoveryEmail: (_h = (_g = input.session.identity.serverRegistry) === null || _g === void 0 ? void 0 : _g.recoveryEmail) !== null && _h !== void 0 ? _h : null,
        },
        notes: (_j = input.notes) !== null && _j !== void 0 ? _j : [],
    };
};
