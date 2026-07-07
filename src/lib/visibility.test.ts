import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SessionUser, Thread } from "./types";
import { isBoardModerator } from "./permissions";
import {
  canViewReply,
  canViewThread,
  getThreadVisibilityHint,
  visibilityLabel,
} from "./visibility";

const baseThread: Thread = {
  id: "t1",
  boardId: "b1",
  authorId: "u1",
  authorWasTrusted: false,
  title: "test",
  body: "body",
  imagePath: null,
  status: "pending",
  rejectReason: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  approvedAt: null,
  viewCount: 0,
};

const admin: SessionUser = {
  id: "a1",
  username: "admin",
  displayName: "Admin",
  role: "admin",
  isTrusted: true,
  moderatedBoardIds: [],
};

const mod: SessionUser = {
  id: "m1",
  username: "modtech",
  displayName: "Mod",
  role: "moderator",
  isTrusted: true,
  moderatedBoardIds: ["b1"],
};

describe("visibility", () => {
  it("approved threads are public", () => {
    const thread = { ...baseThread, status: "approved" as const };
    assert.equal(canViewThread(null, thread), true);
    assert.equal(getThreadVisibilityHint(thread), "public");
    assert.equal(visibilityLabel("public"), "");
  });

  it("untrusted pending threads are mods only", () => {
    const thread = { ...baseThread, authorWasTrusted: false };
    assert.equal(canViewThread(null, thread), false);
    assert.equal(canViewThread({ ...mod, moderatedBoardIds: [] }, thread), false);
    assert.equal(canViewThread(admin, thread), true);
    assert.equal(canViewThread(mod, thread), true);
    assert.equal(getThreadVisibilityHint(thread), "mods_only");
  });

  it("trusted pending threads are visible to members", () => {
    const thread = { ...baseThread, authorWasTrusted: true };
    const member = {
      id: "u2",
      username: "m",
      displayName: "M",
      role: "member" as const,
      isTrusted: false,
      moderatedBoardIds: [],
    };
    assert.equal(canViewThread(null, thread), false);
    assert.equal(canViewThread(member, thread), true);
    assert.equal(getThreadVisibilityHint(thread), "members_pending");
  });

  it("author can always view own thread", () => {
    const thread = { ...baseThread, authorWasTrusted: false };
    const author = {
      id: "u1",
      username: "a",
      displayName: "A",
      role: "member" as const,
      isTrusted: false,
      moderatedBoardIds: [],
    };
    assert.equal(canViewThread(author, thread), true);
  });

  it("rejected threads are author/admin/mod only", () => {
    const thread = { ...baseThread, status: "rejected" as const };
    const member = {
      id: "u2",
      username: "m",
      displayName: "M",
      role: "member" as const,
      isTrusted: true,
      moderatedBoardIds: [],
    };
    assert.equal(canViewThread(member, thread), false);
    assert.equal(canViewThread(mod, thread), true);
    assert.equal(getThreadVisibilityHint(thread), "author_only");
  });

  it("pending replies inherit thread visibility", () => {
    const thread = { ...baseThread, authorWasTrusted: true };
    const member = {
      id: "u2",
      username: "m",
      displayName: "M",
      role: "member" as const,
      isTrusted: false,
      moderatedBoardIds: [],
    };
    assert.equal(canViewReply(member, thread, "pending"), true);
    assert.equal(canViewReply(null, thread, "pending"), false);
  });
});

describe("permissions", () => {
  it("board moderator scope", () => {
    assert.equal(isBoardModerator(admin, "b1"), true);
    assert.equal(isBoardModerator(mod, "b1"), true);
    assert.equal(isBoardModerator(mod, "b2"), false);
  });
});
