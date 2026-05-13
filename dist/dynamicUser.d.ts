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
/**
 * Canonical Dynamic-backed identity fields consumed by `buildAccountSession`.
 * Any extra SDK fields remain on the app side; only this shape crosses the boundary.
 */
export interface DynamicUserInput {
    /** Dynamic user id / primary key when exposed as `id`. */
    readonly id?: string;
    /** Preferred stable user id from Dynamic (often `userId` in SDK v1). */
    readonly userId?: string;
    readonly email?: string;
    /** Explicit external auth ref, or app-composed `dynamic:<userId>`. */
    readonly externalAuthRef?: string;
    /** Primary EVM (or other) address when the app binds a wallet post-login. */
    readonly walletAddress?: string | null;
    /** Display handle when email is absent. */
    readonly username?: string | null;
}
/**
 * Maps a Dynamic React SDK–style `user` object (or any compatible plain record)
 * into {@link DynamicUserInput}. Returns `null` when no recognizable identifiers exist.
 *
 * Recognized keys (first match wins per field): `userId`, `id`, `email`,
 * `externalAuthRef`, `username`, `alias`.
 */
export declare function mapDynamicSdkUserToDynamicUserInput(user: unknown): DynamicUserInput | null;
