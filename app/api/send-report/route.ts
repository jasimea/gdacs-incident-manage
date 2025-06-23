import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/report-generator";

const resend = new Resend("re_iP5MFbyU_8WbrCeDZmGSgjuXfazZnyewe");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, companyData, eventId } = body;

    if (!companyName || !companyData) {
      return NextResponse.json(
        { error: "Company name and data are required" },
        { status: 400 }
      );
    }

    // Create email content
    console.log("Generating report for event ID:", eventId);
    const emailContent = await generateReport(eventId);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "GDACS System <taqat@resend.dev>", // Replace with your verified domain
      to: ["jasimea@gmail.com", "info@taqat.qa"],
      subject: `Organization Report: ${companyName}`,
      html: emailContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Report sent successfully",
        emailId: data?.id,
        recipient: "jasimea@gmail.com",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
