import { AccountExportArtifact, AccountExportEncryptedVault, AccountExportWalletBinding, AccountSession } from "./types";
export interface BuildAccountExportArtifactInput {
    session: AccountSession;
    appId: string;
    appVersion?: string;
    walletBinding?: Partial<AccountExportWalletBinding> | null;
    encryptedVault?: AccountExportEncryptedVault | null;
    notes?: string[];
    exportedAt?: Date;
}
export declare const buildAccountExportArtifact: (input: BuildAccountExportArtifactInput) => AccountExportArtifact;
