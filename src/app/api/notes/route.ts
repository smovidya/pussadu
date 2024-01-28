"use server";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { data: notes } = await supabase.from("notes").select();
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const req = await request.json();
  const title = req.title || "";
  const { error } = await supabase.from("notes").insert({ title: title });
  if (error) {
    return NextResponse.json(error.message);
  }
  return NextResponse.json("Insert success");
}
