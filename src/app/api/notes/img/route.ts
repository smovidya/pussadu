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

// get image and return image as url
export async function GET() {
  const { data} = supabase.storage
      .from("test")
      .getPublicUrl("reference.png");
  return NextResponse.json({ link: data });
}
