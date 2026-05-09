import type { AccountSigner, AccountSignerSnapshot, ResolveAccountSigners } from "./types";
export declare const buildDefaultSigners: ResolveAccountSigners;
export declare const resolveSignerSnapshot: (signers: AccountSigner[]) => AccountSignerSnapshot;
