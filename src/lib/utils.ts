import { headers } from "next/headers";

export async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const forwardedProto = headersList.get("x-forwarded-proto");
  const protocol =
    forwardedProto || (host?.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
