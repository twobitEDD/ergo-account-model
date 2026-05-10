import type { AccountSession } from "../types";
import type { MigrationExecutionOutcome, MigrationPlan, MigrationTargetAdapter } from "./contracts";
export interface PlanMigrationInput {
    session: AccountSession;
    adapter?: MigrationTargetAdapter;
    artifact?: unknown;
}
export declare const planMigration: (input: PlanMigrationInput) => Promise<MigrationPlan>;
export interface ExecuteMigrationInput {
    session: AccountSession;
    adapter?: MigrationTargetAdapter;
    artifact?: unknown;
    metadata?: Record<string, unknown>;
}
export declare const executeMigration: (input: ExecuteMigrationInput) => Promise<MigrationExecutionOutcome>;
