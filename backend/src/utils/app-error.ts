export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED"
  | "EMAIL_ALREADY_EXISTS"
  | "USERNAME_ALREADY_EXISTS"
  | "USERNAME_CHANGE_TOO_SOON"
  | "EMAIL_PENDING_VERIFICATION"
  | "EMAIL_ALREADY_VERIFIED"
  | "INVALID_VERIFICATION_TOKEN"
  | "INVALID_RESET_TOKEN"
  | "INVALID_SESSION_REVOCATION_TOKEN"
  | "EMAIL_DELIVERY_FAILED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ACCOUNT_LOCKED"
  | "CANNOT_LOCK_ADMIN"
  | "CANNOT_SHARE_OWN_POST"
  | "CANNOT_SHARE_NON_PUBLIC_POST"
  | "CANNOT_REPORT_OWN_POST"
  | "CANNOT_REPORT_OWN_COMMENT"
  | "REPORT_ALREADY_HANDLED"
  | "REPORT_CONTENT_UNAVAILABLE"
  | "REPORT_CONTENT_AVAILABLE"
  | "CANNOT_FOLLOW_SELF"
  | "CANNOT_MESSAGE_SELF"
  | "MESSAGE_RECALL_EXPIRED"
  | "NOT_FOUND"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR";

export interface ErrorDetail {
  field: string;
  messages: string[];
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "AppError";
  }

  static validation(details: ErrorDetail[]): AppError {
    return new AppError(400, "VALIDATION_ERROR", "Request validation failed", details);
  }

  static invalidCredentials(): AppError {
    return new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  static emailNotVerified(): AppError {
    return new AppError(403, "EMAIL_NOT_VERIFIED", "Email address has not been verified");
  }

  static emailAlreadyExists(): AppError {
    return new AppError(409, "EMAIL_ALREADY_EXISTS", "Email is already registered");
  }

  static usernameAlreadyExists(): AppError {
    return new AppError(409, "USERNAME_ALREADY_EXISTS", "Username is already taken");
  }

  static usernameChangeTooSoon(): AppError {
    return new AppError(403, "USERNAME_CHANGE_TOO_SOON", "Username can only be changed once every 14 days");
  }

  static emailPendingVerification(): AppError {
    return new AppError(409, "EMAIL_PENDING_VERIFICATION", "Email is registered but not verified yet");
  }

  static emailAlreadyVerified(): AppError {
    return new AppError(409, "EMAIL_ALREADY_VERIFIED", "Email has already been verified");
  }

  static invalidVerificationToken(): AppError {
    return new AppError(400, "INVALID_VERIFICATION_TOKEN", "Verification link is invalid or has expired");
  }

  static invalidResetToken(): AppError {
    return new AppError(400, "INVALID_RESET_TOKEN", "Password reset link is invalid or has expired");
  }

  static invalidSessionRevocationToken(): AppError {
    return new AppError(400, "INVALID_SESSION_REVOCATION_TOKEN", "Session revocation request is invalid or has expired");
  }

  static emailDeliveryFailed(): AppError {
    return new AppError(502, "EMAIL_DELIVERY_FAILED", "Unable to send verification email");
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission to perform this action"): AppError {
    return new AppError(403, "FORBIDDEN", message);
  }

  static accountLocked(): AppError {
    return new AppError(403, "ACCOUNT_LOCKED", "This account has been locked");
  }

  static cannotLockAdmin(): AppError {
    return new AppError(403, "CANNOT_LOCK_ADMIN", "Admin accounts cannot be locked");
  }

  static cannotShareOwnPost(): AppError {
    return new AppError(403, "CANNOT_SHARE_OWN_POST", "You cannot share your own posts");
  }

  static cannotShareNonPublicPost(): AppError {
    return new AppError(403, "CANNOT_SHARE_NON_PUBLIC_POST", "Only public posts can be shared");
  }

  static cannotFollowSelf(): AppError {
    return new AppError(403, "CANNOT_FOLLOW_SELF", "You cannot follow yourself");
  }

  static cannotMessageSelf(): AppError {
    return new AppError(403, "CANNOT_MESSAGE_SELF", "You cannot message yourself");
  }

  static messageRecallExpired(): AppError {
    return new AppError(403, "MESSAGE_RECALL_EXPIRED", "Messages can only be recalled within 24 hours of sending");
  }

  static cannotReportOwnPost(): AppError {
    return new AppError(403, "CANNOT_REPORT_OWN_POST", "You cannot report your own posts");
  }

  static cannotReportOwnComment(): AppError {
    return new AppError(403, "CANNOT_REPORT_OWN_COMMENT", "You cannot report your own comments");
  }

  static reportAlreadyHandled(): AppError {
    return new AppError(409, "REPORT_ALREADY_HANDLED", "This report has already been handled");
  }

  static reportContentUnavailable(): AppError {
    return new AppError(409, "REPORT_CONTENT_UNAVAILABLE", "The reported content no longer exists");
  }

  static reportContentAvailable(): AppError {
    return new AppError(409, "REPORT_CONTENT_AVAILABLE", "The reported content still exists");
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(404, "NOT_FOUND", message);
  }
}
