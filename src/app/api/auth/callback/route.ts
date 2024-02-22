"use server";

import { DeeAppId, DeeAppSecret } from "@/lib/constants";
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
  // Extract the ticket from the URL parameters
  const ticket = new URL(request.url).searchParams.get('ticket')
  console.log("Ticket debugging", ticket);

  if (!ticket) {
    // Handle the case where the ticket parameter is missing
    return new Response("Ticket parameter is missing", { status: 400 });
  }

  // Use the extracted ticket in your logic or validation
  const { status, message } = await serviceValidation(ticket);
  if (status === 200) {
    return NextResponse.redirect('https://pussaduvidyacu.vercel.app/')
  } else {
    return NextResponse.json({ message: message });
  }
}
