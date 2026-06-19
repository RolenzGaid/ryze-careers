import { NextResponse } from "next/server";
import { createApplicationDoc } from "../../../lib/googleDocs.js";
import { sendNotification } from "../../../lib/email.js";

// Serverless function on Vercel. Receives the form, writes the Doc, emails HR.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Minimal server-side validation for the required fields.
  const missing = ["fullName", "email", "phone", "date", "dob", "dateAvailable"].filter(
    (k) => !data?.[k] || String(data[k]).trim() === ""
  );
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const { url } = await createApplicationDoc(data);
    await sendNotification(url, data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Submission failed:", err);
    return NextResponse.json(
      { error: "We could not submit your application. Please try again shortly." },
      { status: 500 }
    );
  }
}
