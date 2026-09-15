import webpush from "web-push";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    res.status(500).json({ error: "VAPID keys not configured on the server" });
    return;
  }

  webpush.setVapidDetails("mailto:trainer@example.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { subscriptions, title, body, url } = req.body || {};
  const valid = (subscriptions || []).filter((s) => s && s.endpoint);

  if (valid.length === 0) {
    res.status(200).json({ ok: true, sent: 0 });
    return;
  }

  const payload = JSON.stringify({ title: title || "Xcel Online PT", body: body || "", url: url || "/" });

  const results = await Promise.allSettled(
    valid.map((sub) => webpush.sendNotification(sub, payload))
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  res.status(200).json({ ok: true, sent, total: valid.length });
}
