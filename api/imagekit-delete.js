export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { IMAGEKIT_PRIVATE_KEY } = process.env;
  if (!IMAGEKIT_PRIVATE_KEY) {
    res.status(500).json({ error: "ImageKit key not configured on the server" });
    return;
  }

  const { fileId } = req.body || {};
  if (!fileId) {
    res.status(400).json({ error: "Missing fileId" });
    return;
  }

  const auth = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString("base64");
  const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Basic ${auth}` },
  });

  if (response.ok || response.status === 204) {
    res.status(200).json({ ok: true });
  } else {
    const body = await response.text().catch(() => "");
    res.status(response.status).json({ ok: false, error: body });
  }
}
