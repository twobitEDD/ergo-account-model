import type {
  AccountBootstrapSource,
  AccountLifecycleSnapshot,
  AccountSession,
} from "./types";
import { buildAccountStateSnapshot } from "./accountState";

export interface BuildAccountLifecycleInput {
  session: AccountSession;
  bootstrapSource?: AccountBootstrapSource;
  walletBound?: boolean;
}

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.floor(score)));

export const buildAccountLifecycleSnapshot = (
  input: BuildAccountLifecycleInput
): AccountLifecycleSnapshot => {
  const bootstrapSource = input.bootstrapSource ?? "unknown";
  const walletBound = Boolean(input.walletBound || input.session.identity.ergoAddress);
  const dynamicOnly =
    input.session.identity.provider === "dynamic" && !input.session.isSelfCustodyReady;
  const canMigrateWithoutProviderLockIn =
    input.session.migration.canRunWithoutDynamic ||
    input.session.migration.canExportEncryptedVault ||
    input.session.migration.canUseRecoveryPhrase;

  let derivedStage: AccountLifecycleSnapshot["stage"] = "anonymous";
  if (input.session.status !== "disconnected") derivedStage = "authenticated";
  if (input.session.isSelfCustodyReady) derivedStage = "self-custody-ready";
  if (walletBound) derivedStage = "wallet-bound";
  if (canMigrateWithoutProviderLockIn) derivedStage = "migratable";

  const accountState = input.session.state ?? buildAccountStateSnapshot({ session: input.session });

  const indicators: string[] = [];
  if (input.session.isDynamicAuthenticated) indicators.push("dynamic-authenticated");
  if (input.session.isSelfCustodyReady) indicators.push("self-custody-ready");
  if (walletBound) indicators.push("wallet-bound");
  if (input.session.migration.canUseRecoveryPhrase) indicators.push("recovery-phrase-enabled");
  if (input.session.migration.canLinkNautilus) indicators.push("nautilus-link-available");
  if (dynamicOnly) indicators.push("dynamic-dependent");
  if (canMigrateWithoutProviderLockIn) indicators.push("provider-portable");

  let sovereigntyScore = 15;
  if (input.session.isDynamicAuthenticated) sovereigntyScore += 10;
  if (input.session.isSelfCustodyReady) sovereigntyScore += 30;
  if (walletBound) sovereigntyScore += 15;
  if (input.session.migration.canUseRecoveryPhrase) sovereigntyScore += 20;
  if (input.session.migration.canRunWithoutDynamic) sovereigntyScore += 15;
  if (dynamicOnly) sovereigntyScore -= 20;

  return {
    stage: derivedStage,
    derivedStage,
    bootstrapSource,
    sovereigntyScore: clampScore(sovereigntyScore),
    canMigrateWithoutProviderLockIn,
    dimensions: {
      accountType: accountState.accountType,
      isAuthenticated: input.session.status !== "disconnected",
      hasWalletBinding: walletBound,
      isDynamicAuthenticated: input.session.isDynamicAuthenticated,
      isSelfCustodyReady: input.session.isSelfCustodyReady,
      canMigrateWithoutProviderLockIn,
    },
    indicators,
  };
};
