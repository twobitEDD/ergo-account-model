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

const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

/**
 * Maps a Dynamic React SDK–style `user` object (or any compatible plain record)
 * into {@link DynamicUserInput}. Returns `null` when no recognizable identifiers exist.
 *
 * Recognized keys (first match wins per field): `userId`, `id`, `email`,
 * `externalAuthRef`, `username`, `alias`.
 */
export function mapDynamicSdkUserToDynamicUserInput(user: unknown): DynamicUserInput | null {
  if (user === null || user === undefined || typeof user !== "object") {
    return null;
  }
  const u = user as Record<string, unknown>;

  const userId = isNonEmptyString(u.userId) ? u.userId.trim() : undefined;
  const id = isNonEmptyString(u.id) ? u.id.trim() : undefined;
  const email = isNonEmptyString(u.email) ? u.email.trim() : undefined;
  const externalAuthRefRaw = isNonEmptyString(u.externalAuthRef) ? u.externalAuthRef.trim() : undefined;
  const username =
    (isNonEmptyString(u.username) ? u.username.trim() : undefined) ??
    (isNonEmptyString(u.alias) ? u.alias.trim() : undefined);

  const stableId = userId ?? id;
  const externalAuthRef =
    externalAuthRefRaw ?? (stableId ? `dynamic:${stableId}` : undefined);

  if (!stableId && !email && !externalAuthRefRaw) {
    return null;
  }

  const walletAddress =
    typeof u.walletAddress === "string"
      ? u.walletAddress
      : typeof u.primaryWalletAddress === "string"
        ? u.primaryWalletAddress
        : null;

  return {
    id,
    userId: userId ?? id,
    email,
    externalAuthRef,
    walletAddress: walletAddress ?? null,
    username: username ?? null,
  };
}
