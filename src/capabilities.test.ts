import assert from "node:assert/strict";
import test from "node:test";
import { buildProgressiveAccountCapabilities } from "./capabilities";

test("progressive capabilities keep free play non-blocking once session is active", () => {
  const capabilities = buildProgressiveAccountCapabilities({
    sessionActive: true,
    walletBound: false,
  });
  assert.equal(capabilities.layers.freePlay.eligible, true);
  assert.equal(capabilities.layers.rewards.walletRequirement, "recommended");
  assert.equal(capabilities.layers.rewards.eligible, true);
  assert.equal(capabilities.layers.wagering.walletRequirement, "required");
  assert.equal(capabilities.layers.wagering.eligible, false);
});

test("required rewards mode blocks rewards until wallet is bound", () => {
  const beforeWallet = buildProgressiveAccountCapabilities({
    sessionActive: true,
    walletBound: false,
    rewardsWalletRequirement: "required",
  });
  assert.equal(beforeWallet.layers.rewards.eligible, false);

  const afterWallet = buildProgressiveAccountCapabilities({
    sessionActive: true,
    walletBound: true,
    rewardsWalletRequirement: "required",
  });
  assert.equal(afterWallet.layers.rewards.eligible, true);
  assert.equal(afterWallet.layers.wagering.eligible, true);
});
