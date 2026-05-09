# ergo-basic-template gap and implementation notes

## What existed in `ergo-basic-template`

- Provider-agnostic account session model (`AccountSession`, `AccountIdentity`, migration notes).
- Runtime signing paths in app code:
  - Nautilus via EIP-12 (`window.ergo.sign_tx`/`submit_tx`).
  - Passkey-vault self-custody signing (local secret unlock + wasm signing).
- Dynamic-backed login + vault persistence path with explicit anti-lock-in language.
- Day1 ratification runtime with `external` and `direct` signer modes.

## What was missing in current setup

- `@twobitEDD/ergo-account-model` did not include an explicit signer abstraction.
- Consumers still had to branch on wallet source in feature components (for example, Tic-Tac-Toe page logic).
- Dynamic-backed and vault-backed signer executors were not surfaced through account-model context.
- Day1 ratification mode handling did not expose a distinct `public-sponsor` signer mode.

## Why it was missing

- The shared package split extracted session/identity modeling first, but signer execution remained in app-level modules to avoid premature coupling.
- Day1 ratification focused on baseline real/simulated execution and retained only `external`/`direct` mode labels.
- This left an integration seam where sovereignty goals were documented, but signer authority was not modeled at the same abstraction layer as account state.

## What was added now

- Added signer abstraction types and resolver contract to `@twobitEDD/ergo-account-model`:
  - `src/types.ts`
  - `src/signers.ts`
  - `src/provider.tsx`
  - `src/index.ts`
  - `src/signers.test.ts`
- Wired template consumer to provide runtime signer executors through the shared model:
  - `twobitEDD-ergo-account-abtraction-template/src/accountModelProviderBridge.tsx`
  - `twobitEDD-ergo-account-abtraction-template/src/components/games/TicTacToePage.tsx`
- Added explicit Day1 ratification `public-sponsor` signer mode and clearer mode-specific UI behavior:
  - `ergo-games-day1/server/ratification.ts`
  - `ergo-games-day1/server/ratification.test.ts`
  - `ergo-games-day1/src/api.ts`
  - `ergo-games-day1/src/App.tsx`
  - `ergo-games-day1/README.md`
  - `ergo-games-day1/docs/mainnet-day1-local-testing.md`

