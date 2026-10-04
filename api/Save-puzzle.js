import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, questions, answers, code } = req.body;
    if (!name || !questions || !answers || !code) {
      return res.status(400).json({ error: "Data gak lengkap" });
    }

    const puzzle = {
      name: String(name).substring(0, 15),
      questions,
      answers,
      createdAt: Date.now()
    };

    await kv.set(`puzzle:${code}`, JSON.stringify(puzzle), { ex: 60 * 60 * 24 * 30 });

    return res.status(200).json({ ok: true, code });
  } catch (err) {
    console.error("Save puzzle error:", err);
    return res.status(500).json({ error: "Gagal simpen puzzle" });
  }
}
