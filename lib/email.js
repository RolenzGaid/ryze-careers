// Sends the "someone has applied" notification with the Google Doc link.
// Uses Resend's REST API (no SDK dependency required).

export async function sendNotification(docUrl, data) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_TO || "rgaid@ryzeagency.com";
  const from = process.env.NOTIFY_FROM || "Ryze Careers <careers@ryzeagency.com>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY missing. Add it in your environment variables.");
  }

  const who = data.fullName ? ` (${data.fullName})` : "";
  const text = `someone has applied${who}\n\n${docUrl}`;
  const html =
    `<p>someone has applied${who}</p>` +
    `<p><a href="${docUrl}">${docUrl}</a></p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "New employment application",
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Email send failed (${res.status}): ${detail}`);
  }
}
