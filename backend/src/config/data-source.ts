import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "@/config/env";
import { EmailVerificationToken } from "@/entities/email-verification-token.entity";
import { PasswordResetToken } from "@/entities/password-reset-token.entity";
import { Comment } from "@/entities/comment.entity";
import { Conversation } from "@/entities/conversation.entity";
import { Follow } from "@/entities/follow.entity";
import { Message } from "@/entities/message.entity";
import { PostReaction } from "@/entities/post-reaction.entity";
import { PostReport } from "@/entities/post-report.entity";
import { Post } from "@/entities/post.entity";
import { User } from "@/entities/user.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.name,
  entities: [
    User,
    EmailVerificationToken,
    PasswordResetToken,
    Post,
    PostReaction,
    PostReport,
    Comment,
    Follow,
    Conversation,
    Message,
  ],
  synchronize: false,
  logging: !env.isProduction ? ["error", "warn"] : ["error"],
});
