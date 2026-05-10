import type { AccountSession } from "../types";
import { createNoopNautilusMigrationAdapter } from "./adapters";
import type {
  MigrationExecutionContext,
  MigrationExecutionOutcome,
  MigrationPlan,
  MigrationTargetAdapter,
  MigrationTargetCapability,
} from "./contracts";

export interface PlanMigrationInput {
  session: AccountSession;
  adapter?: MigrationTargetAdapter;
  artifact?: unknown;
}

const blockedPlan = (
  session: AccountSession,
  target: MigrationTargetCapability,
  reason: string
): MigrationPlan => ({
  status: "blocked",
  sourceAuthority: session.identity.authority,
  target,
  steps: [],
  warnings: [reason],
});

export const planMigration = async (input: PlanMigrationInput): Promise<MigrationPlan> => {
  const adapter = input.adapter ?? createNoopNautilusMigrationAdapter();
  const context: MigrationExecutionContext = {
    session: input.session,
    artifact: input.artifact,
  };
  const capability = await adapter.checkCapability(context);

  if (!capability.supported) {
    return blockedPlan(
      input.session,
      capability,
      capability.reason ?? "Target runtime capabilities are not currently available."
    );
  }

  const warnings: string[] = [];
  if (!input.session.migration.canRunWithoutDynamic && capability.kind === "nautilus") {
    warnings.push("Session still depends on Dynamic auth; complete account linking before cutover.");
  }

  return {
    status: warnings.length > 0 ? "requires-user-action" : "ready",
    sourceAuthority: input.session.identity.authority,
    target: capability,
    steps: [
      `Validate target capability for ${capability.displayName}.`,
      "Confirm user ownership and account mapping before authority transition.",
      "Execute adapter-driven migration and persist resulting authority state.",
    ],
    warnings,
  };
};

export interface ExecuteMigrationInput {
  session: AccountSession;
  adapter?: MigrationTargetAdapter;
  artifact?: unknown;
  metadata?: Record<string, unknown>;
}

export const executeMigration = async (
  input: ExecuteMigrationInput
): Promise<MigrationExecutionOutcome> => {
  const adapter = input.adapter ?? createNoopNautilusMigrationAdapter();
  return adapter.execute({
    session: input.session,
    artifact: input.artifact,
    metadata: input.metadata,
  });
};

