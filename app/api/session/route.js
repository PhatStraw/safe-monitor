import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from '../auth/[...nextauth]/options'

export async function GET(request) {
  const session = await getServerSession(options);
  return NextResponse.json({ session }, { status: 200 });
}
