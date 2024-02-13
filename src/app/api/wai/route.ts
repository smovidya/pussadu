"use server";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
console.log("TESTTTTTTTTT",NEXT_PUBLIC_SUPABASE_URL);

const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  let { data: Item, error } = await supabase.from('Item').select('*');
  return NextResponse.json(Item);
}

export async function POST(request: Request) {
  const req = await request.json();
  const { data, error } = await supabase.from('Item').insert([
    { 
      Item_ID:req.Item_ID,
      Item_Name:req.Item_Name,
      Amount:req.Amount,
      Picture:req.Picture,
      Status:req.Status,
      Description:req.Description
    },
  ])
  .select()
  if(req.Item_ID==null||req.Item_Name==null||req.Amount==null||req.Status==null) return NextResponse.json("Incorrect information");
  else return NextResponse.json("Insert success saktee");
}

export async function PUT(request:Request) {
  const req= await request.json();
  const { data, error } = await supabase.from('Item').update({ other_column: 'otherValue' }).eq('some_column', 'someValue')
  .select()
          
}
export async function DELETE(request: Request) {
  const req= await request.json();
  const { error } = await supabase.from('Item').delete().eq('Item_ID', req.Item_ID);        
}