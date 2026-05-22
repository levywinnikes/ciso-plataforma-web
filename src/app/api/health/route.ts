import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "integra-visao-web",
    timestamp: new Date().toISOString(),
  });
}
