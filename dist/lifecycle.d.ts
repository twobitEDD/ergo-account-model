import type { AccountBootstrapSource, AccountLifecycleSnapshot, AccountSession } from "./types";
export interface BuildAccountLifecycleInput {
    session: AccountSession;
    bootstrapSource?: AccountBootstrapSource;
    walletBound?: boolean;
}
export declare const buildAccountLifecycleSnapshot: (input: BuildAccountLifecycleInput) => AccountLifecycleSnapshot;
