import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRateLimit } from "../src/config/ratelimit.js";

test("allows requests within the fair limit", async () => {
  const result = await evaluateRateLimit("test-user", {
    limit: 2,
    windowMs: 1000,
  });

  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 1);
});

test("blocks requests after the limit is reached", async () => {
  const key = "test-user-blocked";

  await evaluateRateLimit(key, { limit: 1, windowMs: 1000 });
  const second = await evaluateRateLimit(key, { limit: 1, windowMs: 1000 });

  assert.equal(second.allowed, false);
  assert.equal(second.remaining, 0);
});
