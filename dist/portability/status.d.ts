import type { AccountSession } from "../types";
import type { MnemonicPortabilityStrategy, PortabilityStatus } from "./contracts";
export interface GetPortabilityStatusInput {
    session: AccountSession;
    mnemonicStrategy?: MnemonicPortabilityStrategy;
}
export declare const getPortabilityStatus: (input: GetPortabilityStatusInput) => PortabilityStatus;
