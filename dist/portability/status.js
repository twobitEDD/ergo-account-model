import { createNoopMnemonicStrategy } from "./adapters";
const buildIdentityRef = (session) => {
    var _a, _b, _c;
    return (_c = (_b = (_a = session.identity.accountId) !== null && _a !== void 0 ? _a : session.identity.ergoAddress) !== null && _b !== void 0 ? _b : session.identity.externalAuthRef) !== null && _c !== void 0 ? _c : "anonymous";
};
export const getPortabilityStatus = (input) => {
    var _a;
    const mnemonicStrategy = (_a = input.mnemonicStrategy) !== null && _a !== void 0 ? _a : createNoopMnemonicStrategy();
    const mnemonicCapability = mnemonicStrategy.getCapability(input.session);
    const encryptedExportRequirements = [];
    if (!input.session.migration.canExportEncryptedVault) {
        encryptedExportRequirements.push("Encrypted vault export requires a local self-custody vault.");
    }
    return {
        identityRef: buildIdentityRef(input.session),
        authority: input.session.identity.authority,
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
        notes: input.session.migration.notes,
    };
};
