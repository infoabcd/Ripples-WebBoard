import { getDb } from "@/server/db/client";
import { AuditLogRepository } from "./audit-log.repository";
import { BoardModeratorRepository } from "./board-moderator.repository";
import { BoardRepository } from "./board.repository";
import { FavoriteRepository } from "./favorite.repository";
import { InviteCodeRepository } from "./invite-code.repository";
import { LikeRepository } from "./like.repository";
import { NotificationRepository } from "./notification.repository";
import { ReplyRepository } from "./reply.repository";
import { ThreadRepository } from "./thread.repository";
import { UserRepository } from "./user.repository";

export type Repositories = {
  users: UserRepository;
  boards: BoardRepository;
  boardModerators: BoardModeratorRepository;
  threads: ThreadRepository;
  replies: ReplyRepository;
  likes: LikeRepository;
  favorites: FavoriteRepository;
  inviteCodes: InviteCodeRepository;
  notifications: NotificationRepository;
  auditLogs: AuditLogRepository;
};

let repositories: Repositories | null = null;

export function getRepositories(): Repositories {
  if (repositories) return repositories;
  const db = getDb();
  repositories = {
    users: new UserRepository(db),
    boards: new BoardRepository(db),
    boardModerators: new BoardModeratorRepository(db),
    threads: new ThreadRepository(db),
    replies: new ReplyRepository(db),
    likes: new LikeRepository(db),
    favorites: new FavoriteRepository(db),
    inviteCodes: new InviteCodeRepository(db),
    notifications: new NotificationRepository(db),
    auditLogs: new AuditLogRepository(db),
  };
  return repositories;
}
