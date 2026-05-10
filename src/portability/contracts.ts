import type { AccountAuthorityKind, AccountSession } from "../types";

export type PortabilityCapabilityState = "supported" | "requires-migration" | "unsupported";

export interface CapabilityReport {
  state: PortabilityCapabilityState;
  reason?: string;
  requirements: string[];
}

export interface MnemonicRecoveryMetadata {
  standard: "bip39" | "slip39" | "custom";
  language?: string;
  wordCount?: number;
  derivationPath?: string;
  hint?: string;
}

export interface MnemonicCapabilityReport extends CapabilityReport {
  metadata?: MnemonicRecoveryMetadata;
}

export interface PortabilityStatus {
  identityRef: string;
  authority: AccountAuthorityKind;
  isDynamicAuthenticated: boolean;
  hasWalletBinding: boolean;
  canRunWithoutDynamic: boolean;
  encryptedExport: CapabilityReport;
  mnemonicExport: MnemonicCapabilityReport;
  notes: string[];
}

export type MigrationTargetKind = "nautilus" | "mnemonic" | "custom";

export interface MigrationTargetCapability {
  supported: boolean;
  kind: MigrationTargetKind;
  targetId: string;
  displayName: string;
  reason?: string;
  requirements: string[];
}

export interface MigrationExecutionContext {
  session: AccountSession;
  artifact?: unknown;
  metadata?: Record<string, unknown>;
}

export type MigrationExecutionStatus = "completed" | "blocked" | "failed";

export interface MigrationExecutionOutcome {
  status: MigrationExecutionStatus;
  targetId: string;
  kind: MigrationTargetKind;
  authorityAfter?: AccountAuthorityKind;
  txId?: string;
  details: string[];
  error?: string;
}

export interface MigrationTargetAdapter {
  id: string;
  kind: MigrationTargetKind;
  displayName: string;
  checkCapability(context: MigrationExecutionContext): Promise<MigrationTargetCapability>;
  execute(context: MigrationExecutionContext): Promise<MigrationExecutionOutcome>;
}

export interface MigrationPlan {
  status: "ready" | "requires-user-action" | "blocked";
  sourceAuthority: AccountAuthorityKind;
  target: MigrationTargetCapability;
  steps: string[];
  warnings: string[];
}

export interface MnemonicPortabilityStrategy {
  id: string;
  getCapability(session: AccountSession): MnemonicCapabilityReport;
  exportMnemonic?(session: AccountSession): Promise<{ phrase: string; metadata: MnemonicRecoveryMetadata }>;
  importMnemonic?(
    phrase: string,
    metadata?: Partial<MnemonicRecoveryMetadata>
  ): Promise<{ recoveredAddress?: string; metadata: MnemonicRecoveryMetadata }>;
}

