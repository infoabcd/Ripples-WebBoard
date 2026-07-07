import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  checkAuthGuard,
  clearAuthGuard,
  recordAuthAttempt,
} from "./auth-rate-limit";

describe("auth rate limit", () => {
  it("blocks after max attempts in window", () => {
    const key = `test:block:${Date.now()}`;
    const opts = { maxAttempts: 3, windowMs: 60_000, lockoutMs: 120_000 };

    assert.equal(checkAuthGuard(key, opts).ok, true);
    recordAuthAttempt(key, opts.windowMs);
    recordAuthAttempt(key, opts.windowMs);
    assert.equal(checkAuthGuard(key, opts).ok, true);
    recordAuthAttempt(key, opts.windowMs);

    const blocked = checkAuthGuard(key, opts);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.ok(blocked.retryAfterSec > 0);
    }

    clearAuthGuard(key);
  });

  it("clears guard state on success path", () => {
    const key = `test:clear:${Date.now()}`;
    recordAuthAttempt(key, 60_000);
    clearAuthGuard(key);
    assert.equal(checkAuthGuard(key, { maxAttempts: 1, windowMs: 60_000, lockoutMs: 60_000 }).ok, true);
  });
});
