import { createNoopMnemonicStrategy } from "./adapters";
const buildIdentityRef = (session) => {
    var _a, _b, _c;
    return (_c = (_b = (_a = session.identity.accountId) !== null && _a !== void 0 ? _a : session.identity.ergoAddress) !== null && _b !== void 0 ? _b : session.identity.externalAuthRef) !== null && _c !== void 0 ? _c : "anonymous";
};
export const getPortabilityStatus = (input) => {
    var _a, _b, _c, _d, _e, _f;
    const mnemonicStrategy = (_a = input.mnemonicStrategy) !== null && _a !== void 0 ? _a : createNoopMnemonicStrategy();
    const mnemonicCapability = mnemonicStrategy.getCapability(input.session);
    const recoveryChannel = (_c = (_b = input.session.migration.walletMigration) === null || _b === void 0 ? void 0 : _b.recoveryChannel) !== null && _c !== void 0 ? _c : "none";
    const recoveryContact = (_e = (_d = input.session.identity.serverRegistry) === null || _d === void 0 ? void 0 : _d.recoveryEmail) !== null && _e !== void 0 ? _e : null;
    const continuityGuaranteed = input.session.migration.canRunWithoutDynamic &&
        ((_f = input.session.migration.walletMigration) === null || _f === void 0 ? void 0 : _f.canExportToRecoveryService) === true;
    const encryptedExportRequirements = [];
    if (!input.session.migration.canExportEncryptedVault) {
        encryptedExportRequirements.push("Encrypted vault export requires a local self-custody vault.");
    }
    return {
        identityRef: buildIdentityRef(input.session),
        authority: input.session.identity.authority,
        serverAuthorityRef: input.session.identity.serverRegistry,
        providerLinks: input.session.identity.providerLinks,
        isDynamicAuthenticated: input.session.isDynamicAuthenticated,
        hasWalletBinding: Boolean(input.session.identity.ergoAddress),
        canRunWithoutDynamic: input.session.migration.canRunWithoutDynamic,
        encryptedExport: {
            state: input.session.migration.canExportEncryptedVault ? "supported" : "requires-migration",
            reason: input.session.migration.canExportEncryptedVault
                ? undefined
                : "Encrypted vault is not yet provisioned in this session.",
            requirements: encryptedExportRequirements,
        },
        mnemonicExport: mnemonicCapability,
        nautilusLinkage: input.session.migration.nautilusLinkage,
        walletMigration: input.session.migration.walletMigration,
        recoveryExportHandoff: {
            recoveryChannel,
            continuityGuaranteed,
            encryptedVaultAvailable: input.session.migration.canExportEncryptedVault,
            recoveryContact,
            notes: [
                continuityGuaranteed
                    ? "Recovery continuity is available without Dynamic authentication."
                    : "Recovery continuity still depends on additional migration/runtime prerequisites.",
            ],
        },
        notes: input.session.migration.notes,
    };
};
