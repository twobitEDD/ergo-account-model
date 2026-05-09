import { AccountIdentity, AccountMigrationPlan, AccountProviderAdapter, AccountProviderKind } from "./types";
interface AdapterSnapshot {
    identity: AccountIdentity;
    migration: AccountMigrationPlan;
}
declare abstract class BaseAdapter implements AccountProviderAdapter {
    readonly provider: AccountProviderKind;
    protected readonly snapshot: AdapterSnapshot;
    constructor(provider: AccountProviderKind, snapshot: AdapterSnapshot);
    getIdentity(): AccountIdentity;
    getMigrationPlan(): AccountMigrationPlan;
}
export declare class DynamicAccountAdapter extends BaseAdapter {
    constructor(snapshot: AdapterSnapshot);
}
export declare class NautilusAccountAdapter extends BaseAdapter {
    constructor(snapshot: AdapterSnapshot);
}
export declare class VaultAccountAdapter extends BaseAdapter {
    constructor(snapshot: AdapterSnapshot);
}
export declare class NoneAccountAdapter extends BaseAdapter {
    constructor(snapshot: AdapterSnapshot);
}
export declare const buildAdapter: (snapshot: AdapterSnapshot) => AccountProviderAdapter;
export {};
