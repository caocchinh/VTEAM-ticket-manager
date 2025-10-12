/**
 * Error constants for consistent error handling across the application
 */

// Error codes for routing and user feedback
export const ERROR_CODES = {
  NOT_STUDENT: "not-student",
  NOT_LOGGED_IN: "not-logged-in",
  SALES_INFO_FETCH_FAILED: "sales-info-fetch-failed",
  SESSION_VERIFICATION_FAILED: "session-verification-failed",
  UNAUTHORIZED: "unauthorized",
  INVALID_STUDENT_CREDENTIALS: "invalid-student-credentials",
  TICKET_INFO_FETCH_FAILED: "ticket-info-fetch-failed",
  MISSING_REQUIRED_FIELDS: "missing-required-fields",
  INVALID_FILE_TYPE: "invalid-file-type",
  FILE_SIZE_TOO_LARGE: "file-size-too-large",
  DUPLICATE_ORDER: "duplicate-order",
  STUDENT_LIST_FETCH_FAILED: "student-list-fetch-failed",
  FILE_UPLOAD_FAILED: "file-upload-failed",
  ORDER_SUBMISSION_FAILED: "order-submission-failed",
  CACHE_ERROR: "cache-error",
  INTERNAL_SERVER_ERROR: "internal-server-error",
  UNKNOWN_ERROR: "unknown-error",
  ORDER_NOT_FOUND: "order-not-found",
  R2_CREDENTIALS_MISSING: "r2-credentials-missing",
  EVENT_INFO_FETCH_FAILED: "event-info-fetch-failed",
  TEACHER_VERIFICATION_FETCH_FAILED: "teacher-verification-fetch-failed",
  INVALID_TICKET_TYPE: "invalid-ticket-type",
  TICKETS_SOLD_OUT: "tickets-sold-out",
} as const;

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.NOT_STUDENT]:
    "Bạn không phải là học sinh của Vinschool Central Park",
  [ERROR_CODES.NOT_LOGGED_IN]: "Xác thực thất bại. Vui lòng thử đăng nhập lại.",
  [ERROR_CODES.SALES_INFO_FETCH_FAILED]:
    "Không thể lấy thông tin bán vé. Vui lòng thử lại sau.",
  [ERROR_CODES.SESSION_VERIFICATION_FAILED]:
    "Không thể xác minh phiên đăng nhập. Vui lòng thử đăng nhập lại.",
  [ERROR_CODES.UNAUTHORIZED]: "Bạn không có quyền truy cập",
  [ERROR_CODES.INVALID_STUDENT_CREDENTIALS]:
    "Thông tin học sinh không hợp lệ. Vui lòng xác minh tài khoản của bạn.",
  [ERROR_CODES.TICKET_INFO_FETCH_FAILED]:
    "Không thể lấy thông tin vé. Vui lòng thử lại sau.",
  [ERROR_CODES.MISSING_REQUIRED_FIELDS]:
    "Vui lòng điền đầy đủ các trường bắt buộc",
  [ERROR_CODES.INVALID_FILE_TYPE]:
    "Loại file không hợp lệ. Vui lòng chỉ tải lên hình ảnh PNG, JPEG, JPG, WEBP hoặc AVIF.",
  [ERROR_CODES.FILE_SIZE_TOO_LARGE]:
    "Kích thước file quá lớn. Kích thước tối đa cho phép là 100MB mỗi file.",
  [ERROR_CODES.DUPLICATE_ORDER]:
    "Bạn đã gửi đơn hàng với những thông tin này rồi",
  [ERROR_CODES.STUDENT_LIST_FETCH_FAILED]:
    "Không thể xác minh thông tin học sinh. Vui lòng thử lại sau.",
  [ERROR_CODES.FILE_UPLOAD_FAILED]: "Không thể tải lên file. Vui lòng thử lại.",
  [ERROR_CODES.ORDER_SUBMISSION_FAILED]:
    "Gửi đơn hàng thất bại. Vui lòng thử lại sau.",
  [ERROR_CODES.CACHE_ERROR]: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]:
    "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.",
  [ERROR_CODES.UNKNOWN_ERROR]:
    "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
  [ERROR_CODES.ORDER_NOT_FOUND]:
    "Không tìm thấy đơn hàng cho tài khoản của bạn",
  [ERROR_CODES.R2_CREDENTIALS_MISSING]:
    "Thông tin xác thực lưu trữ file không được cấu hình đúng cách",
  [ERROR_CODES.EVENT_INFO_FETCH_FAILED]:
    "Không thể lấy thông tin sự kiện. Vui lòng thử lại sau.",
  [ERROR_CODES.TEACHER_VERIFICATION_FETCH_FAILED]:
    "Không thể lấy thông tin GVCN xác nhận. Vui lòng thử lại sau.",
  [ERROR_CODES.INVALID_TICKET_TYPE]:
    "Loại vé không hợp lệ. Vui lòng chọn loại vé hợp lệ.",
  [ERROR_CODES.TICKETS_SOLD_OUT]:
    "Một hoặc nhiều loại vé đã hết. Vui lòng chọn loại vé khác.",
} as const;

// HTTP status codes for API responses
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error response structure for API endpoints
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

// Success response structure for server actions
export interface ActionSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

// Error response structure for server actions
export interface ActionErrorResponse {
  success: false;
  message: string;
  code?: string;
}

// Union type for server action responses
export type ActionResponse<T = unknown> =
  | ActionSuccessResponse<T>
  | ActionErrorResponse;

/**
 * Helper function to create consistent API error responses
 */
export function createApiError(
  code: keyof typeof ERROR_CODES,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  details?: string
): Response {
  const errorCode = ERROR_CODES[code];
  const message = ERROR_MESSAGES[errorCode];

  const response: ApiErrorResponse = {
    error: message,
    code: errorCode,
    ...(details && { details }),
  };

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Helper function to create consistent server action error responses
 */
export function createActionError(
  code: keyof typeof ERROR_CODES,
  customMessage?: string
): ActionErrorResponse {
  const errorCode = ERROR_CODES[code];
  const message = customMessage || ERROR_MESSAGES[errorCode];

  return {
    success: false,
    message,
    code: errorCode,
  };
}

/**
 * Helper function to create consistent server action success responses
 */
export function createActionSuccess<T = unknown>(
  data?: T
): ActionSuccessResponse<T> {
  return {
    success: true,
    ...(data && { data }),
  };
}

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(errorCode: string): string {
  return (
    ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] ||
    ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
  );
}

// Type exports
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
