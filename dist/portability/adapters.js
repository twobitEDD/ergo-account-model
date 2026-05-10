class NoopNautilusMigrationAdapter {
    constructor() {
        this.id = "nautilus";
        this.kind = "nautilus";
        this.displayName = "Nautilus Wallet";
    }
    async checkCapability(context) {
        var _a;
        const hasWindow = typeof window !== "undefined";
        const nautilusDetected = hasWindow &&
            Boolean(window.ergo || ((_a = window.ergoConnector) === null || _a === void 0 ? void 0 : _a.nautilus));
        const requirements = [];
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
    async execute(context) {
        var _a;
        const capability = await this.checkCapability(context);
        if (!capability.supported) {
            return {
                status: "blocked",
                targetId: this.id,
                kind: this.kind,
                authorityAfter: context.session.identity.authority,
                details: capability.requirements,
                error: (_a = capability.reason) !== null && _a !== void 0 ? _a : "Migration requirements not met.",
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
class NoopMnemonicStrategy {
    constructor() {
        this.id = "mnemonic-noop";
    }
    getCapability() {
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
export const createNoopNautilusMigrationAdapter = () => new NoopNautilusMigrationAdapter();
export const createNoopMnemonicStrategy = () => new NoopMnemonicStrategy();
