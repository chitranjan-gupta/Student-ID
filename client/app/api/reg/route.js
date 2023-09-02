import { NextResponse } from "next/server";

export async function GET(request) {
    const res = await fetch("http://localhost:5000/oobs/create-invitation", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const data = await res.json();
  return NextResponse.json(data)
}
