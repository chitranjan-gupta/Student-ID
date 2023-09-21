"use client";
import { NextResponse } from "next/server";

export async function GET(request) {
  const res = await fetch("https://studentid.onrender.com/oobs/create-invitation", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const data = await res.json();
  return NextResponse.json(data)
}
