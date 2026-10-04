import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { code, nama, skor, total } = req.body;

    // Validasi
    if (!code || !nama || skor === undefined || !total) {
      return res.status(400).json({ error: "Data gak lengkap" });
    }

    // Bersihin nama
    const cleanName = String(nama).substring(0, 15).trim();
    if (!cleanName) return res.status(400).json({ error: "Nama kosong" });

    const entry = {
      nama: cleanName,
      skor: Number(skor),
      total: Number(total),
      time: Date.now()
    };

    // Simpen ke list berdasarkan code puzzle
    await kv.rpush(`rank:${code}`, JSON.stringify(entry));

    // Set expired 30 hari biar gak numpuk selamanya
    await kv.expire(`rank:${code}`, 60 * 60 * 24 * 30);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Save error:", err);
    return res.status(500).json({ error: "Gagal simpen skor" });
  }
}
