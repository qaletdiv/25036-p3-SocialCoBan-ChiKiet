import { ApiError } from "@/lib/api-client";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
  EMAIL_NOT_VERIFIED: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email và bấm vào liên kết xác thực.",
  EMAIL_ALREADY_EXISTS: "Email này đã được sử dụng cho một tài khoản khác.",
  USERNAME_ALREADY_EXISTS: "Tên đăng nhập này đã có người dùng.",
  USERNAME_CHANGE_TOO_SOON: "Bạn cần đợi 14 ngày sau lần đổi tên đăng nhập gần nhất.",
  EMAIL_PENDING_VERIFICATION:
    "Email này đã được đăng ký nhưng chưa xác thực. Hãy đăng nhập để gửi lại email xác thực.",
  EMAIL_ALREADY_VERIFIED: "Email này đã được xác thực. Bạn có thể đăng nhập ngay.",
  INVALID_VERIFICATION_TOKEN: "Liên kết xác thực không hợp lệ hoặc đã hết hạn.",
  INVALID_RESET_TOKEN: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  INVALID_SESSION_REVOCATION_TOKEN: "Không thể đăng xuất các thiết bị khác vì yêu cầu đã hết hạn. Bạn có thể đăng nhập và đổi lại mật khẩu nếu cần.",
  EMAIL_DELIVERY_FAILED: "Không thể gửi email xác thực. Vui lòng thử lại sau.",
  NOT_FOUND: "Nội dung này không tồn tại hoặc đã bị xóa.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  ACCOUNT_LOCKED: "Tài khoản đã bị khóa. Bạn không thể đăng nhập hoặc dùng các chức năng cần tài khoản.",
  CANNOT_LOCK_ADMIN: "Không thể khóa tài khoản quản trị.",
  CANNOT_SHARE_OWN_POST: "Bạn không thể chia sẻ bài viết của chính mình.",
  CANNOT_SHARE_NON_PUBLIC_POST: "Chỉ bài viết công khai mới được chia sẻ.",
  CANNOT_REPORT_OWN_POST: "Bạn không thể báo cáo bài viết của chính mình.",
  CANNOT_REPORT_OWN_COMMENT: "Bạn không thể báo cáo bình luận của chính mình.",
  REPORT_ALREADY_HANDLED: "Báo cáo này đã được xử lý trước đó.",
  REPORT_CONTENT_UNAVAILABLE: "Nội dung này đã bị xóa nên không thể phê duyệt hoặc gỡ bỏ. Hãy đóng báo cáo.",
  REPORT_CONTENT_AVAILABLE: "Nội dung vẫn còn hiển thị nên không thể đóng báo cáo. Hãy phê duyệt hoặc gỡ bỏ.",
  CANNOT_FOLLOW_SELF: "Bạn không thể theo dõi chính mình.",
  CANNOT_MESSAGE_SELF: "Bạn không thể nhắn tin cho chính mình.",
  MESSAGE_RECALL_EXPIRED: "Chỉ có thể thu hồi tin nhắn trong vòng 24 giờ sau khi gửi.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  VALIDATION_ERROR: "Thông tin nhập vào chưa hợp lệ. Vui lòng kiểm tra lại.",
  TOO_MANY_REQUESTS: "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.",
  NETWORK_ERROR: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
};

const DEFAULT_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";

export const getErrorMessage = (error: unknown): string =>
  error instanceof ApiError ? (ERROR_MESSAGES[error.code] ?? DEFAULT_MESSAGE) : DEFAULT_MESSAGE;
