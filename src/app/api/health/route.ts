import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ciso-plataforma-web",
    timestamp: new Date().toISOString(),
  });
}
