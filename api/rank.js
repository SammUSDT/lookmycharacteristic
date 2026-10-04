import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Code required" });

    const raw = await kv.lrange(`rank:${code}`, 0, -1);
    const data = raw.map(r => typeof r === "string" ? JSON.parse(r) : r);
    data.sort((a, b) => b.skor - a.skor || a.time - b.time);

    return res.status(200).json(data);
  } catch (err) {
    console.error("Rank error:", err);
    return res.status(500).json({ error: "Gagal ambil ranking" });
  }
}
