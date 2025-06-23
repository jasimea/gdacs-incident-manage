import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const emailContent = `
      <h2>Disaster Response Organization Report</h2>
      <p>A relevant organization has been identified for disaster response efforts.</p>
      
      <h3>Organization Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${companyData.name}</li>
        ${companyData.industry ? `<li><strong>Industry:</strong> ${companyData.industry}</li>` : ""}
        ${companyData.address ? `<li><strong>Address:</strong> ${companyData.address}</li>` : ""}
        ${companyData.phone ? `<li><strong>Phone:</strong> ${companyData.phone}</li>` : ""}
        ${companyData.website ? `<li><strong>Website:</strong> <a href="${companyData.website}">${companyData.website}</a></li>` : ""}
        ${companyData.foundedYear ? `<li><strong>Founded:</strong> ${companyData.foundedYear}</li>` : ""}
        ${companyData.relevanceScore ? `<li><strong>Relevance Score:</strong> ${companyData.relevanceScore}%</li>` : ""}
        ${companyData.suggestedRole ? `<li><strong>Suggested Role:</strong> ${companyData.suggestedRole}</li>` : ""}
      </ul>
      
      ${
        companyData.description
          ? `
        <h3>Description:</h3>
        <p>${companyData.description}</p>
      `
          : ""
      }
      
      ${
        companyData.headcountGrowth
          ? `
        <h3>Growth Metrics:</h3>
        <ul>
          <li>6 months: ${(companyData.headcountGrowth.sixMonth * 100).toFixed(1)}%</li>
          <li>12 months: ${(companyData.headcountGrowth.twelveMonth * 100).toFixed(1)}%</li>
          <li>24 months: ${(companyData.headcountGrowth.twentyFourMonth * 100).toFixed(1)}%</li>
        </ul>
      `
          : ""
      }
      
      <h3>Contact Information:</h3>
      <ul>
        ${companyData.linkedin ? `<li><strong>LinkedIn:</strong> <a href="${companyData.linkedin}">${companyData.linkedin}</a></li>` : ""}
        ${companyData.twitter ? `<li><strong>Twitter:</strong> <a href="${companyData.twitter}">${companyData.twitter}</a></li>` : ""}
        ${companyData.facebook ? `<li><strong>Facebook:</strong> <a href="${companyData.facebook}">${companyData.facebook}</a></li>` : ""}
      </ul>
      
      ${eventId ? `<p><strong>Event ID:</strong> ${eventId}</p>` : ""}
      
      <hr>
      <p><em>This report was generated automatically by the GDACS Incident Management System.</em></p>
    `;

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
