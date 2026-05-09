class BaseAdapter {
    constructor(provider, snapshot) {
        this.provider = provider;
        this.snapshot = snapshot;
    }
    getIdentity() {
        return this.snapshot.identity;
    }
    getMigrationPlan() {
        return this.snapshot.migration;
    }
}
export class DynamicAccountAdapter extends BaseAdapter {
    constructor(snapshot) {
        super("dynamic", snapshot);
    }
}
export class NautilusAccountAdapter extends BaseAdapter {
    constructor(snapshot) {
        super("nautilus", snapshot);
    }
}
export class VaultAccountAdapter extends BaseAdapter {
    constructor(snapshot) {
        super("vault", snapshot);
    }
}
export class NoneAccountAdapter extends BaseAdapter {
    constructor(snapshot) {
        super("none", snapshot);
    }
}
export const buildAdapter = (snapshot) => {
    if (snapshot.identity.provider === "dynamic") {
        return new DynamicAccountAdapter(snapshot);
    }
    if (snapshot.identity.provider === "nautilus") {
        return new NautilusAccountAdapter(snapshot);
    }
    if (snapshot.identity.provider === "vault") {
        return new VaultAccountAdapter(snapshot);
    }
    return new NoneAccountAdapter(snapshot);
};
