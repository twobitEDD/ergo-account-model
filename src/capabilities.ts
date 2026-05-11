import type {
  ProgressiveAccountCapabilities,
  ProgressiveLayerCapability,
  ProgressiveWalletRequirement,
} from "./types";

export interface BuildProgressiveCapabilitiesInput {
  sessionActive: boolean;
  walletBound: boolean;
  rewardsWalletRequirement?: Exclude<ProgressiveWalletRequirement, "none">;
  wageringWalletRequirement?: "required";
}

const toLayerStatus = (eligible: boolean): "active" | "inactive" => (eligible ? "active" : "inactive");

const buildRewardsLayer = (
  sessionActive: boolean,
  walletBound: boolean,
  walletRequirement: Exclude<ProgressiveWalletRequirement, "none">
): ProgressiveLayerCapability => {
  const eligible = sessionActive && (walletRequirement === "recommended" || walletBound);
  return {
    status: toLayerStatus(eligible),
    eligible,
    walletRequirement,
    title: "Wallet setup for rewards",
    message: !sessionActive
      ? "Start a Day1 session first, then add a wallet to unlock the full rewards path."
      : walletBound
        ? "Wallet linked: rewards can be tracked and prepared for payout flows."
        : walletRequirement === "required"
          ? "Rewards require a linked wallet for payout-ready account continuity."
          : "Rewards are available now; linking a wallet is recommended for continuity and payout flows.",
    actionLabel: walletBound ? undefined : "Bind Wallet",
  };
};

const buildWageringLayer = (
  sessionActive: boolean,
  walletBound: boolean,
  walletRequirement: "required"
): ProgressiveLayerCapability => {
  const eligible = sessionActive && walletBound;
  return {
    status: toLayerStatus(eligible),
    eligible,
    walletRequirement,
    title: "Wallet required for wagering",
    message: !sessionActive
      ? "Start a Day1 session before entering wagering flows."
      : walletBound
        ? "Wallet linked: wagering entry points are available."
        : "Link a wallet to unlock wagering actions.",
    actionLabel: walletBound ? undefined : "Bind Wallet",
  };
};

export const buildProgressiveAccountCapabilities = (
  input: BuildProgressiveCapabilitiesInput
): ProgressiveAccountCapabilities => {
  const rewardsWalletRequirement = input.rewardsWalletRequirement ?? "recommended";
  const wageringWalletRequirement = input.wageringWalletRequirement ?? "required";
  const freePlayEligible = input.sessionActive;

  return {
    schema: "ergo-progressive-capabilities",
    version: 1,
    sessionActive: input.sessionActive,
    walletBound: input.walletBound,
    layers: {
      freePlay: {
        status: toLayerStatus(freePlayEligible),
        eligible: freePlayEligible,
        walletRequirement: "none",
        title: "Day1 session active",
        message: freePlayEligible
          ? "Session is active. You can play free now."
          : "Sign in with Dynamic -> Day1 Session (or local auth) to start playing free.",
        actionLabel: freePlayEligible ? undefined : "Start Session",
      },
      rewards: buildRewardsLayer(input.sessionActive, input.walletBound, rewardsWalletRequirement),
      wagering: buildWageringLayer(input.sessionActive, input.walletBound, wageringWalletRequirement),
    },
  };
};
