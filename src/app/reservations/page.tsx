import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";

export default async function ReservationsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const session = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!session) {
    redirect("/login");
  }

  redirect("/dashboard");
}

}