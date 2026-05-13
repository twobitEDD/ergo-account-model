import {
  AccountIdentity,
  AccountMigrationPlan,
  AccountProviderKind,
  AccountSession,
  AccountSessionStatus,
  AccountAuthorityKind,
  NautilusLinkageState,
  ProviderLinkMetadata,
  ServerRegistryAuthorityRef,
  VaultSnapshot,
  WalletMigrationState,
} from "./types";
import type { DynamicUserInput } from "./dynamicUser";
import { buildAccountConversionSnapshot, buildAccountStateSnapshot } from "./accountState";

export type WalletSourceKind =
  | "dynamic-nautilus"
  | "nautilus-direct"
  | "vault"
  | null;

export interface BuildSessionInput {
  walletConnected: boolean;
  walletSource: WalletSourceKind;
  ergoAddress: string | null;
  /** Dynamic.xyz (or compatible) user profile; see {@link DynamicUserInput}. */
  dynamicUser: DynamicUserInput | null;
  accountId?: string | null;
  externalAuthRef?: string | null;
  providerLinks?: ProviderLinkMetadata[];
  serverRegistry?: ServerRegistryAuthorityRef;
  recoveryEmail?: string | null;
  vault: VaultSnapshot | null;
  nautilusApiAvailable: boolean;
}

const deriveAuthority = (source: WalletSourceKind): AccountAuthorityKind => {
  if (source === "dynamic-nautilus" || source === "nautilus-direct") {
    return "nautilus-eip12";
  }
  if (source === "vault") return "self-custody-vault";
  return "none";
};

const deriveProvider = (source: WalletSourceKind): AccountProviderKind => {
  if (source === "dynamic-nautilus") return "dynamic";
  if (source === "nautilus-direct") return "nautilus";
  if (source === "vault") return "vault";
  return "none";
};

const deriveStatus = (
  walletConnected: boolean,
  ergoAddress: string | null
): AccountSessionStatus => {
  if (!walletConnected || !ergoAddress) return "disconnected";
  return "connected";
};

const deriveUserHandle = (dynamicUser: BuildSessionInput["dynamicUser"]): string | null =>
  dynamicUser?.email ||
  dynamicUser?.userId ||
  dynamicUser?.id ||
  (dynamicUser?.username ? String(dynamicUser.username) : null) ||
  null;

const buildMigrationPlan = (input: BuildSessionInput): AccountMigrationPlan => {
  const notes: string[] = [];

  if (input.vault) {
    notes.push(
      "Vault is encrypted locally and can be mirrored to Dynamic metadata without exposing the private key."
    );
  } else {
    notes.push(
      "No vault found yet. Provisioning a vault creates self-custody material independent from Dynamic."
    );
  }

  if (input.nautilusApiAvailable) {
    notes.push("Nautilus can be linked as an alternate signer authority.");
  } else {
    notes.push("Nautilus extension not detected in this browser session.");
  }

  if (!input.dynamicUser) {
    notes.push("Dynamic login is optional for Nautilus-only operation.");
  }

  const nautilusLinkage: NautilusLinkageState = {
    status: input.walletSource === "dynamic-nautilus" || input.walletSource === "nautilus-direct" ? "linked" : "unlinked",
    address: input.ergoAddress,
    network: input.ergoAddress ? "erg" : undefined,
    note:
      input.nautilusApiAvailable
        ? "Nautilus runtime detected for optional self-custody handoff."
        : "Nautilus runtime not detected in this session.",
  };
  const walletMigration: WalletMigrationState = {
    sourceAuthority: deriveAuthority(input.walletSource),
    targetAuthority: input.nautilusApiAvailable ? "nautilus-eip12" : "none",
    stage: input.nautilusApiAvailable ? "ready" : "blocked",
    canExportToNautilus: input.nautilusApiAvailable,
    canExportToRecoveryService: Boolean(input.recoveryEmail || input.vault?.hasRecoveryWrap),
    recoveryChannel: input.recoveryEmail ? "email-service" : input.vault?.hasRecoveryWrap ? "manual-export" : "none",
    capabilityGated: !input.vault?.hasRecoveryWrap,
    blockers: input.nautilusApiAvailable ? [] : ["Nautilus extension is not currently available."],
  };

  return {
    canExportEncryptedVault: Boolean(input.vault),
    canUseRecoveryPhrase: Boolean(input.vault?.hasRecoveryWrap),
    canLinkNautilus: input.nautilusApiAvailable,
    canRunWithoutDynamic: input.walletSource === "nautilus-direct" || !input.dynamicUser,
    notes,
    nautilusLinkage,
    walletMigration,
  };
};

export const buildAccountSession = (input: BuildSessionInput): AccountSession => {
  const authority = deriveAuthority(input.walletSource);
  const provider = deriveProvider(input.walletSource);
  const identity: AccountIdentity = {
    accountId: input.accountId ?? input.dynamicUser?.userId ?? input.dynamicUser?.id ?? null,
    externalAuthRef: input.externalAuthRef ?? input.dynamicUser?.externalAuthRef ?? null,
    authority,
    provider,
    ergoAddress: input.ergoAddress,
    userHandle: deriveUserHandle(input.dynamicUser),
    displayName: input.dynamicUser?.email || input.dynamicUser?.username || null,
    serverRegistry:
      input.serverRegistry ??
      (input.accountId
        ? {
            authority: "server-registry",
            registryId: "day1-registry",
            userId: input.accountId,
            recoveryEmail: input.recoveryEmail ?? input.dynamicUser?.email ?? null,
          }
        : undefined),
    providerLinks: input.providerLinks,
  };

  const session: AccountSession = {
    status: deriveStatus(input.walletConnected, input.ergoAddress),
    identity,
    isDynamicAuthenticated: Boolean(input.dynamicUser),
    isSelfCustodyReady: Boolean(input.vault),
    migration: buildMigrationPlan(input),
  };

  const state = buildAccountStateSnapshot({ session });
  const conversion = buildAccountConversionSnapshot({ session, state });

  return {
    ...session,
    state,
    conversion,
  };
};
