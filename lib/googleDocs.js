import { google } from "googleapis";
import { SECTIONS } from "./fields.js";

// Build a Google Auth client from environment variables (service account).
function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Google credentials missing. Set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY."
    );
  }

  // Vercel stores the key as a single line with escaped newlines.
  privateKey = privateKey.replace(/\\n/g, "\n");

  return new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

// Turn the submitted answers into one insertText request plus styling requests.
function buildRequests(data) {
  let content = "";
  const paragraphStyles = [];
  const boldRanges = [];

  function add(text, opts = {}) {
    const start = 1 + content.length;
    content += text;
    const end = 1 + content.length;
    if (opts.heading) {
      paragraphStyles.push({ start, end, namedStyleType: opts.heading });
    }
    if (opts.bold) {
      boldRanges.push({ start, end });
    }
  }

  add("Employment Application\n", { heading: "HEADING_1" });
  add(`Submitted ${new Date().toLocaleString("en-US")}\n\n`);

  for (const section of SECTIONS) {
    add(section.title + "\n", { heading: "HEADING_2" });
    for (const field of section.fields) {
      const raw = data[field.name];
      const value =
        raw === undefined || raw === null || String(raw).trim() === ""
          ? "—"
          : String(raw);
      add(field.label + ": ", { bold: true });
      add(value + "\n");
    }
    add("\n");
  }

  const requests = [{ insertText: { location: { index: 1 }, text: content } }];

  for (const p of paragraphStyles) {
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: p.start, endIndex: p.end },
        paragraphStyle: { namedStyleType: p.namedStyleType },
        fields: "namedStyleType",
      },
    });
  }
  for (const b of boldRanges) {
    requests.push({
      updateTextStyle: {
        range: { startIndex: b.start, endIndex: b.end },
        textStyle: { bold: true },
        fields: "bold",
      },
    });
  }

  return requests;
}

// Creates a Google Doc for one application and returns its share URL.
export async function createApplicationDoc(data) {
  const auth = getAuth();
  const docs = google.docs({ version: "v1", auth });
  const drive = google.drive({ version: "v3", auth });

  const stamp = data.date || new Date().toISOString().slice(0, 10);
  const title = `Employment Application — ${data.fullName || "Applicant"} — ${stamp}`;

  const created = await docs.documents.create({ requestBody: { title } });
  const documentId = created.data.documentId;

  await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests: buildRequests(data) },
  });

  // Optionally file it inside a specific Drive folder (recommended).
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (folderId) {
    await drive.files.update({
      fileId: documentId,
      addParents: folderId,
      fields: "id, parents",
      supportsAllDrives: true,
    });
  }

  // Give the recipient direct access so the emailed link opens for them.
  const recipient = process.env.NOTIFY_TO || "rgaid@ryzeagency.com";
  try {
    await drive.permissions.create({
      fileId: documentId,
      requestBody: { type: "user", role: "writer", emailAddress: recipient },
      sendNotificationEmail: false,
      supportsAllDrives: true,
    });
  } catch (err) {
    // Non-fatal: sharing can fail on personal Gmail accounts. The doc still exists.
    console.warn("Could not share document:", err.message);
  }

  const url = `https://docs.google.com/document/d/${documentId}/edit`;
  return { documentId, url };
}
