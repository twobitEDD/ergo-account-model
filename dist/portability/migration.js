import { createNoopNautilusMigrationAdapter } from "./adapters";
const blockedPlan = (session, target, reason) => ({
    status: "blocked",
    sourceAuthority: session.identity.authority,
    target,
    steps: [],
    warnings: [reason],
});
export const planMigration = async (input) => {
    var _a, _b;
    const adapter = (_a = input.adapter) !== null && _a !== void 0 ? _a : createNoopNautilusMigrationAdapter();
    const context = {
        session: input.session,
        artifact: input.artifact,
    };
    const capability = await adapter.checkCapability(context);
    if (!capability.supported) {
        return blockedPlan(input.session, capability, (_b = capability.reason) !== null && _b !== void 0 ? _b : "Target runtime capabilities are not currently available.");
    }
    const warnings = [];
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
export const executeMigration = async (input) => {
    var _a;
    const adapter = (_a = input.adapter) !== null && _a !== void 0 ? _a : createNoopNautilusMigrationAdapter();
    return adapter.execute({
        session: input.session,
        artifact: input.artifact,
        metadata: input.metadata,
    });
};
