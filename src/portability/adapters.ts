import type {
  MigrationExecutionContext,
  MigrationExecutionOutcome,
  MigrationTargetAdapter,
  MigrationTargetCapability,
  MnemonicCapabilityReport,
  MnemonicPortabilityStrategy,
} from "./contracts";

class NoopNautilusMigrationAdapter implements MigrationTargetAdapter {
  public readonly id = "nautilus";
  public readonly kind = "nautilus" as const;
  public readonly displayName = "Nautilus Wallet";

  async checkCapability(context: MigrationExecutionContext): Promise<MigrationTargetCapability> {
    const hasWindow = typeof window !== "undefined";
    const nautilusDetected =
      hasWindow &&
      Boolean((window as unknown as Record<string, unknown>).ergo || (window as any).ergoConnector?.nautilus);

    const requirements: string[] = [];
    if (!context.session.identity.ergoAddress) {
      requirements.push("Session must include an Ergo address before migration.");
    }

    if (!nautilusDetected) {
      requirements.push("Nautilus extension must be installed and unlocked.");
    }

    return {
      supported: requirements.length === 0,
      kind: this.kind,
      targetId: this.id,
      displayName: this.displayName,
      reason: requirements.length === 0 ? undefined : "Runtime Nautilus capability not yet wired.",
      requirements,
    };
  }

  async execute(context: MigrationExecutionContext): Promise<MigrationExecutionOutcome> {
    const capability = await this.checkCapability(context);
    if (!capability.supported) {
      return {
        status: "blocked",
        targetId: this.id,
        kind: this.kind,
        authorityAfter: context.session.identity.authority,
        details: capability.requirements,
        error: capability.reason ?? "Migration requirements not met.",
      };
    }

    return {
      status: "blocked",
      targetId: this.id,
      kind: this.kind,
      authorityAfter: context.session.identity.authority,
      details: [
        "Nautilus migration adapter is in no-op mode.",
        "Provide a project-specific execute() implementation that calls real EIP-12 APIs.",
      ],
      error: "No runtime Nautilus migration executor configured.",
    };
  }
}

class NoopMnemonicStrategy implements MnemonicPortabilityStrategy {
  public readonly id = "mnemonic-noop";

  getCapability(): MnemonicCapabilityReport {
    return {
      state: "requires-migration",
      reason: "Mnemonic export is not exposed by default for safety.",
      requirements: [
        "Implement a secure custody strategy before enabling plaintext mnemonic export.",
        "Require explicit user confirmation in downstream UI before export.",
      ],
    };
  }
}

export const createNoopNautilusMigrationAdapter = (): MigrationTargetAdapter =>
  new NoopNautilusMigrationAdapter();

export const createNoopMnemonicStrategy = (): MnemonicPortabilityStrategy =>
  new NoopMnemonicStrategy();

