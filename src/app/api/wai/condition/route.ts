"use server";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request:NextRequest) {
    const status = request.nextUrl.searchParams.get('status') ||  "";
    let { data: Item, error } = await supabase.from('Item').select("*").eq('Status', status)
    return NextResponse.json(Item);
}