import {
  AccountExportArtifact,
  AccountExportEncryptedVault,
  AccountExportWalletBinding,
  AccountSession,
} from "./types";

export interface BuildAccountExportArtifactInput {
  session: AccountSession;
  appId: string;
  appVersion?: string;
  walletBinding?: Partial<AccountExportWalletBinding> | null;
  encryptedVault?: AccountExportEncryptedVault | null;
  notes?: string[];
  exportedAt?: Date;
}

export const buildAccountExportArtifact = (
  input: BuildAccountExportArtifactInput
): AccountExportArtifact => {
  const exportedAt = (input.exportedAt ?? new Date()).toISOString();

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
      ergoAddress: input.walletBinding?.ergoAddress ?? null,
      walletStatus: input.walletBinding?.walletStatus ?? null,
    },
    encryptedVault: input.encryptedVault ?? null,
    notes: input.notes ?? [],
  };
};
