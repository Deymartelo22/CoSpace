import { NextResponse, type NextRequest } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";
import { errorResponse, parseBody } from "@/lib/http";
import { loginUser } from "@/services/auth.service";
import { loginSchema } from "@/validators/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const input = await parseBody(request, loginSchema);
    const session = await loginUser(input);
    const response = NextResponse.json({ user: session.user });
    setAuthCookies(response, session.tokens);
    return response;
  } catch (error: unknown) {
    return errorResponse(error);
  }
}