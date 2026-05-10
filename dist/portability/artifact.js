export const ACCOUNT_EXPORT_SCHEMA = "ergo-account-export";
export const ACCOUNT_EXPORT_LATEST_VERSION = 2;
const stableStringify = (value) => {
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(",")}]`;
    }
    if (value && typeof value === "object") {
        const entries = Object.entries(value)
            .filter(([, v]) => typeof v !== "undefined")
            .sort(([a], [b]) => a.localeCompare(b));
        return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
    }
    return JSON.stringify(value);
};
const fnv1a32 = (content) => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < content.length; i += 1) {
        hash ^= content.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
};
const buildCanonicalIdentity = (session) => {
    var _a, _b, _c, _d;
    const canonicalId = (_c = (_b = (_a = session.identity.accountId) !== null && _a !== void 0 ? _a : session.identity.ergoAddress) !== null && _b !== void 0 ? _b : session.identity.externalAuthRef) !== null && _c !== void 0 ? _c : "anonymous";
    return {
        canonicalId,
        accountId: session.identity.accountId,
        ergoAddress: session.identity.ergoAddress,
        provider: session.identity.provider,
        authority: session.identity.authority,
        externalAuthRef: (_d = session.identity.externalAuthRef) !== null && _d !== void 0 ? _d : null,
    };
};
export const buildExportArtifact = (input) => {
    var _a, _b;
    const exportedAt = ((_a = input.exportedAt) !== null && _a !== void 0 ? _a : new Date()).toISOString();
    const artifactWithoutIntegrity = {
        schema: ACCOUNT_EXPORT_SCHEMA,
        schemaVersion: ACCOUNT_EXPORT_LATEST_VERSION,
        compatibility: {
            minReaderVersion: 1,
            maxKnownVersion: 2,
            generatedBy: "@twobitedd/ergo-account-model",
        },
        exportedAt,
        app: {
            id: input.appId,
            version: input.appVersion,
        },
        identity: buildCanonicalIdentity(input.session),
        authProviders: input.authProviders,
        authority: {
            current: input.session.identity.authority,
            runWithoutDynamic: input.session.migration.canRunWithoutDynamic,
            summary: input.session.migration.notes,
        },
        migration: {
            portabilityStatus: input.portabilityStatus,
            plannedAt: exportedAt,
        },
        encryptedWallet: input.encryptedWallet,
        notes: (_b = input.notes) !== null && _b !== void 0 ? _b : [],
        sessionSnapshot: input.session,
    };
    const checksum = fnv1a32(stableStringify(artifactWithoutIntegrity));
    return {
        ...artifactWithoutIntegrity,
        integrity: {
            algorithm: "fnv1a-32",
            checksum,
            canonicalization: "stable-json-v1",
        },
    };
};
const isRecord = (value) => Boolean(value) && typeof value === "object";
export const validateExportArtifact = (artifact) => {
    const errors = [];
    if (!isRecord(artifact)) {
        return { ok: false, errors: ["Artifact must be an object."] };
    }
    if (artifact.schema !== ACCOUNT_EXPORT_SCHEMA) {
        errors.push(`Unsupported schema: ${String(artifact.schema)}.`);
    }
    const schemaVersion = artifact.schemaVersion;
    if (schemaVersion !== 1 && schemaVersion !== 2) {
        errors.push(`Unsupported schemaVersion: ${String(schemaVersion)}.`);
    }
    if (typeof artifact.exportedAt !== "string") {
        errors.push("exportedAt must be an ISO string.");
    }
    if (!isRecord(artifact.app) || typeof artifact.app.id !== "string") {
        errors.push("app.id is required.");
    }
    if (schemaVersion === 1) {
        if (!isRecord(artifact.session)) {
            errors.push("v1 artifact must include session.");
        }
    }
    if (schemaVersion === 2) {
        if (!isRecord(artifact.identity) || typeof artifact.identity.canonicalId !== "string") {
            errors.push("v2 artifact must include identity.canonicalId.");
        }
        if (!isRecord(artifact.migration)) {
            errors.push("v2 artifact must include migration.");
        }
        if (!isRecord(artifact.integrity) || typeof artifact.integrity.checksum !== "string") {
            errors.push("v2 artifact must include integrity.checksum.");
        }
    }
    return {
        ok: errors.length === 0,
        version: schemaVersion === 1 || schemaVersion === 2 ? schemaVersion : undefined,
        errors,
    };
};
export const parseExportArtifact = (artifact) => {
    const result = validateExportArtifact(artifact);
    if (!result.ok || !result.version) {
        throw new Error(`Invalid export artifact: ${result.errors.join(" ")}`);
    }
    return artifact;
};
export const upgradeArtifactToV2 = (artifact, portabilityStatus) => {
    if (artifact.schemaVersion === 2) {
        return artifact;
    }
    return buildExportArtifact({
        session: artifact.session,
        portabilityStatus,
        appId: artifact.app.id,
        appVersion: artifact.app.version,
        encryptedWallet: artifact.encryptedVault
            ? {
                format: artifact.encryptedVault.format,
                source: artifact.encryptedVault.source,
                encrypted: true,
                payload: artifact.encryptedVault.payload,
            }
            : undefined,
        notes: artifact.notes,
        exportedAt: new Date(artifact.exportedAt),
    });
};
