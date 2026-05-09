# @twobitedd/ergo-account-model

Provider-agnostic account/session abstraction for Ergo apps, centered on user
sovereignty and account abstraction compatibility.

## Install

```bash
npm install @twobitedd/ergo-account-model
```

## Public API

- `buildAccountSession(input)` for pure session derivation.
- `buildAccountExportArtifact(input)` for portable wallet/account backup payloads.
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

The provider accepts already-resolved app data to keep this package independent
from app-specific data-fetching:

- `dynamicUser`
- `walletConnected`
- `walletSource`
- `ergoAddress`
- `vault`

## Local linking in this repo

Use the root package from sibling projects:

```bash
"@twobitedd/ergo-account-model": "file:../ergo-account-model"
```

For nested consumers:

```bash
"@twobitedd/ergo-account-model": "file:../../ergo-account-model"
```

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
