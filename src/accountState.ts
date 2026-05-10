import type {
  AccountConversionSnapshot,
  AccountSession,
  AccountStateSnapshot,
  AccountType,
} from "./types";

const deriveAccountType = (session: AccountSession): AccountType => {
  const hasWalletBinding = Boolean(
    session.identity.ergoAddress ||
      session.status === "connected" ||
      session.status === "connected-readonly"
  );
  if (hasWalletBinding) return "WALLET_BOUND";
  if (session.identity.accountId) return "REGISTERED";
  return "GUEST";
};

export interface BuildAccountStateInput {
  session: AccountSession;
}

export const buildAccountStateSnapshot = (
  input: BuildAccountStateInput
): AccountStateSnapshot => {
  const accountType = deriveAccountType(input.session);
  const accountId = input.session.identity.accountId ?? null;
  const externalAuthRef = input.session.identity.externalAuthRef ?? null;

  return {
    accountType,
    accountId,
    externalAuthRef,
    isAuthenticated: input.session.status !== "disconnected",
    hasWalletBinding: accountType === "WALLET_BOUND",
    hasExternalAuth: Boolean(externalAuthRef || input.session.isDynamicAuthenticated),
  };
};

export interface BuildAccountConversionInput {
  session: AccountSession;
  state?: AccountStateSnapshot;
}

export const buildAccountConversionSnapshot = (
  input: BuildAccountConversionInput
): AccountConversionSnapshot => {
  const state = input.state ?? buildAccountStateSnapshot({ session: input.session });
  const canPromoteToRegistered = state.accountType === "GUEST" && state.hasExternalAuth;
  const canBindWallet = state.accountType !== "WALLET_BOUND" && Boolean(
    input.session.identity.ergoAddress ||
      input.session.isSelfCustodyReady ||
      input.session.migration.canLinkNautilus
  );
  const canDetachFromExternalAuth = Boolean(state.externalAuthRef) && input.session.migration.canRunWithoutDynamic;

  let targetType: AccountType = state.accountType;
  if (canBindWallet) targetType = "WALLET_BOUND";
  else if (canPromoteToRegistered) targetType = "REGISTERED";

  const conversionState =
    state.accountType === "WALLET_BOUND"
      ? "completed"
      : state.accountType === targetType
        ? "none"
        : "eligible";

  const notes: string[] = [];
  if (canPromoteToRegistered) {
    notes.push("External auth identity can be converted to a registered local account.");
  }
  if (canBindWallet) {
    notes.push("Wallet binding path is available from current account posture.");
  }
  if (canDetachFromExternalAuth) {
    notes.push("Provider lock-in can be reduced by running account flow without external auth.");
  }

  return {
    sourceType: state.accountType,
    targetType,
    accountId: state.accountId,
    externalAuthRef: state.externalAuthRef ?? null,
    conversionState,
    canPromoteToRegistered,
    canBindWallet,
    canDetachFromExternalAuth,
    notes,
  };
};
