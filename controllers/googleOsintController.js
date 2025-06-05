import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const CSE_ID = process.env.GOOGLE_CSE_ID;

const googleOsintController = async (query) => {
  console.log("🔍 Mencari OSINT untuk query:", query);

  if (!API_KEY || !CSE_ID) {
    return "API Key atau CSE ID tidak tersedia. Pastikan .env sudah benar.";
  }

  const customsearch = google.customsearch("v1");
  const maxResults = 30;
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

      if (startIndex > 91) break;
    }

    if (results.length === 0) {
      return "Tidak ditemukan hasil OSINT untuk query tersebut.";
    }

    const message = results
      .slice(0, maxResults)
      .map(
        (r, i) =>
          `*${i + 1}. ${r.title}*\n${r.link}\n_${(r.snippet || "-").substring(
            0,
            120
          )}_`
      )
      .join("\n\n");

    return `📊 Ditemukan ${results.length} hasil OSINT untuk kata kunci "${query}":\n\n${message}`;
  } catch (error) {
    console.error("Gagal mengambil data:", error.message);
    return "Terjadi kesalahan saat mengakses Google Search API.";
  }
};

export default googleOsintController;
