const { google } = require("googleapis");
require("dotenv").config();

const API_KEY = process.env.GOOGLE_API_KEY;
const CSE_ID = process.env.GOOGLE_CSE_ID;

async function googleOsintController(query) {
  console.log("🔍 Mencari OSINT untuk query:", query);

  if (!API_KEY || !CSE_ID) {
    return "API Key atau CSE ID tidak tersedia. Pastikan .env sudah benar.";
  }

  const customsearch = google.customsearch("v1");
  const maxResults = 100;
  const results = [];
  let startIndex = 1;

  try {
    while (results.length < maxResults) {
      const res = await customsearch.cse.list({
        auth: API_KEY,
        cx: CSE_ID,
        q: `intext:"${query}"`,
        start: startIndex,
        num: 10,
      });

      const items = res.data.items || [];
      if (items.length === 0) break;

      results.push(...items);
      startIndex += 10;

      // Hindari lebih dari batas 100 (maks dari Google API)
      if (startIndex > 91) break;
    }

    if (results.length === 0) {
      return "Tidak ditemukan hasil OSINT untuk query tersebut.";
    }

    return (
      `📊 Ditemukan ${results.length} hasil OSINT:\n\n` +
      results
        .map(
          (r, i) => `*${i + 1}. ${r.title}*\n${r.link}\n_${r.snippet || "-"}_`
        )
        .join("\n\n")
    );
  } catch (error) {
    console.error("Gagal mengambil data:", error.message);
    return "Terjadi kesalahan saat mengakses Google Search API.";
  }
}

module.exports = googleOsintController;
