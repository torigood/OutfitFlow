import type { VercelRequest, VercelResponse } from "@vercel/node";

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || "";
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, display = "20", start = "1" } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "검색어가 필요합니다." });
  }

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return res.status(500).json({ error: "API 설정이 필요합니다." });
  }

  try {
    const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(
      query
    )}&display=${display}&start=${start}&sort=sim`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `네이버 API 오류: ${response.status}`,
      });
    }

    const data = await response.json();

    // HTML 태그 제거
    const items = data.items.map((item: any, index: number) => ({
      ...item,
      productId: item.productId || `${Date.now()}-${index}`,
      title: item.title.replace(/<\/?b>/g, ""),
    }));

    return res.status(200).json({
      total: data.total,
      start: data.start,
      display: data.display,
      items,
    });
  } catch (error) {
    console.error("네이버 쇼핑 API 오류:", error);
    return res.status(500).json({ error: "상품 검색 중 오류가 발생했습니다." });
  }
}
