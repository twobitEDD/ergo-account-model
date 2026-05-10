import assert from "node:assert/strict";
import test from "node:test";
import { buildAccountSession } from "./sessionBuilder";
import { buildAccountConversionSnapshot, buildAccountStateSnapshot } from "./accountState";

test("buildAccountStateSnapshot classifies guest/registered/wallet-bound states", () => {
  const guestSession = buildAccountSession({
    walletConnected: false,
    walletSource: null,
    ergoAddress: null,
    dynamicUser: null,
    accountId: null,
    vault: null,
    nautilusApiAvailable: false,
  });
  assert.equal(buildAccountStateSnapshot({ session: guestSession }).accountType, "GUEST");

  const registeredSession = buildAccountSession({
    walletConnected: false,
    walletSource: null,
    ergoAddress: null,
    dynamicUser: { userId: "acct_1", email: "registered@example.com" },
    accountId: "acct_1",
    vault: null,
    nautilusApiAvailable: false,
  });
  assert.equal(buildAccountStateSnapshot({ session: registeredSession }).accountType, "REGISTERED");

  const walletBoundSession = buildAccountSession({
    walletConnected: true,
    walletSource: "nautilus-direct",
    ergoAddress: "9wallet",
    dynamicUser: { userId: "acct_2" },
    accountId: "acct_2",
    vault: null,
    nautilusApiAvailable: true,
  });
  assert.equal(buildAccountStateSnapshot({ session: walletBoundSession }).accountType, "WALLET_BOUND");
});

test("buildAccountConversionSnapshot reports additive conversion posture", () => {
  const session = buildAccountSession({
    walletConnected: false,
    walletSource: null,
    ergoAddress: null,
    dynamicUser: { userId: "acct_guest", externalAuthRef: "dynamic:acct_guest" },
    accountId: null,
    externalAuthRef: "dynamic:acct_guest",
    vault: null,
    nautilusApiAvailable: true,
  });

  const conversion = buildAccountConversionSnapshot({ session });
  assert.equal(conversion.sourceType, "REGISTERED");
  assert.equal(conversion.targetType, "WALLET_BOUND");
  assert.equal(conversion.canBindWallet, true);
  assert.equal(conversion.canDetachFromExternalAuth, false);
  assert.equal(conversion.conversionState, "eligible");
});
