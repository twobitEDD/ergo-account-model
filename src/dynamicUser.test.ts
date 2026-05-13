import assert from "node:assert/strict";
import test from "node:test";

import { mapDynamicSdkUserToDynamicUserInput } from "./dynamicUser";

test("mapDynamicSdkUserToDynamicUserInput returns null for empty / non-object", () => {
  assert.equal(mapDynamicSdkUserToDynamicUserInput(null), null);
  assert.equal(mapDynamicSdkUserToDynamicUserInput(undefined), null);
  assert.equal(mapDynamicSdkUserToDynamicUserInput("x"), null);
  assert.equal(mapDynamicSdkUserToDynamicUserInput({}), null);
});

test("mapDynamicSdkUserToDynamicUserInput maps userId and email", () => {
  const m = mapDynamicSdkUserToDynamicUserInput({ userId: "u_1", email: "a@b.co" });
  assert.deepEqual(m, {
    id: undefined,
    userId: "u_1",
    email: "a@b.co",
    externalAuthRef: "dynamic:u_1",
    walletAddress: null,
    username: null,
  });
});

test("mapDynamicSdkUserToDynamicUserInput prefers explicit externalAuthRef", () => {
  const m = mapDynamicSdkUserToDynamicUserInput({
    id: "id1",
    externalAuthRef: "custom:abc",
  });
  assert.equal(m?.externalAuthRef, "custom:abc");
  assert.equal(m?.userId, "id1");
});

test("mapDynamicSdkUserToDynamicUserInput reads wallet and username aliases", () => {
  const m = mapDynamicSdkUserToDynamicUserInput({
    userId: "u2",
    primaryWalletAddress: "0xabc",
    alias: "player1",
  });
  assert.equal(m?.walletAddress, "0xabc");
  assert.equal(m?.username, "player1");
});
