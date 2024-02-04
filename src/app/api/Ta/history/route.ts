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
  const { data: da_log } = await supabase.from("da_log").select();
  return NextResponse.json(da_log)
}

export async function POST(request: Request) {
    try {
        const req = await request.json();
        const smo_id = req.smo_id;
        const inventory_id = req.inventory_id;
        const amount = req.amount;
        const return_date = req.return_date;
        const borrower_status = req.borrower_status;
        const { error } = await supabase.from("da_log").insert({smo_id:smo_id,inventory_id:inventory_id,amount:amount,return_date:return_date,borrower_status:borrower_status});
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
        const log_id = req.log_id;
        const smo_id = req.smo_id;
        const inventory_id = req.inventory_id;
        const amount = req.amount;
        const return_date = req.return_date;
        const borrower_status = req.borrower_status;
        const { error } = await supabase.from("da_log").update({smo_id:smo_id,inventory_id:inventory_id,amount:amount,return_date:return_date,borrower_status:borrower_status}).eq("log_id", log_id);
        if (error) {
            return NextResponse.json(error.message);
        }
        return NextResponse.json("Update success");
    } catch (error) {
        return NextResponse.json("Invalid JSON data");
    }
}
