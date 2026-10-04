import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Code required" });

    const raw = await kv.get(`puzzle:${code}`);
    if (!raw) return res.status(404).json({ error: "Puzzle gak ketemu" });

    const puzzle = typeof raw === "string" ? JSON.parse(raw) : raw;
    return res.status(200).json(puzzle);
  } catch (err) {
    console.error("Get puzzle error:", err);
    return res.status(500).json({ error: "Gagal ambil puzzle" });
  }
}
