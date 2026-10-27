import { NextResponse, type NextRequest } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { errorResponse, parseBody } from "@/lib/http";
import { registerUser } from "@/services/auth.service";
import { registerSchema } from "@/validators/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const input = await parseBody(request, registerSchema);
    const session = await registerUser(input);
    const response = NextResponse.json({ user: session.user }, { status: 201 });
    setAuthCookies(response, session.tokens);
    return response;
  } catch (error: unknown) {
    return errorResponse(error);
  }
}