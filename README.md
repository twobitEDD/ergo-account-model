# @twobitedd/ergo-account-model

Provider-agnostic account/session abstraction for Ergo apps, centered on user
sovereignty and account abstraction compatibility.

## Install

```bash
npm install @twobitedd/ergo-account-model
```

## Public API

- `buildAccountSession(input)` for pure session derivation.
- **`DynamicUserInput`** and **`mapDynamicSdkUserToDynamicUserInput(user)`** for
  Dynamic.xyz SDK user → session bridge (no `@dynamic-labs/*` dependency).
- `buildAccountStateSnapshot({ session })` for canonical account state (`GUEST | REGISTERED | WALLET_BOUND`).
- `buildAccountConversionSnapshot({ session })` for account conversion posture and next target state.
- `buildAccountExportArtifact(input)` for portable wallet/account backup payloads.
- `getPortabilityStatus({ session, mnemonicStrategy? })` for reusable migration capability posture.
- `buildExportArtifact(input)` for standardized export artifact schema v2.
- `validateExportArtifact(artifact)` / `parseExportArtifact(artifact)` for artifact validation and parsing.
- `planMigration({ session, adapter, artifact? })` and `executeMigration({ session, adapter, artifact? })` for adapter-driven authority transitions.
- `createNoopNautilusMigrationAdapter()` and `createNoopMnemonicStrategy()` as safe runtime seams.
- `buildAccountLifecycleSnapshot(input)` for bootstrap/sovereignty lifecycle posture.
- `buildAdapter({ identity, migration })` for provider adapter snapshots.
- `buildDefaultSigners(input)` and `resolveSignerSnapshot(signers)` for provider-agnostic signer modeling.
- `AccountModelProvider` and `useAccountModel()` for React context wiring.

## Signer abstraction (new)

The package now models signer capabilities explicitly so consumers no longer need
to hardcode wallet-source conditionals (`dynamic-nautilus` vs `vault` etc.) in
feature code.

- `AccountSigner` describes authority, mode, availability, and optional
  `signAndSubmit` implementation.
- `AccountModelProvider` exposes `activeSigner` and `signers` in context.
- Apps can pass `resolveSigners` to attach runtime-specific implementations
  (for example, Dynamic-backed Nautilus signing or passkey-vault signing) while
  keeping the package provider-agnostic.

This keeps sovereignty guarantees explicit: Dynamic is treated as an auth
provider, while actual signing authority remains switchable between Nautilus,
self-custody vault, and external/public sponsor paths.

## Dynamic-first, user-sovereign migration

This package now includes a provider-agnostic portability subsystem under
`src/portability` so Dynamic-first onboarding can transition to
user-controlled ownership without project-specific rewrites.

- **Artifact v2:** standardized `ergo-account-export` schema version `2` with:
  - canonical identity reference (`accountId` / wallet / external ref fallback)
  - optional linked auth provider metadata
  - wallet authority summary + migration posture
  - optional encrypted wallet container metadata
  - deterministic integrity checksum metadata
  - compatibility fields (`minReaderVersion`, `maxKnownVersion`)
- **Backward compatible:** v1 artifacts remain valid for parse/validation, and
  can be upgraded via `upgradeArtifactToV2(...)`.
- **Mnemonic safety:** mnemonic export is modeled as capability + requirements.
  The default strategy intentionally does not emit plaintext seed phrases.
- **Nautilus hooks:** `MigrationTargetAdapter` provides capability checks and
  execute contracts, with a no-op Nautilus adapter for safe integration.

### Typical integration flow

1. Build a provider-agnostic account session with `buildAccountSession(...)`.
2. Resolve portability posture with `getPortabilityStatus(...)`.
3. Create v2 artifact with `buildExportArtifact(...)`.
4. Validate using `validateExportArtifact(...)` before persistence/export.
5. Build migration plan via `planMigration(...)`.
6. Execute adapter-driven migration using `executeMigration(...)`.

See `docs/dynamic-user-sovereign-migration.md` for a downstream integration
guide.

## Usage

```ts
import { buildAccountSession } from "@twobitedd/ergo-account-model";

const session = buildAccountSession({
  walletConnected: true,
  walletSource: "nautilus-direct",
  ergoAddress: "9hExampleAddress",
  dynamicUser: null,
  vault: null,
  nautilusApiAvailable: true,
});
```

With **Dynamic.xyz** (or any compatible `user` object), map into the session contract:

```ts
import {
  buildAccountSession,
  mapDynamicSdkUserToDynamicUserInput,
} from "@twobitedd/ergo-account-model";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

const { user } = useDynamicContext();
const dynamicUser = mapDynamicSdkUserToDynamicUserInput(user);

const session = buildAccountSession({
  walletConnected: true,
  walletSource: "dynamic-nautilus",
  ergoAddress: "9h…",
  dynamicUser,
  vault: null,
  nautilusApiAvailable: true,
});
```

`AccountIdentity` now includes canonical `accountId` and optional `externalAuthRef` fields.
`buildAccountLifecycleSnapshot` keeps the existing `stage` field while adding orthogonal
`dimensions` and `derivedStage` for migration-safe evolution.

The provider accepts already-resolved app data to keep this package independent
from app-specific data-fetching:

- `dynamicUser`
- `walletConnected`
- `walletSource`
- `ergoAddress`
- `vault`

## Dependency string guidance

For published/public consumers, use a semver range:

```bash
"@twobitedd/ergo-account-model": "^0.2.0"
```

If you are iterating inside this monorepo, you can temporarily swap to a local
`file:` dependency during development.

## Local development

From `ergo-account-model/`:

```bash
npm install
npm run check
```

Build output is written to `dist/`, and published artifacts are sourced from
that output.

## Publish checklist

1. Bump `version` in `package.json`.
2. Authenticate once:
   ```bash
   npm login
   ```
3. Run release guardrails:
   ```bash
   npm run prepublishOnly
   npm pack --dry-run
   ```
4. Publish:
   ```bash
   npm publish --access public
   ```
