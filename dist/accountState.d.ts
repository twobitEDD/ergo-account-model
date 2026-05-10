import type { AccountConversionSnapshot, AccountSession, AccountStateSnapshot } from "./types";
export interface BuildAccountStateInput {
    session: AccountSession;
}
export declare const buildAccountStateSnapshot: (input: BuildAccountStateInput) => AccountStateSnapshot;
export interface BuildAccountConversionInput {
    session: AccountSession;
    state?: AccountStateSnapshot;
}
export declare const buildAccountConversionSnapshot: (input: BuildAccountConversionInput) => AccountConversionSnapshot;
