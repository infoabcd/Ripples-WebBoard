import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { getBlockedUsernamePatterns, isUsernameBlocked } from "./blocked-usernames";

const original = process.env.REGISTRATION_BLOCKED_USERNAMES;

afterEach(() => {
  if (original === undefined) {
    delete process.env.REGISTRATION_BLOCKED_USERNAMES;
  } else {
    process.env.REGISTRATION_BLOCKED_USERNAMES = original;
  }
});

describe("blocked usernames", () => {
  it("matches exact patterns", () => {
    process.env.REGISTRATION_BLOCKED_USERNAMES = "admin,moderator";
    assert.equal(isUsernameBlocked("admin"), true);
    assert.equal(isUsernameBlocked("ADMIN"), true);
    assert.equal(isUsernameBlocked("adminx"), false);
  });

  it("matches wildcard patterns", () => {
    process.env.REGISTRATION_BLOCKED_USERNAMES = "mod*,*admin*";
    assert.equal(isUsernameBlocked("modtech"), true);
    assert.equal(isUsernameBlocked("superadmin"), true);
    assert.equal(isUsernameBlocked("trusted"), false);
  });

  it("parses comma-separated patterns", () => {
    process.env.REGISTRATION_BLOCKED_USERNAMES = " admin , mod* ";
    assert.deepEqual(getBlockedUsernamePatterns(), ["admin", "mod*"]);
  });
});
