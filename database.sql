SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS kircle
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kircle;

CREATE TABLE IF NOT EXISTS users (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email                VARCHAR(255)    NOT NULL,
  username             VARCHAR(30)     NOT NULL COMMENT 'Public handle, 3-30 letters, digits or underscores. Uniqueness ignores case',
  username_changed_at  DATETIME(6)     NULL COMMENT 'Last username change. The next change must wait 14 days. NULL until the first change',
  password_hash        VARCHAR(255)    NULL,
  full_name            VARCHAR(100)    NOT NULL,
  bio                  VARCHAR(160)    NULL,
  avatar_url           VARCHAR(500)    NULL,
  google_id            VARCHAR(64)     NULL,
  email_verified_at    DATETIME(6)     NULL COMMENT 'NULL means the email is not verified yet',
  sessions_valid_after DATETIME(6)     NULL COMMENT 'Login sessions issued before this time are rejected',
  role                 ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT 'user is a member, admin can open the admin area',
  locked_at            DATETIME(6)     NULL COMMENT 'Set when an admin locks the account. NULL means it is not locked',
  created_at           DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_google_id (google_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)        NOT NULL COMMENT 'SHA-256 of the token sent by email',
  expires_at DATETIME(6)     NOT NULL,
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email_verification_tokens_token_hash (token_hash),
  KEY idx_email_verification_tokens_user_id (user_id),
  CONSTRAINT fk_email_verification_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)        NOT NULL COMMENT 'SHA-256 of the token sent by email',
  expires_at DATETIME(6)     NOT NULL,
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_reset_tokens_token_hash (token_hash),
  KEY idx_password_reset_tokens_user_id (user_id),
  CONSTRAINT fk_password_reset_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id               BIGINT UNSIGNED NOT NULL,
  content               TEXT            NOT NULL COMMENT 'Plain text, up to 5000 characters. Empty when a share has no caption',
  image_url             VARCHAR(500)    NULL COMMENT 'Public image URL for an original post. NULL when the post has no image',
  shared_post_id        BIGINT UNSIGNED NULL COMMENT 'Root original post when this row is a share',
  privacy               ENUM('public', 'followers', 'only_me') NOT NULL DEFAULT 'public' COMMENT 'Who can see this post besides the author',
  edited_at             DATETIME(6)     NULL COMMENT 'NULL means the post has never been edited',
  deleted_at            DATETIME(6)     NULL COMMENT 'Soft delete. NULL means the row was not deleted. A moderation removal sets this together with removed_by_moderation',
  removed_by_moderation TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '1 when an admin removed the post. The row stays so the feed can show that it was taken down',
  created_at            DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_posts_user_shared (user_id, shared_post_id) COMMENT 'One share per user per original post. Original posts keep shared_post_id NULL',
  KEY idx_posts_user_id_id (user_id, id),
  KEY idx_posts_shared_post_id (shared_post_id),
  CONSTRAINT fk_posts_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_shared_post
    FOREIGN KEY (shared_post_id) REFERENCES posts (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_reactions (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  type       ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') NOT NULL,
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_post_reactions_post_user (post_id, user_id) COMMENT 'One reaction per user per post',
  KEY idx_post_reactions_user_id (user_id),
  CONSTRAINT fk_post_reactions_post
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT fk_post_reactions_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  parent_id  BIGINT UNSIGNED NULL COMMENT 'NULL for top-level comments, set for replies (one level only)',
  content    TEXT            NOT NULL COMMENT 'Plain text, up to 2000 characters',
  edited_at  DATETIME(6)     NULL COMMENT 'NULL means the comment has never been edited',
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_post_parent_id (post_id, parent_id, id),
  KEY idx_comments_parent_id (parent_id, id),
  KEY idx_comments_user_id (user_id),
  CONSTRAINT fk_comments_post
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent
    FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_reports (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  target_type ENUM('post', 'comment') NOT NULL,
  post_id     BIGINT UNSIGNED NULL COMMENT 'Set for post reports. NULL once the post row is removed for good',
  comment_id  BIGINT UNSIGNED NULL COMMENT 'Set for comment reports. NULL once the comment is deleted',
  user_id     BIGINT UNSIGNED NOT NULL COMMENT 'The reporter',
  reason      ENUM('spam', 'sensitive', 'harassment', 'misinformation', 'other') NOT NULL,
  detail      VARCHAR(500)    NULL COMMENT 'Required when reason is other',
  status      ENUM('pending', 'approved', 'removed') NOT NULL DEFAULT 'pending' COMMENT 'pending is waiting, approved keeps the content, removed means the content is gone',
  created_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_content_reports_post_user (post_id, user_id),
  UNIQUE KEY uq_content_reports_comment_user (comment_id, user_id),
  KEY idx_content_reports_status_id (status, id),
  KEY idx_content_reports_user_id (user_id),
  CONSTRAINT fk_content_reports_post
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE SET NULL,
  CONSTRAINT fk_content_reports_comment
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE SET NULL,
  CONSTRAINT fk_content_reports_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_actions (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id          BIGINT UNSIGNED NOT NULL,
  admin_id           BIGINT UNSIGNED NULL COMMENT 'The admin who handled the report',
  decision           ENUM('approved', 'removed', 'closed') NOT NULL COMMENT 'closed means the content was already deleted before handling',
  note               VARCHAR(500)    NULL,
  is_automatic       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '1 when a removal also closed another pending report on the same content',
  content_snapshot   TEXT            NULL COMMENT 'Copy of the content taken when it was removed',
  snapshot_author_id BIGINT UNSIGNED NULL COMMENT 'Author of the removed content',
  created_at         DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_report_actions_report_id (report_id, id),
  KEY fk_report_actions_admin (admin_id),
  KEY fk_report_actions_snapshot_author (snapshot_author_id),
  CONSTRAINT fk_report_actions_report
    FOREIGN KEY (report_id) REFERENCES content_reports (id) ON DELETE CASCADE,
  CONSTRAINT fk_report_actions_admin
    FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_report_actions_snapshot_author
    FOREIGN KEY (snapshot_author_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS follows (
  follower_id  BIGINT UNSIGNED NOT NULL,
  following_id BIGINT UNSIGNED NOT NULL,
  created_at   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  KEY idx_follows_following_id (following_id),
  CONSTRAINT fk_follows_follower
    FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_follows_following
    FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversations (
  id                           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_low_id                  BIGINT UNSIGNED NOT NULL COMMENT 'Smaller user id of the pair, keeps one row per pair',
  user_high_id                 BIGINT UNSIGNED NOT NULL COMMENT 'Larger user id of the pair',
  last_message_id              BIGINT UNSIGNED NULL COMMENT 'NULL until the first message, such conversations stay hidden from lists',
  user_low_cleared_message_id  BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Messages up to this id are deleted for the low user. 0 means nothing was cleared',
  user_high_cleared_message_id BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Messages up to this id are deleted for the high user. 0 means nothing was cleared',
  created_at                   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conversations_pair (user_low_id, user_high_id),
  KEY idx_conversations_user_high (user_high_id, last_message_id),
  CONSTRAINT fk_conversations_user_low
    FOREIGN KEY (user_low_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_user_high
    FOREIGN KEY (user_high_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id       BIGINT UNSIGNED NOT NULL,
  content         TEXT            NOT NULL COMMENT 'Plain text, up to 5000 characters. Emptied when the message is recalled',
  seen_at         DATETIME(6)     NULL COMMENT 'NULL means the recipient has not opened the message yet',
  recalled_at     DATETIME(6)     NULL COMMENT 'Set when the sender recalls the message, content is emptied at the same time',
  created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_conversation_id_id (conversation_id, id),
  KEY idx_messages_sender_id (sender_id),
  CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

