import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import * as tokensModule from "@/lib/auth/tokens";

vi.mock("@/lib/auth/tokens", () => ({
  verifyAccessToken: vi.fn(),
}));

describe("Proxy Route Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe redirigir al login si un usuario sin sesión intenta entrar a /dashboard", async () => {
    vi.mocked(tokensModule.verifyAccessToken).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/dashboard");
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?next=%2Fdashboard");
  });

  it("debe redirigir al login si un usuario sin sesión intenta entrar a /admin", async () => {
    vi.mocked(tokensModule.verifyAccessToken).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/admin");
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?next=%2Fadmin");
  });

  it("debe redirigir a /dashboard si un usuario con rol USER intenta acceder a /admin", async () => {
    vi.mocked(tokensModule.verifyAccessToken).mockResolvedValue({
      sub: "user-123",
      role: "USER",
    });

    const request = new NextRequest("http://localhost:3000/admin", {
      headers: {
        cookie: "cospace_access=valid-token",
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("debe permitir el acceso si un usuario con rol ADMIN entra a /admin", async () => {
    vi.mocked(tokensModule.verifyAccessToken).mockResolvedValue({
      sub: "admin-123",
      role: "ADMIN",
    });

    const request = new NextRequest("http://localhost:3000/admin", {
      headers: {
        cookie: "cospace_access=admin-token",
      },
    });

    const response = await proxy(request);

    // NextResponse.next() no es redirect
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("debe permitir el acceso si un usuario autenticado entra a /dashboard", async () => {
    vi.mocked(tokensModule.verifyAccessToken).mockResolvedValue({
      sub: "user-123",
      role: "USER",
    });

    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: "cospace_access=user-token",
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});

