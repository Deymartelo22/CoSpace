import { NextResponse } from "next/server";
import type { z } from "zod";
import { AppError, type ErrorCode, type ErrorDetail } from "@/lib/errors";

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetail[];
  };
}

function toDetails(error: z.ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<z.output<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new AppError(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request data", toDetails(result.error));
  }
  return result.data;
}

export function errorResponse(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status },
    );
  }
  console.error("Unhandled error", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } },
    { status: 500 },
  );
}