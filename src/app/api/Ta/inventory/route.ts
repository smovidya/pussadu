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
  const { data: da_inventory } = await supabase.from("da_inventory").select();
  return NextResponse.json(da_inventory)
}

export async function POST(request: Request) {
    try {
        const req = await request.json();
        const inventory_id = req.inventory_id;
        const inventory_name = req.inventory_name;
        const description = req.description;
        const amount = req.amount;
        const unit = req.unit;
        const type = req.type;
        const status = req.status;
        const borrower_name = req.borrower_name;
        const { error } = await supabase.from("da_inventory").insert({inventory_id:inventory_id,inventory_name:inventory_name,description:description,amount:amount,unit:unit,type:type,status:status,borrower_name:borrower_name});
        if (error) {
            return NextResponse.json(error.message);
        }
        return NextResponse.json("Insert success");
    } catch (error) {
        return NextResponse.json("Invalid JSON data");
    }
}

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        const inventory_id = req.inventory_id;
        const inventory_name = req.inventory_name;
        const created_at = req.created_at;
        const description = req.description;
        const amount = req.amount;
        const unit = req.unit;
        const type = req.type;
        const status = req.status;
        const borrower_name = req.borrower_name;
        const { error } = await supabase.from("da_inventory").update({inventory_name:inventory_name,created_at:created_at,description:description,amount:amount,unit:unit,type:type,status:status,borrower_name:borrower_name}).eq("inventory_id", inventory_id);
        if (error) {
            return NextResponse.json(error.message);
        }
        return NextResponse.json("Update success");
    } catch (error) {
        return NextResponse.json("Invalid JSON data");
    }
}
