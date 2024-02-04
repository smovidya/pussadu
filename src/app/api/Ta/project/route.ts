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
  const { data: da_project } = await supabase.from("da_project").select();
  return NextResponse.json(da_project)
}

export async function POST(request: Request) {
    try {
        const req = await request.json();
        const project_id = req.project_id;
        const project_name = req.project_name;
        const auth_id = req.auth_id;
        const status = req.status;
        const { error } = await supabase.from("da_project").insert({project_id:project_id,project_name:project_name,auth_id:auth_id,status:status});
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
        const stu_id = req.stu_id;
        const full_name = req.full_name;
        const last_name = req.last_name;
        const email = req.email;
        const line_id = req.line_id;
        const phone = req.phone;
        const { error } = await supabase.from("da_user").update({full_name:full_name,last_name:last_name,email:email,line_id:line_id,phone:phone}).eq("stu_id", stu_id);
        if (error) {
            return NextResponse.json(error.message);
        }
        return NextResponse.json("Update success");
    } catch (error) {
        return NextResponse.json("Invalid JSON data");
    }
}
