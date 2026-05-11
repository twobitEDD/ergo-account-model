import type { ProgressiveAccountCapabilities, ProgressiveWalletRequirement } from "./types";
export interface BuildProgressiveCapabilitiesInput {
    sessionActive: boolean;
    walletBound: boolean;
    rewardsWalletRequirement?: Exclude<ProgressiveWalletRequirement, "none">;
    wageringWalletRequirement?: "required";
}
export declare const buildProgressiveAccountCapabilities: (input: BuildProgressiveCapabilitiesInput) => ProgressiveAccountCapabilities;
