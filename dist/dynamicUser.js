/**
 * Dynamic.xyz bridge types (no runtime dependency on `@dynamic-labs/*`).
 *
 * Downstream apps using Dynamic’s React SDK typically receive a `user` object
 * from `useDynamicContext()`. This module defines the **account-model contract**
 * subset we persist into `buildAccountSession({ dynamicUser })` and server
 * bootstrap payloads, plus a small structural mapper for common SDK shapes.
 *
 * @see https://docs.dynamic.xyz/react/reference/quickstart
 */
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
/**
 * Maps a Dynamic React SDK–style `user` object (or any compatible plain record)
 * into {@link DynamicUserInput}. Returns `null` when no recognizable identifiers exist.
 *
 * Recognized keys (first match wins per field): `userId`, `id`, `email`,
 * `externalAuthRef`, `username`, `alias`.
 */
export function mapDynamicSdkUserToDynamicUserInput(user) {
    var _a;
    if (user === null || user === undefined || typeof user !== "object") {
        return null;
    }
    const u = user;
    const userId = isNonEmptyString(u.userId) ? u.userId.trim() : undefined;
    const id = isNonEmptyString(u.id) ? u.id.trim() : undefined;
    const email = isNonEmptyString(u.email) ? u.email.trim() : undefined;
    const externalAuthRefRaw = isNonEmptyString(u.externalAuthRef) ? u.externalAuthRef.trim() : undefined;
    const username = (_a = (isNonEmptyString(u.username) ? u.username.trim() : undefined)) !== null && _a !== void 0 ? _a : (isNonEmptyString(u.alias) ? u.alias.trim() : undefined);
    const stableId = userId !== null && userId !== void 0 ? userId : id;
    const externalAuthRef = externalAuthRefRaw !== null && externalAuthRefRaw !== void 0 ? externalAuthRefRaw : (stableId ? `dynamic:${stableId}` : undefined);
    if (!stableId && !email && !externalAuthRefRaw) {
        return null;
    }
    const walletAddress = typeof u.walletAddress === "string"
        ? u.walletAddress
        : typeof u.primaryWalletAddress === "string"
            ? u.primaryWalletAddress
            : null;
    return {
        id,
        userId: userId !== null && userId !== void 0 ? userId : id,
        email,
        externalAuthRef,
        walletAddress: walletAddress !== null && walletAddress !== void 0 ? walletAddress : null,
        username: username !== null && username !== void 0 ? username : null,
    };
}
