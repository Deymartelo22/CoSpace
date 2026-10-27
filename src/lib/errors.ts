export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "UNAUTHORIZED"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "EMAIL_TAKEN"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "INVALID_TIME"
  | "INVALID_DURATION"
  | "OUT_OF_HOURS"
  | "LIMIT_REACHED"
  | "OVERLAP"
  | "SPACE_NOT_FOUND"
  | "SPACE_INACTIVE"
  | "ALREADY_CANCELLED"
  | "CANNOT_CANCEL";

export interface ErrorDetail {
  path: string;
  message: string;
}

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: ErrorDetail[];

  constructor(status: number, code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}