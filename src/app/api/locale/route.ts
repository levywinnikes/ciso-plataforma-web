import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { locale } = await request.json();
    cookies().set("NEXT_LOCALE", locale, { path: "/", maxAge: 31536000 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
