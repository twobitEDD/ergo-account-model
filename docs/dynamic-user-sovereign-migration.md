# Dynamic-first, user-sovereign migration guide

This guide shows how downstream apps can integrate reusable account
portability from `@twobitedd/ergo-account-model` without hardcoding a
project-specific wallet migration path.

## 1) Build canonical session

Create `AccountSession` from runtime data:

- wallet connection status/source
- ergo address
- auth user snapshot
- vault snapshot
- Nautilus runtime availability

Use `buildAccountSession(...)` so identity and migration posture are derived in
a provider-agnostic way.

## 2) Resolve portability status

Call `getPortabilityStatus({ session, mnemonicStrategy? })`.

- `encryptedExport` indicates whether encrypted vault export is available now or
  requires migration.
- `mnemonicExport` explicitly models seed/mnemonic capability and requirements.

If your app has an approved seed export implementation, provide a custom
`MnemonicPortabilityStrategy`. Otherwise use the default/no-op strategy.

## 3) Build and validate export artifact

Use `buildExportArtifact(...)` for schema v2 payloads.
Always run `validateExportArtifact(...)` before download, sync, or storage.

Compatibility notes:

- v1 artifacts remain readable through `parseExportArtifact(...)`.
- call `upgradeArtifactToV2(...)` to normalize old payloads into v2.

## 4) Plan signer authority transition

Use `planMigration({ session, adapter, artifact? })`.

The plan captures:

- target capability status
- source authority
- required user/system actions
- warnings when migration depends on unresolved prerequisites

## 5) Execute adapter-driven migration

Use `executeMigration({ session, adapter, artifact?, metadata? })`.

`createNoopNautilusMigrationAdapter()` is intentionally safe and returns blocked
outcomes until app code wires real Nautilus APIs.

Replace it with a concrete adapter that:

- checks wallet extension/runtime capability
- requests user consent/connection
- performs account authority switch
- returns typed `MigrationExecutionOutcome`

## Security notes

- The package does not fake cryptography or mnemonic recovery.
- Plaintext seed export must be app-owned, audited, and explicitly enabled.
- Use encrypted payload containers whenever possible and require user
  confirmation before any export.

