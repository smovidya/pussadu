"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // remove all cookies
  const cookiesStore = cookies();
  cookiesStore.delete("first_name");
  cookiesStore.delete("last_name");
  cookiesStore.delete("student_id");
  return NextResponse.redirect(
    "https://account.it.chula.ac.th/logout?service=https://pussaduvidyacu.vercel.app/"
  );
}
