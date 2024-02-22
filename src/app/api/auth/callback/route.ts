"use server";

import { DeeAppId, DeeAppSecret } from "@/lib/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const serviceValidation = async (ticket: string) => {
  try {
    const url = "https://account.it.chula.ac.th/serviceValidation";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        DeeAppId: DeeAppId,
        DeeAppSecret: DeeAppSecret,
        DeeTicket: ticket,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-type": "application/json",
      },
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      return {
        status: 200,
        message: jsonResponse,
      };
    } else {
      const jsonResponse = await response.json();
      return {
        status: response.status,
        message: jsonResponse,
      };
    }
  } catch (error) {
    return {
      status: 500,
      message: error,
    };
  }
};

export async function GET(request: Request) {
  const ticket = new URL(request.url).searchParams.get("ticket");

  if (!ticket) {
    // Handle the case where the ticket parameter is missing
    return new Response("Ticket parameter is missing", { status: 400 });
  }

  // Use the extracted ticket in your logic or validation
  const { status, message } = await serviceValidation(ticket);
  if (status === 200 && message !== null) {
    const datas = message;

    // Set cookies
    const cookieStore = cookies();
    cookieStore.set("first_name", datas.firstname);
    cookieStore.set("last_name", datas.lastname);
    cookieStore.set("student_id", datas.ouid);

    // Go to the profile
    return NextResponse.redirect("https://pussaduvidyacu.vercel.app/profile");
  } else {
    return NextResponse.json({ message: message });
  }
}
