import type { AccountSession } from "../types";
import type { MnemonicPortabilityStrategy, PortabilityStatus } from "./contracts";
import { createNoopMnemonicStrategy } from "./adapters";

export interface GetPortabilityStatusInput {
  session: AccountSession;
  mnemonicStrategy?: MnemonicPortabilityStrategy;
}

const buildIdentityRef = (session: AccountSession): string =>
  session.identity.accountId ??
  session.identity.ergoAddress ??
  session.identity.externalAuthRef ??
  "anonymous";

export const getPortabilityStatus = (input: GetPortabilityStatusInput): PortabilityStatus => {
  const mnemonicStrategy = input.mnemonicStrategy ?? createNoopMnemonicStrategy();
  const mnemonicCapability = mnemonicStrategy.getCapability(input.session);
  const recoveryChannel = input.session.migration.walletMigration?.recoveryChannel ?? "none";
  const recoveryContact = input.session.identity.serverRegistry?.recoveryEmail ?? null;
  const continuityGuaranteed =
    input.session.migration.canRunWithoutDynamic &&
    input.session.migration.walletMigration?.canExportToRecoveryService === true;

  const encryptedExportRequirements: string[] = [];
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

